import { createError } from "h3";
import { useRuntimeConfig } from "#imports";
import Redis from "ioredis";
import { useStorage } from "nitropack/runtime";
import type {
  SiteContentBlock,
  SiteMenuItem,
  SiteProfileSettings,
  SiteSettings,
  SiteThemeDefinition,
  SiteUiSettings,
} from "~/types/settings";
import { defaultSiteSettings, getDefaultSiteSettings } from "~/lib/settings/defaults";

const STORAGE_KEY = "site-settings";
const MEMORY_TTL_MS = 15_000;
let seedPromise: Promise<void> | null = null;

const globalScope = globalThis as typeof globalThis & {
  __broSettingsCache?: { value: SiteSettings; expiresAt: number } | null;
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

function getRedisConfig(): RedisSettingsConfig {
  const runtime = useRuntimeConfig();
  const redis = (runtime.redis ?? {}) as Partial<RedisSettingsConfig & { keyPrefix?: string }>;

  const ttl = Number.isFinite(redis.settingsTtl) && Number(redis.settingsTtl) > 0 ? Number(redis.settingsTtl) : 300;

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix: typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    settingsTtl: ttl,
  } satisfies RedisSettingsConfig;
}

function getRedisKey(config: RedisSettingsConfig): string {
  return `${config.keyPrefix}:site-settings`;
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

async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const storage = useStorage();
      const existing = await storage.getItem<SiteSettings | null>(STORAGE_KEY);
      if (!existing) {
        const seeded = getDefaultSiteSettings();
        await storage.setItem(STORAGE_KEY, seeded);
      }
    })();
  }

  await seedPromise;
}

async function readFromDatabase(): Promise<SiteSettings> {
  await ensureSeed();
  const storage = useStorage();
  const stored = await storage.getItem<SiteSettings | null>(STORAGE_KEY);

  if (!stored) {
    return getDefaultSiteSettings();
  }

  return stored;
}

async function writeToDatabase(settings: SiteSettings): Promise<void> {
  const storage = useStorage();
  await storage.setItem(STORAGE_KEY, settings);
}

function readFromMemory(): SiteSettings | null {
  const cache = globalScope.__broSettingsCache;

  if (!cache || cache.expiresAt <= Date.now()) {
    return null;
  }

  return structuredClone(cache.value);
}

function writeToMemory(settings: SiteSettings): void {
  globalScope.__broSettingsCache = {
    value: structuredClone(settings),
    expiresAt: Date.now() + MEMORY_TTL_MS,
  };
}

async function readFromRedisCache(): Promise<SiteSettings | null> {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getRedisConfig();

  try {
    const raw = await client.get(getRedisKey(config));

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

async function writeToRedisCache(settings: SiteSettings): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getRedisConfig();

  try {
    await client.set(getRedisKey(config), JSON.stringify(settings), "EX", config.settingsTtl);
  } catch (error) {
    console.error("[settings-storage] Failed to persist settings to Redis", error);
  }
}

async function invalidateRedisCache(): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getRedisConfig();

  try {
    await client.del(getRedisKey(config));
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
      payload?.defaultBio === undefined ? source.defaultBio ?? null : payload.defaultBio?.trim() || null,
  } satisfies SiteProfileSettings;
}

function sanitizeUiSettings(
  payload: Partial<SiteUiSettings> | null | undefined,
  current: SiteUiSettings,
): SiteUiSettings {
  const source = current ?? defaultSiteSettings.ui;

  const requestedMode = payload?.defaultThemeMode;
  const normalizedMode:
    | "light"
    | "dark"
    | "system" =
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
    payload?.title !== undefined ? payload.title?.toString().trim() || fallback.title : source.title ?? fallback.title;
  const subtitle =
    payload?.subtitle !== undefined
      ? payload.subtitle?.toString().trim() || null
      : source.subtitle ?? fallback.subtitle ?? null;
  const body =
    payload?.body !== undefined
      ? payload.body?.toString().trim() || null
      : source.body ?? fallback.body ?? null;

  const hasChanges =
    (payload?.title !== undefined && title !== (source.title ?? fallback.title)) ||
    (payload?.subtitle !== undefined && subtitle !== (source.subtitle ?? fallback.subtitle ?? null)) ||
    (payload?.body !== undefined && body !== (source.body ?? fallback.body ?? null));

  return {
    title,
    subtitle,
    body,
    updatedAt: hasChanges ? new Date().toISOString() : source.updatedAt ?? fallback.updatedAt,
  } satisfies SiteContentBlock;
}

function normalizeSettings(settings: SiteSettings): SiteSettings {
  const defaults = getDefaultSiteSettings();

  const normalizedThemes = (settings.themes?.length ? settings.themes : defaults.themes).map((theme) => ({
    ...sanitizeTheme(theme),
  }));

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

  const updatedAt = settings.updatedAt ?? defaults.updatedAt ?? new Date().toISOString();

  return {
    ...defaults,
    ...settings,
    siteName: settings.siteName?.trim() || defaults.siteName,
    tagline: settings.tagline?.trim() || null,
    activeThemeId: settings.activeThemeId?.trim() || defaults.activeThemeId,
    themes: normalizedThemes,
    menus: normalizedMenus,
    profile: normalizedProfile,
    ui: normalizedUi,
    pages: normalizedPages,
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

async function cacheSettings(settings: SiteSettings): Promise<void> {
  writeToMemory(settings);
  await writeToRedisCache(settings);
}

async function invalidateCache(): Promise<void> {
  globalScope.__broSettingsCache = null;
  await invalidateRedisCache();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const memoryCached = readFromMemory();

  if (memoryCached) {
    return memoryCached;
  }

  const redisCached = await readFromRedisCache();

  if (redisCached) {
    writeToMemory(redisCached);
    return redisCached;
  }

  const stored = await readFromDatabase();
  const normalized = ensureActiveThemeId(normalizeSettings(stored));

  await cacheSettings(normalized);

  return normalized;
}

export async function updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const currentStored = await readFromDatabase();
  const current = ensureActiveThemeId(normalizeSettings(currentStored));
  const defaults = getDefaultSiteSettings();

  const next: SiteSettings = {
    ...current,
    siteName: payload.siteName?.trim() || current.siteName,
    tagline: payload.tagline === undefined ? current.tagline ?? null : payload.tagline?.trim() || null,
    activeThemeId: payload.activeThemeId?.trim() || current.activeThemeId,
    themes: payload.themes?.length
      ? payload.themes.map((theme) => sanitizeTheme(theme)).filter(Boolean)
      : current.themes.map((theme) => ({ ...theme })),
    menus: payload.menus?.length
      ? payload.menus.map((menu, index) => sanitizeMenu(menu, index))
      : current.menus.map((menu, index) => sanitizeMenu(menu, index)),
    profile: sanitizeProfileSettings(payload.profile, current.profile ?? defaults.profile),
    ui: sanitizeUiSettings(payload.ui, current.ui ?? defaults.ui),
    pages: {
      about: sanitizeContentBlock(payload.pages?.about, current.pages.about, defaults.pages.about),
      contact: sanitizeContentBlock(payload.pages?.contact, current.pages.contact, defaults.pages.contact),
      help: sanitizeContentBlock(payload.pages?.help, current.pages.help, defaults.pages.help),
    },
    updatedAt: new Date().toISOString(),
  } satisfies SiteSettings;

  const ensured = ensureActiveThemeId(next);

  await writeToDatabase(ensured);
  await invalidateCache();
  await cacheSettings(ensured);

  return ensured;
}
