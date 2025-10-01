import { createError } from "h3";
import { useStorage } from "nitropack/runtime";
import type { SiteMenuItem, SiteSettings, SiteThemeDefinition } from "~/types/settings";
import { defaultSiteSettings, getDefaultSiteSettings } from "~/lib/settings/defaults";

const STORAGE_KEY = "site-settings";
let seedPromise: Promise<void> | null = null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || crypto.randomUUID();
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

async function readSettings(): Promise<SiteSettings> {
  await ensureSeed();
  const storage = useStorage();
  const stored = await storage.getItem<SiteSettings | null>(STORAGE_KEY);

  if (!stored) {
    return getDefaultSiteSettings();
  }

  return stored;
}

async function writeSettings(settings: SiteSettings): Promise<void> {
  const storage = useStorage();
  await storage.setItem(STORAGE_KEY, settings);
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

export async function getSiteSettings(): Promise<SiteSettings> {
  const current = await readSettings();
  return ensureActiveThemeId({ ...current, themes: current.themes.map((theme) => ({ ...theme })) });
}

export async function updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await readSettings();

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
      : current.menus.map((menu) => ({ ...menu, children: menu.children?.map((child) => ({ ...child })) ?? [] })),
    updatedAt: new Date().toISOString(),
  };

  const ensured = ensureActiveThemeId(next);

  await writeSettings(ensured);

  return ensured;
}
