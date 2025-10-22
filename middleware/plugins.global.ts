import { createError, useNuxtApp } from "#imports";
import type { SiteSettings, SiteWorldSettings } from "~/types/settings";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";

function extractSlug(param: unknown): string | null {
  if (typeof param === "string") {
    const trimmed = param.trim();
    return trimmed ? trimmed.toLowerCase() : null;
  }

  if (Array.isArray(param)) {
    for (const entry of param) {
      if (typeof entry === "string") {
        const trimmed = entry.trim();

        if (trimmed) {
          return trimmed.toLowerCase();
        }
      }
    }
  }

  return null;
}

function resolveWorldForRoute(settings: SiteSettings | null, slug: string | null): SiteWorldSettings | null {
  if (!settings) {
    return null;
  }

  const worlds = settings.worlds ?? [];

  if (!worlds.length) {
    return null;
  }

  if (slug) {
    const normalized = slug.trim().toLowerCase();

    const matched = worlds.find((world) => {
      const worldSlug = world.slug?.trim().toLowerCase() ?? "";
      const worldId = world.id?.trim().toLowerCase() ?? "";
      return worldSlug === normalized || worldId === normalized;
    });

    if (matched) {
      return matched;
    }

    return null;
  }

  if (settings.activeWorldId) {
    const activeWorld = worlds.find((world) => world.id === settings.activeWorldId);

    if (activeWorld) {
      return activeWorld;
    }
  }

  return worlds[0] ?? null;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const requiredMeta = to.meta?.requiresPlugin;
  const requiredPlugins = Array.isArray(requiredMeta)
    ? requiredMeta.filter((value): value is string => typeof value === "string")
    : typeof requiredMeta === "string"
      ? [requiredMeta]
      : [];

  if (!requiredPlugins.length) {
    return;
  }

  const siteSettingsState = useSiteSettingsState();
  const slug = extractSlug(to.params?.slug);
  let targetWorld = resolveWorldForRoute(siteSettingsState.value, slug);
  let enabledPlugins = targetWorld?.pluginIds ?? [];

  if (!siteSettingsState.value) {
    const nuxtApp = useNuxtApp();
    const fetchSiteSettings = nuxtApp.$fetch<{ data: SiteSettings } | SiteSettings>;

    try {
      const response = await fetchSiteSettings("/api/settings");
      const settings = "data" in response ? response.data : response;
      siteSettingsState.value = settings;
      targetWorld = resolveWorldForRoute(siteSettingsState.value, slug);
      enabledPlugins = targetWorld?.pluginIds ?? [];
    } catch (error) {
      console.error("Failed to load site settings", error);
      return;
    }
  }

  if (slug && !targetWorld) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: "Page Not Found",
      }),
    );
  }

  if (requiredPlugins.every((plugin) => enabledPlugins.includes(plugin))) {
    return;
  }

  return abortNavigation(
    createError({
      statusCode: 404,
      statusMessage: "Page Not Found",
    }),
  );
});
