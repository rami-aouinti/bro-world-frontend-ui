import { createError } from "h3";
import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import Redis from "ioredis";
import type { FetchError } from "ofetch";
import type {
  SiteContentBlock,
  SiteLanguageDefinition,
  SiteLocalizedSettings,
  SiteMenuItem,
  SiteProfileSettings,
  SiteSettings,
  SiteThemeDefinition,
  SiteUiSettings,
} from "~/types/settings";
import { defaultSiteSettings, getDefaultSiteSettings } from "~/lib/settings/defaults";
import {
  defaultLanguageCode,
  getSupportedLanguage,
  supportedLanguageCodes,
  supportedLanguageOrder,
  supportedLanguages,
} from "~/lib/i18n/languages";
import { getSessionToken, getSessionUser } from "../auth/session";
import { requestWithRetry } from "../requestWithRetry";

const CONFIGURATION_KEY = "site.settings";
const CONFIGURATION_CONTEXT_KEY = "global";
const MEMORY_TTL_MS = 15_000;

const globalScope = globalThis as typeof globalThis & {
  __broSettingsCache?: Map<string, { value: SiteSettings; expiresAt: number }>;
  __broSettingsRedisClient?: Redis | null;
  __broSettingsRedisClientPromise?: Promise<Redis | null> | null;
};

interface RedisSettingsConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  settingsTtl: number;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || crypto.randomUUID()
  );
}

function getRedisConfig(event?: H3Event): RedisSettingsConfig {
  const runtime = event ? useRuntimeConfig(event) : useRuntimeConfig();
  const redis = (runtime.redis ?? {}) as Partial<RedisSettingsConfig & { keyPrefix?: string }>;

  const ttl =
    Number.isFinite(redis.settingsTtl) && Number(redis.settingsTtl) > 0
      ? Number(redis.settingsTtl)
      : 300;

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    settingsTtl: ttl,
  } satisfies RedisSettingsConfig;
}

function getRedisKey(config: RedisSettingsConfig, cacheKey: string): string {
  return `${config.keyPrefix}:site-settings:${cacheKey}`;
}

async function getRedisClient(): Promise<Redis | null> {
  const config = getRedisConfig();

  if (!config.url) {
    return null;
  }

  if (globalScope.__broSettingsRedisClient) {
    return globalScope.__broSettingsRedisClient;
  }

  if (!globalScope.__broSettingsRedisClientPromise) {
    globalScope.__broSettingsRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[settings-storage] Redis client error", error);
        });

        await client.connect();
        globalScope.__broSettingsRedisClient = client;
        return client;
      } catch (error) {
        console.error("[settings-storage] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broSettingsRedisClient) {
          globalScope.__broSettingsRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broSettingsRedisClientPromise;

  if (!client) {
    globalScope.__broSettingsRedisClientPromise = null;
  }

  return client;
}

function getMemoryCache(): Map<string, { value: SiteSettings; expiresAt: number }> {
  if (!globalScope.__broSettingsCache) {
    globalScope.__broSettingsCache = new Map();
  }

  return globalScope.__broSettingsCache;
}

function readFromMemory(cacheKey: string): SiteSettings | null {
  const cache = getMemoryCache();
  const cached = cache.get(cacheKey);

  if (!cached || cached.expiresAt <= Date.now()) {
    if (cached) {
      cache.delete(cacheKey);
    }
    return null;
  }

  return structuredClone(cached.value);
}

function writeToMemory(cacheKey: string, settings: SiteSettings): void {
  const cache = getMemoryCache();
  cache.set(cacheKey, {
    value: structuredClone(settings),
    expiresAt: Date.now() + MEMORY_TTL_MS,
  });
}

async function readFromRedisCache(cacheKey: string): Promise<SiteSettings | null> {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getRedisConfig();

  try {
    const raw = await client.get(getRedisKey(config, cacheKey));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SiteSettings;
    return ensureActiveThemeId(normalizeSettings(parsed));
  } catch (error) {
    console.error("[settings-storage] Failed to read settings from Redis", error);
    return null;
  }
}

async function writeToRedisCache(cacheKey: string, settings: SiteSettings): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getRedisConfig();

  try {
    await client.set(
      getRedisKey(config, cacheKey),
      JSON.stringify(settings),
      "EX",
      config.settingsTtl,
    );
  } catch (error) {
    console.error("[settings-storage] Failed to persist settings to Redis", error);
  }
}

async function invalidateRedisCache(cacheKey: string): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getRedisConfig();

  try {
    await client.del(getRedisKey(config, cacheKey));
  } catch (error) {
    console.error("[settings-storage] Failed to invalidate Redis cache", error);
  }
}

function mergeContentBlock(
  block: SiteContentBlock | null | undefined,
  fallback: SiteContentBlock,
): SiteContentBlock {
  if (!block) {
    return structuredClone(fallback);
  }

  return {
    title: block.title?.trim() || fallback.title,
    subtitle: block.subtitle?.toString().trim() || fallback.subtitle || null,
    body: block.body?.toString().trim() || fallback.body || null,
    updatedAt: block.updatedAt ?? fallback.updatedAt,
  } satisfies SiteContentBlock;
}

function sanitizeTheme(theme: Partial<SiteThemeDefinition>): SiteThemeDefinition {
  const name = theme.name?.trim() || "Untitled theme";
  const id = theme.id?.trim() || slugify(name);

  return {
    id,
    name,
    description: theme.description?.trim() || null,
    primaryColor: theme.primaryColor?.trim() || "#7C3AED",
    accentColor: theme.accentColor?.trim() || "#F472B6",
    surfaceColor: theme.surfaceColor?.trim() || "#F4F7FC",
  } satisfies SiteThemeDefinition;
}

function sanitizeMenu(menu: Partial<SiteMenuItem>, order: number): SiteMenuItem {
  const label = menu.label?.trim();

  if (!label) {
    throw createError({
      statusCode: 400,
      statusMessage: "Menu label is required",
    });
  }

  const id = menu.id?.trim() || slugify(label);
  const isVisible = menu.isVisible !== false;
  const requiresAdmin = menu.requiresAdmin === true;
  const translate = menu.translate === true;
  const to = menu.to?.trim() || null;
  const icon = menu.icon?.trim() || null;

  const children = Array.isArray(menu.children)
    ? menu.children
        .map((child, index) => ({ child, index }))
        .filter(({ child }) => child && typeof child === "object")
        .map(({ child, index }) => sanitizeMenu(child, index))
    : [];

  return {
    id,
    label,
    icon,
    to,
    requiresAdmin,
    translate,
    isVisible,
    order,
    children,
  } satisfies SiteMenuItem;
}

function sanitizeProfileSettings(
  payload: Partial<SiteProfileSettings> | null | undefined,
  current: SiteProfileSettings,
): SiteProfileSettings {
  const source = current ?? defaultSiteSettings.profile;

  return {
    allowCustomization: payload?.allowCustomization ?? source.allowCustomization,
    allowAvatarUploads: payload?.allowAvatarUploads ?? source.allowAvatarUploads,
    allowCoverUploads: payload?.allowCoverUploads ?? source.allowCoverUploads,
    allowThemeSelection: payload?.allowThemeSelection ?? source.allowThemeSelection,
    showContactSection: payload?.showContactSection ?? source.showContactSection,
    showDetailsSection: payload?.showDetailsSection ?? source.showDetailsSection,
    showSocialSection: payload?.showSocialSection ?? source.showSocialSection,
    defaultBio:
      payload?.defaultBio === undefined
        ? (source.defaultBio ?? null)
        : payload.defaultBio?.trim() || null,
  } satisfies SiteProfileSettings;
}

function sanitizeUiSettings(
  payload: Partial<SiteUiSettings> | null | undefined,
  current: SiteUiSettings,
): SiteUiSettings {
  const source = current ?? defaultSiteSettings.ui;

  const requestedMode = payload?.defaultThemeMode;
  const normalizedMode: "light" | "dark" | "system" =
    requestedMode === "light" || requestedMode === "dark" || requestedMode === "system"
      ? requestedMode
      : source.defaultThemeMode;

  return {
    allowThemeSwitching: payload?.allowThemeSwitching ?? source.allowThemeSwitching,
    defaultThemeMode: normalizedMode,
  } satisfies SiteUiSettings;
}

function sanitizeContentBlock(
  payload: Partial<SiteContentBlock> | null | undefined,
  current: SiteContentBlock,
  fallback: SiteContentBlock,
): SiteContentBlock {
  const source = current ?? fallback;

  const title =
    payload?.title !== undefined
      ? payload.title?.toString().trim() || fallback.title
      : (source.title ?? fallback.title);
  const subtitle =
    payload?.subtitle !== undefined
      ? payload.subtitle?.toString().trim() || null
      : (source.subtitle ?? fallback.subtitle ?? null);
  const body =
    payload?.body !== undefined
      ? payload.body?.toString().trim() || null
      : (source.body ?? fallback.body ?? null);

  const hasChanges =
    (payload?.title !== undefined && title !== (source.title ?? fallback.title)) ||
    (payload?.subtitle !== undefined &&
      subtitle !== (source.subtitle ?? fallback.subtitle ?? null)) ||
    (payload?.body !== undefined && body !== (source.body ?? fallback.body ?? null));

  return {
    title,
    subtitle,
    body,
    updatedAt: hasChanges ? new Date().toISOString() : (source.updatedAt ?? fallback.updatedAt),
  } satisfies SiteContentBlock;
}

type LanguageCandidate = Partial<
  Pick<SiteLanguageDefinition, "code" | "label" | "endonym" | "enabled">
>;

const supportedLanguageMap = new Map(
  supportedLanguages.map((language) => [language.code, language] as const),
);

function sortLanguages(languages: SiteLanguageDefinition[]): SiteLanguageDefinition[] {
  return [...languages].sort((a, b) => {
    const orderA = supportedLanguageOrder.get(a.code) ?? Number.MAX_SAFE_INTEGER;
    const orderB = supportedLanguageOrder.get(b.code) ?? Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      return a.code.localeCompare(b.code);
    }

    return orderA - orderB;
  });
}

function sanitizeLanguageCandidate(
  candidate: LanguageCandidate | null | undefined,
): SiteLanguageDefinition | null {
  if (!candidate) {
    return null;
  }

  const rawCode = candidate.code;
  const code = typeof rawCode === "string" ? rawCode.trim() : "";

  if (!code || !supportedLanguageCodes.includes(code)) {
    return null;
  }

  const meta = supportedLanguageMap.get(code) ?? getSupportedLanguage(code);

  const labelSource =
    typeof candidate.label === "string" && candidate.label.trim()
      ? candidate.label.trim()
      : meta?.label;
  const endonymSource =
    typeof candidate.endonym === "string" && candidate.endonym.trim()
      ? candidate.endonym.trim()
      : meta?.endonym;

  const label = labelSource ?? endonymSource ?? code.toUpperCase();
  const endonym = endonymSource ?? label;
  const enabled = candidate.enabled !== false;

  return {
    code,
    label,
    endonym,
    enabled,
  } satisfies SiteLanguageDefinition;
}

function resolveLanguages(
  requested: LanguageCandidate[] | undefined,
  fallback: SiteLanguageDefinition[],
): SiteLanguageDefinition[] {
  const normalized: SiteLanguageDefinition[] = [];
  const seen = new Set<string>();

  const candidates = Array.isArray(requested) && requested.length ? requested : fallback;

  for (const candidate of candidates) {
    const sanitized = sanitizeLanguageCandidate(candidate);
    if (!sanitized || seen.has(sanitized.code)) continue;
    normalized.push(sanitized);
    seen.add(sanitized.code);
  }

  for (const fallbackEntry of fallback) {
    if (seen.has(fallbackEntry.code)) continue;
    const sanitized = sanitizeLanguageCandidate(fallbackEntry);
    if (!sanitized) continue;
    normalized.push(sanitized);
    seen.add(sanitized.code);
  }

  if (!normalized.length) {
    for (const language of supportedLanguages) {
      if (seen.has(language.code)) continue;
      const sanitized = sanitizeLanguageCandidate(language);
      if (!sanitized) continue;
      normalized.push(sanitized);
      seen.add(sanitized.code);
    }
  }

  return sortLanguages(normalized);
}

function resolveDefaultLanguage(
  requested: string | undefined,
  languages: SiteLanguageDefinition[],
  fallback: string,
): string {
  const normalizedRequest = typeof requested === "string" ? requested.trim() : "";

  if (
    normalizedRequest &&
    languages.some((language) => language.code === normalizedRequest && language.enabled)
  ) {
    return normalizedRequest;
  }

  const normalizedFallback = typeof fallback === "string" ? fallback.trim() : "";

  if (
    normalizedFallback &&
    languages.some((language) => language.code === normalizedFallback && language.enabled)
  ) {
    return normalizedFallback;
  }

  const firstEnabled = languages.find((language) => language.enabled);
  if (firstEnabled) {
    return firstEnabled.code;
  }

  return languages[0]?.code ?? defaultLanguageCode;
}

function ensureDefaultLanguagePresence(
  languages: SiteLanguageDefinition[],
  defaultLanguage: string,
): SiteLanguageDefinition[] {
  const hasDefault = languages.some((language) => language.code === defaultLanguage);
  let normalized = languages;

  if (!hasDefault) {
    const candidate = sanitizeLanguageCandidate({ code: defaultLanguage });
    if (candidate) {
      normalized = sortLanguages([...normalized, { ...candidate, enabled: true }]);
    }
  }

  return normalized.map((language) =>
    language.code === defaultLanguage ? { ...language, enabled: true } : language,
  );
}

function normalizeLanguages(
  requestedLanguages: LanguageCandidate[] | undefined,
  requestedDefault: string | undefined,
  fallbackLanguages: SiteLanguageDefinition[],
  fallbackDefault: string,
): { languages: SiteLanguageDefinition[]; defaultLanguage: string } {
  const resolved = resolveLanguages(requestedLanguages, fallbackLanguages);
  const defaultLanguage = resolveDefaultLanguage(requestedDefault, resolved, fallbackDefault);
  const normalized = ensureDefaultLanguagePresence(resolved, defaultLanguage);

  return {
    languages: normalized,
    defaultLanguage,
  };
}

function sanitizeLocalizedTagline(
  payload: string | null | undefined,
  current: string | null | undefined,
  fallback: string | null | undefined,
): string | null {
  if (payload === undefined) {
    return current ?? fallback ?? null;
  }

  if (payload === null) {
    return null;
  }

  const trimmed = String(payload).trim();
  return trimmed || null;
}

function cloneContentBlock(block: SiteContentBlock): SiteContentBlock {
  return structuredClone(block);
}

function createLocalizedDefaults(
  defaults: SiteSettings,
  languageCode: string,
  defaultTagline: string | null,
  defaultPages: SiteSettings["pages"],
): SiteLocalizedSettings {
  const source =
    defaults.localized?.[languageCode] ?? defaults.localized?.[defaults.defaultLanguage];

  return {
    tagline: defaultTagline ?? source?.tagline ?? defaults.tagline ?? null,
    pages: {
      about: cloneContentBlock(defaultPages.about),
      contact: cloneContentBlock(defaultPages.contact),
      help: cloneContentBlock(defaultPages.help),
    },
  } satisfies SiteLocalizedSettings;
}

function sanitizeLocalizedEntry(
  languageCode: string,
  payload: SiteLocalizedSettings | undefined,
  fallback: SiteLocalizedSettings | undefined,
  defaults: SiteSettings,
  defaultTagline: string | null,
  defaultPages: SiteSettings["pages"],
): SiteLocalizedSettings {
  const baseline =
    fallback ??
    defaults.localized?.[languageCode] ??
    defaults.localized?.[defaults.defaultLanguage];

  const tagline = sanitizeLocalizedTagline(
    payload?.tagline,
    baseline?.tagline ??
      defaults.localized?.[defaults.defaultLanguage]?.tagline ??
      defaults.tagline ??
      null,
    defaultTagline ?? defaults.tagline ?? null,
  );

  const fallbackPages =
    baseline?.pages ?? defaults.localized?.[defaults.defaultLanguage]?.pages ?? defaults.pages;

  return {
    tagline,
    pages: {
      about: sanitizeContentBlock(
        payload?.pages?.about,
        fallbackPages.about ?? defaults.pages.about,
        defaults.pages.about,
      ),
      contact: sanitizeContentBlock(
        payload?.pages?.contact,
        fallbackPages.contact ?? defaults.pages.contact,
        defaults.pages.contact,
      ),
      help: sanitizeContentBlock(
        payload?.pages?.help,
        fallbackPages.help ?? defaults.pages.help,
        defaults.pages.help,
      ),
    },
  } satisfies SiteLocalizedSettings;
}

function sanitizeLocalizedSettingsMap(
  localized: Record<string, SiteLocalizedSettings> | undefined,
  fallback: Record<string, SiteLocalizedSettings> | undefined,
  languages: SiteLanguageDefinition[],
  defaults: SiteSettings,
  defaultLanguage: string,
  defaultTagline: string | null,
  defaultPages: SiteSettings["pages"],
): Record<string, SiteLocalizedSettings> {
  const allowed = new Set(languages.map((language) => language.code));
  const fallbackSource = fallback ?? defaults.localized ?? {};
  const result: Record<string, SiteLocalizedSettings> = {};

  for (const code of allowed) {
    const payloadEntry = localized?.[code];
    const fallbackEntry = fallbackSource[code];

    if (!payloadEntry && !fallbackEntry) {
      result[code] = createLocalizedDefaults(defaults, code, defaultTagline, defaultPages);
      continue;
    }

    result[code] = sanitizeLocalizedEntry(
      code,
      payloadEntry,
      fallbackEntry,
      defaults,
      defaultTagline,
      defaultPages,
    );
  }

  const ensuredDefault =
    result[defaultLanguage] ??
    createLocalizedDefaults(defaults, defaultLanguage, defaultTagline, defaultPages);

  result[defaultLanguage] = {
    ...ensuredDefault,
    tagline: defaultTagline ?? ensuredDefault.tagline ?? defaults.tagline ?? null,
    pages: {
      about: cloneContentBlock(defaultPages.about),
      contact: cloneContentBlock(defaultPages.contact),
      help: cloneContentBlock(defaultPages.help),
    },
  } satisfies SiteLocalizedSettings;

  return result;
}

function normalizeSettings(settings: SiteSettings): SiteSettings {
  const defaults = getDefaultSiteSettings();

  const { languages: normalizedLanguages, defaultLanguage } = normalizeLanguages(
    settings.languages as LanguageCandidate[] | undefined,
    settings.defaultLanguage,
    defaults.languages,
    defaults.defaultLanguage ?? defaultLanguageCode,
  );

  const normalizedThemes = (settings.themes?.length ? settings.themes : defaults.themes).map(
    (theme) => ({
      ...sanitizeTheme(theme),
    }),
  );

  const menusSource = settings.menus?.length ? settings.menus : defaults.menus;
  const sortedMenus = [...menusSource].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const normalizedMenus = sortedMenus.map((menu, index) => sanitizeMenu(menu, index));

  const normalizedProfile = sanitizeProfileSettings(settings.profile, defaults.profile);
  const normalizedUi = sanitizeUiSettings(settings.ui, defaults.ui);

  const normalizedPages = {
    about: mergeContentBlock(settings.pages?.about, defaults.pages.about),
    contact: mergeContentBlock(settings.pages?.contact, defaults.pages.contact),
    help: mergeContentBlock(settings.pages?.help, defaults.pages.help),
  } as SiteSettings["pages"];

  const normalizedSiteName = settings.siteName?.trim() || defaults.siteName;
  const normalizedTagline = settings.tagline?.trim() || null;
  const normalizedActiveThemeId = settings.activeThemeId?.trim() || defaults.activeThemeId;

  const normalizedLocalized = sanitizeLocalizedSettingsMap(
    settings.localized,
    defaults.localized,
    normalizedLanguages,
    defaults,
    defaultLanguage,
    normalizedTagline,
    normalizedPages,
  );

  const updatedAt = settings.updatedAt ?? defaults.updatedAt ?? new Date().toISOString();

  return {
    ...defaults,
    ...settings,
    siteName: normalizedSiteName,
    tagline: normalizedTagline,
    activeThemeId: normalizedActiveThemeId,
    themes: normalizedThemes,
    menus: normalizedMenus,
    profile: normalizedProfile,
    ui: normalizedUi,
    pages: normalizedPages,
    defaultLanguage,
    languages: normalizedLanguages,
    localized: normalizedLocalized,
    updatedAt,
  } satisfies SiteSettings;
}

function ensureActiveThemeId(settings: SiteSettings): SiteSettings {
  if (!settings.themes.length) {
    settings.themes = [...defaultSiteSettings.themes.map((theme) => ({ ...theme }))];
  }

  if (!settings.activeThemeId) {
    settings.activeThemeId = settings.themes[0]?.id ?? defaultSiteSettings.activeThemeId;
  }

  if (!settings.themes.some((theme) => theme.id === settings.activeThemeId)) {
    settings.activeThemeId = settings.themes[0]?.id ?? defaultSiteSettings.activeThemeId;
  }

  return settings;
}

function resolveCacheKey(event: H3Event | undefined) {
  const userId = event ? (getSessionUser(event)?.id ?? null) : null;
  const cacheKey = userId ? `user:${userId}` : "default";

  return { cacheKey, userId };
}

function resolveConfigurationApiBase(event: H3Event): string {
  const runtime = useRuntimeConfig(event);
  const base = runtime.configuration?.apiBase ?? "https://configuration.bro-world.org/api";

  return base.replace(/\/$/, "");
}

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(
    error && typeof error === "object" && "response" in (error as Record<string, unknown>),
  );
}

async function readFromConfigurationApi(event: H3Event): Promise<SiteSettings | null> {
  const token = getSessionToken(event);

  if (!token) {
    return null;
  }

  const base = resolveConfigurationApiBase(event);
  const url = `${base}/v1/platform/configuration/${encodeURIComponent(CONFIGURATION_KEY)}`;

  try {
    const response = await requestWithRetry<{
      configurationValue?: { _value?: SiteSettings };
      updatedAt?: string;
    }>("GET", url, { token });

    const value = response?.configurationValue?._value;

    if (!value) {
      return null;
    }

    const withTimestamps: SiteSettings = {
      ...value,
      updatedAt: value.updatedAt ?? response.updatedAt ?? new Date().toISOString(),
    };

    return ensureActiveThemeId(normalizeSettings(withTimestamps));
  } catch (error) {
    if (isFetchError(error)) {
      const status = error.response?.status ?? 0;

      if (status === 404) {
        return null;
      }

      if (status === 401 || status === 403) {
        return null;
      }
    }

    console.error("[settings-storage] Failed to fetch settings from configuration API", error);
    return null;
  }
}

async function persistToConfigurationApi(
  event: H3Event,
  settings: SiteSettings,
): Promise<SiteSettings> {
  const token = getSessionToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const base = resolveConfigurationApiBase(event);
  const url = `${base}/v1/platform/configuration`;

  try {
    const response = await requestWithRetry<{
      configurationValue?: { _value?: SiteSettings };
      updatedAt?: string;
    }>("POST", url, {
      token,
      body: {
        configurationKey: CONFIGURATION_KEY,
        contextKey: CONFIGURATION_CONTEXT_KEY,
        configurationValue: {
          _value: settings,
        },
      },
    });

    const value = response?.configurationValue?._value ?? settings;

    const withTimestamps: SiteSettings = {
      ...value,
      updatedAt:
        value.updatedAt ?? response.updatedAt ?? settings.updatedAt ?? new Date().toISOString(),
    };

    return ensureActiveThemeId(normalizeSettings(withTimestamps));
  } catch (error) {
    if (isFetchError(error)) {
      const status = error.response?.status ?? 500;

      throw createError({
        statusCode: status,
        statusMessage: "Unable to persist settings",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to persist settings",
    });
  }
}

async function cacheSettings(cacheKey: string, settings: SiteSettings): Promise<void> {
  writeToMemory(cacheKey, settings);
  await writeToRedisCache(cacheKey, settings);
}

async function invalidateCache(cacheKey: string): Promise<void> {
  const cache = getMemoryCache();
  cache.delete(cacheKey);
  await invalidateRedisCache(cacheKey);
}

export async function getSiteSettings(event: H3Event): Promise<SiteSettings> {
  const { cacheKey } = resolveCacheKey(event);

  const memoryCached = readFromMemory(cacheKey);

  if (memoryCached) {
    return memoryCached;
  }

  const redisCached = await readFromRedisCache(cacheKey);

  if (redisCached) {
    writeToMemory(cacheKey, redisCached);
    return redisCached;
  }

  let fetched: SiteSettings | null = null;

  if (event) {
    fetched = await readFromConfigurationApi(event);
  }

  const normalized = ensureActiveThemeId(normalizeSettings(fetched ?? getDefaultSiteSettings()));

  await cacheSettings(cacheKey, normalized);

  return normalized;
}

export async function updateSiteSettings(
  event: H3Event,
  payload: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const { cacheKey, userId } = resolveCacheKey(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const current = await getSiteSettings(event);
  const defaults = getDefaultSiteSettings();

  const { languages: normalizedLanguages, defaultLanguage } = normalizeLanguages(
    payload.languages as LanguageCandidate[] | undefined,
    payload.defaultLanguage,
    current.languages?.length ? current.languages : defaults.languages,
    current.defaultLanguage ?? defaults.defaultLanguage ?? defaultLanguageCode,
  );

  const normalizedTagline =
    payload.tagline === undefined ? (current.tagline ?? null) : payload.tagline?.trim() || null;

  const normalizedPages: SiteSettings["pages"] = {
    about: sanitizeContentBlock(payload.pages?.about, current.pages.about, defaults.pages.about),
    contact: sanitizeContentBlock(
      payload.pages?.contact,
      current.pages.contact,
      defaults.pages.contact,
    ),
    help: sanitizeContentBlock(payload.pages?.help, current.pages.help, defaults.pages.help),
  };

  const normalizedLocalized = sanitizeLocalizedSettingsMap(
    payload.localized,
    current.localized,
    normalizedLanguages,
    defaults,
    defaultLanguage,
    normalizedTagline,
    normalizedPages,
  );

  const next: SiteSettings = {
    ...current,
    siteName: payload.siteName?.trim() || current.siteName,
    tagline: normalizedTagline,
    activeThemeId: payload.activeThemeId?.trim() || current.activeThemeId,
    themes: payload.themes?.length
      ? payload.themes.map((theme) => sanitizeTheme(theme)).filter(Boolean)
      : current.themes.map((theme) => ({ ...theme })),
    menus: payload.menus?.length
      ? payload.menus.map((menu, index) => sanitizeMenu(menu, index))
      : current.menus.map((menu, index) => sanitizeMenu(menu, index)),
    profile: sanitizeProfileSettings(payload.profile, current.profile ?? defaults.profile),
    ui: sanitizeUiSettings(payload.ui, current.ui ?? defaults.ui),
    pages: normalizedPages,
    defaultLanguage,
    languages: normalizedLanguages,
    localized: normalizedLocalized,
    updatedAt: new Date().toISOString(),
  } satisfies SiteSettings;

  const ensured = ensureActiveThemeId(next);

  const persisted = await persistToConfigurationApi(event, ensured);

  await invalidateCache(cacheKey);
  await cacheSettings(cacheKey, persisted);

  return persisted;
}
