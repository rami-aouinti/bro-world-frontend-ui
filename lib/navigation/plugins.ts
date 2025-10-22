import type { SiteMenuItem } from "~/types/settings";
import type { MenuBlueprint } from "~/lib/navigation/menu-blueprints";
import { convertBlueprintsToMenus, mergeMenuBlueprints } from "~/lib/navigation/menu-blueprints";

export interface PluginQuickLaunchDefinition {
  icon: string;
  label: string;
  to: string;
  order?: number;
}

export interface PluginRegistryEntry {
  id: string;
  menuItems: MenuBlueprint[];
  quickLaunch?: PluginQuickLaunchDefinition | PluginQuickLaunchDefinition[];
}

const pluginRegistry: readonly PluginRegistryEntry[] = [
  {
    id: "messenger",
    menuItems: [
      {
        id: "messenger",
        label: "layout.sidebar.items.messenger",
        icon: "mdi:message-text-outline",
        translate: true,
        to: "/messenger",
        isVisible: true,
        order: 0,
      },
    ],
  },
  {
    id: "job-board",
    menuItems: [
      {
        id: "jobs",
        label: "layout.sidebar.items.jobs",
        icon: "mdi:briefcase-search",
        translate: true,
        to: "/job",
        isVisible: true,
        order: 0,
      },
      {
        id: "admin",
        children: [
          {
            id: "admin-job-management",
            label: "layout.sidebar.items.adminJobManagement",
            icon: "mdi:briefcase-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 3,
            children: [
              {
                id: "admin-job-general",
                label: "layout.sidebar.items.adminGeneralSetting",
                icon: "mdi:tune",
                translate: true,
                to: "/admin/job-management",
                requiresAdmin: true,
                isVisible: true,
                order: 0,
              },
              {
                id: "admin-job-data",
                label: "layout.sidebar.items.adminData",
                icon: "mdi:database-outline",
                translate: true,
                to: "/admin/job-management/data",
                requiresAdmin: true,
                isVisible: true,
                order: 1,
              },
              {
                id: "admin-job-crons",
                label: "layout.sidebar.items.adminCrons",
                icon: "mdi:clock-outline",
                translate: true,
                to: "/admin/job-management/crons",
                requiresAdmin: true,
                isVisible: true,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "game",
    menuItems: [
      {
        id: "game",
        label: "layout.sidebar.items.game",
        icon: "mdi:gamepad-variant-outline",
        translate: true,
        to: "/game",
        isVisible: true,
        order: 1,
      },
      {
        id: "admin",
        children: [
          {
            id: "admin-game-management",
            label: "layout.sidebar.items.adminGameManagement",
            icon: "mdi:gamepad-variant-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 6,
            children: [
              {
                id: "admin-game-general",
                label: "layout.sidebar.items.adminGeneralSetting",
                icon: "mdi:tune",
                translate: true,
                to: "/admin/game-management",
                requiresAdmin: true,
                isVisible: true,
                order: 0,
              },
              {
                id: "admin-game-data",
                label: "layout.sidebar.items.adminData",
                icon: "mdi:database-outline",
                translate: true,
                to: "/admin/game-management/data",
                requiresAdmin: true,
                isVisible: true,
                order: 1,
              },
              {
                id: "admin-game-crons",
                label: "layout.sidebar.items.adminCrons",
                icon: "mdi:clock-outline",
                translate: true,
                to: "/admin/game-management/crons",
                requiresAdmin: true,
                isVisible: true,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
    quickLaunch: {
      icon: "mdi:gamepad-variant-outline",
      label: "layout.appIcons.game",
      to: "/game",
      order: 2,
    },
  },
  {
    id: "crm",
    menuItems: [
      {
        id: "crm",
        label: "layout.sidebar.items.crm",
        icon: "mdi:account-box-multiple-outline",
        translate: true,
        to: "/crm",
        isVisible: true,
        order: 2,
      },
      {
        id: "admin",
        children: [
          {
            id: "admin-general",
            children: [
              {
                id: "admin-general-crm",
                label: "layout.sidebar.items.adminCrm",
                icon: "mdi:account-box-multiple-outline",
                translate: true,
                to: "/admin/crm",
                requiresAdmin: true,
                isVisible: true,
                order: 3,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ecommerce",
    menuItems: [
      {
        id: "ecommerce",
        label: "layout.sidebar.items.ecommerce",
        icon: "mdi:shopping-outline",
        translate: true,
        to: "/ecommerce",
        isVisible: true,
        order: 3,
        children: [
          {
            id: "ecommerce-overview",
            label: "layout.sidebar.items.ecommerceOverview",
            icon: "mdi:view-dashboard-outline",
            translate: true,
            to: "/ecommerce",
            order: 0,
          },
          {
            id: "ecommerce-catalog",
            label: "layout.sidebar.items.ecommerceCatalog",
            icon: "mdi:view-grid-outline",
            translate: true,
            to: "/ecommerce/catalog",
            order: 1,
          },
          {
            id: "ecommerce-cart",
            label: "layout.sidebar.items.ecommerceCart",
            icon: "mdi:cart",
            translate: true,
            to: "/ecommerce/cart",
            order: 2,
          },
          {
            id: "ecommerce-checkout",
            label: "layout.sidebar.items.ecommerceCheckout",
            icon: "mdi:credit-card-check-outline",
            translate: true,
            to: "/ecommerce/checkout",
            order: 3,
          },
        ],
      },
      {
        id: "admin",
        children: [
          {
            id: "admin-ecommerce-management",
            label: "layout.sidebar.items.adminEcommerceManagement",
            icon: "mdi:shopping-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 4,
            children: [
              {
                id: "admin-ecommerce-general",
                label: "layout.sidebar.items.adminGeneralSetting",
                icon: "mdi:tune",
                translate: true,
                to: "/admin/ecommerce-management",
                requiresAdmin: true,
                isVisible: true,
                order: 0,
              },
              {
                id: "admin-ecommerce-data",
                label: "layout.sidebar.items.adminData",
                icon: "mdi:database-outline",
                translate: true,
                to: "/admin/ecommerce-management/data",
                requiresAdmin: true,
                isVisible: true,
                order: 1,
              },
              {
                id: "admin-ecommerce-crons",
                label: "layout.sidebar.items.adminCrons",
                icon: "mdi:clock-outline",
                translate: true,
                to: "/admin/ecommerce-management/crons",
                requiresAdmin: true,
                isVisible: true,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
    quickLaunch: {
      icon: "mdi:shopping-outline",
      label: "layout.appIcons.ecommerce",
      to: "/ecommerce",
      order: 0,
    },
  },
  {
    id: "education",
    menuItems: [
      {
        id: "education",
        label: "layout.sidebar.items.education",
        icon: "mdi:school-outline",
        translate: true,
        to: "/education",
        isVisible: true,
        order: 4,
      },
      {
        id: "admin",
        children: [
          {
            id: "admin-education-management",
            label: "layout.sidebar.items.adminEducationManagement",
            icon: "mdi:school-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 5,
            children: [
              {
                id: "admin-education-general",
                label: "layout.sidebar.items.adminGeneralSetting",
                icon: "mdi:tune",
                translate: true,
                to: "/admin/education-management",
                requiresAdmin: true,
                isVisible: true,
                order: 0,
              },
              {
                id: "admin-education-data",
                label: "layout.sidebar.items.adminData",
                icon: "mdi:database-outline",
                translate: true,
                to: "/admin/education-management/data",
                requiresAdmin: true,
                isVisible: true,
                order: 1,
              },
              {
                id: "admin-education-crons",
                label: "layout.sidebar.items.adminCrons",
                icon: "mdi:clock-outline",
                translate: true,
                to: "/admin/education-management/crons",
                requiresAdmin: true,
                isVisible: true,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
    quickLaunch: {
      icon: "mdi:school-outline",
      label: "layout.appIcons.education",
      to: "/education",
      order: 1,
    },
  },
  {
    id: "blog",
    menuItems: [
      {
        id: "admin",
        children: [
          {
            id: "admin-blog-management",
            label: "layout.sidebar.items.adminBlogManagement",
            icon: "mdi:post-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 1,
            children: [
              {
                id: "admin-blog-general",
                label: "layout.sidebar.items.adminGeneralSetting",
                icon: "mdi:tune",
                translate: true,
                to: "/admin/blog",
                requiresAdmin: true,
                isVisible: true,
                order: 0,
              },
              {
                id: "admin-blog-data",
                label: "layout.sidebar.items.adminData",
                icon: "mdi:database-outline",
                translate: true,
                to: "/admin/blog/data",
                requiresAdmin: true,
                isVisible: true,
                order: 1,
              },
              {
                id: "admin-blog-crons",
                label: "layout.sidebar.items.adminCrons",
                icon: "mdi:clock-outline",
                translate: true,
                to: "/admin/blog/crons",
                requiresAdmin: true,
                isVisible: true,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

export const pluginRegistryMap = new Map(
  pluginRegistry.map((entry) => [entry.id, entry] as const),
);

export function getPluginRegistry(): readonly PluginRegistryEntry[] {
  return pluginRegistry;
}

export function getAllPluginIds(): string[] {
  return pluginRegistry.map((entry) => entry.id);
}

export function getPluginMenuBlueprints(selectedPluginIds: Iterable<string>): MenuBlueprint[] {
  let merged: MenuBlueprint[] = [];
  const seen = new Set<string>();

  for (const pluginId of selectedPluginIds ?? []) {
    if (typeof pluginId !== "string") {
      continue;
    }

    const normalized = pluginId.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    const registryEntry = pluginRegistryMap.get(normalized);
    if (!registryEntry?.menuItems.length) {
      seen.add(normalized);
      continue;
    }

    merged = mergeMenuBlueprints(merged, registryEntry.menuItems);
    seen.add(normalized);
  }

  return merged;
}

export function buildMenusForPlugins(selectedPluginIds: Iterable<string>): SiteMenuItem[] {
  return convertBlueprintsToMenus(getPluginMenuBlueprints(selectedPluginIds));
}

export interface PluginQuickLaunchEntry {
  pluginId: string;
  icon: string;
  label: string;
  to: string;
  order: number;
}

export function getPluginQuickLaunchEntries(
  selectedPluginIds?: Iterable<string>,
): PluginQuickLaunchEntry[] {
  const allowed = selectedPluginIds
    ? new Set(
        Array.from(selectedPluginIds)
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean),
      )
    : null;

  const entries: PluginQuickLaunchEntry[] = [];

  for (const registryEntry of pluginRegistry) {
    if (allowed && !allowed.has(registryEntry.id)) {
      continue;
    }

    const quickLaunch = registryEntry.quickLaunch;
    if (!quickLaunch) {
      continue;
    }

    const definitions = Array.isArray(quickLaunch) ? quickLaunch : [quickLaunch];

    for (const definition of definitions) {
      entries.push({
        pluginId: registryEntry.id,
        icon: definition.icon,
        label: definition.label,
        to: definition.to,
        order: definition.order ?? 0,
      });
    }
  }

  return entries.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}
