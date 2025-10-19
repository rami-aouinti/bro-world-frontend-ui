import { createError, useNuxtApp } from "#imports";
import type { SiteSettings } from "~/types/settings";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";

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
  let enabledPlugins = siteSettingsState.enabledPlugins.value;

  if (!siteSettingsState.value) {
    const nuxtApp = useNuxtApp();
    const fetchSiteSettings = nuxtApp.$fetch<{ data: SiteSettings } | SiteSettings>;

    try {
      const response = await fetchSiteSettings("/api/settings");
      const settings = "data" in response ? response.data : response;
      siteSettingsState.value = settings;
      enabledPlugins = siteSettingsState.enabledPlugins.value;
    } catch (error) {
      console.error("Failed to load site settings", error);
      return;
    }
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
