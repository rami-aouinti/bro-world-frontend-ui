import { computed, type ComputedRef } from "vue";
import { useState } from "#imports";
import type { SiteSettings, SiteWorldSettings } from "~/types/settings";

function resolveActiveWorld(settings: SiteSettings | null): SiteWorldSettings | null {
  if (!settings) {
    return null;
  }

  const worlds = settings.worlds ?? [];

  if (!worlds.length) {
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

export function useSiteSettingsState() {
  const settings = useState<SiteSettings | null>("site-settings", () => null);

  const enabledPlugins = computed(() => {
    const activeWorld = resolveActiveWorld(settings.value);

    return [...(activeWorld?.pluginIds ?? [])];
  });

  const activeWorld = computed(() => resolveActiveWorld(settings.value));

  return Object.assign(settings, { enabledPlugins, activeWorld }) as typeof settings & {
    enabledPlugins: ComputedRef<string[]>;
    activeWorld: ComputedRef<SiteWorldSettings | null>;
  };
}
