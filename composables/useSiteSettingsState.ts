import { computed, type ComputedRef, watch } from "vue";
import { useState } from "#imports";
import type { SiteSettings, SiteWorldSettings } from "~/types/settings";
import { useWorldMembershipsStore } from "~/stores/world-memberships";
import type { WorldMembership } from "~/stores/world-memberships";

function resolveActiveWorlds(
  settings: SiteSettings | null,
  activeWorldIds: string[],
): SiteWorldSettings[] {
  if (!settings) {
    return [];
  }

  const worlds = settings.worlds ?? [];

  if (!worlds.length) {
    return [];
  }

  if (activeWorldIds.length > 0) {
    const worldById = new Map(worlds.map((world) => [world.id, world] as const));
    const resolved: SiteWorldSettings[] = [];

    for (const worldId of activeWorldIds) {
      const world = worldById.get(worldId);

      if (world) {
        resolved.push(world);
      }
    }

    if (resolved.length > 0) {
      return resolved;
    }
  }

  if (settings.activeWorldId) {
    const fallbackWorld = worlds.find((world) => world.id === settings.activeWorldId);

    if (fallbackWorld) {
      return [fallbackWorld];
    }
  }

  return worlds.length > 0 ? [worlds[0]!] : [];
}

export function useSiteSettingsState() {
  const settings = useState<SiteSettings | null>("site-settings", () => null);
  const memberships = useWorldMembershipsStore();
  const hasRegisteredSync = useState<boolean>(
    "site-settings-membership-sync-registered",
    () => false,
  );

  if (!hasRegisteredSync.value) {
    hasRegisteredSync.value = true;

    watch(
      () => settings.value,
      (value) => {
        memberships.syncFromSiteSettings(value);
      },
      { immediate: true, deep: true },
    );
  }

  const enabledPlugins = computed(() => {
    const activeWorlds = resolveActiveWorlds(settings.value, memberships.activeWorldIds.value);
    const plugins = new Set<string>();

    for (const world of activeWorlds) {
      for (const pluginId of world.pluginIds ?? []) {
        if (typeof pluginId === "string" && pluginId) {
          plugins.add(pluginId);
        }
      }
    }

    return [...plugins];
  });

  const activeWorlds = computed(() =>
    resolveActiveWorlds(settings.value, memberships.activeWorldIds.value),
  );
  const activeWorld = computed(() => activeWorlds.value[0] ?? null);
  const membershipMap = computed(() => memberships.memberships);

  return Object.assign(settings, {
    enabledPlugins,
    activeWorld,
    activeWorlds,
    memberships: membershipMap,
  }) as typeof settings & {
    enabledPlugins: ComputedRef<string[]>;
    activeWorld: ComputedRef<SiteWorldSettings | null>;
    activeWorlds: ComputedRef<SiteWorldSettings[]>;
    memberships: ComputedRef<Record<string, WorldMembership>>;
  };
}
