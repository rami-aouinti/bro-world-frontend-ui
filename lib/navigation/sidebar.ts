import type { SiteMenuItem, SiteSettings } from "~/types/settings";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

export interface LayoutSidebarItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: LayoutSidebarItem[];
  translate?: boolean;
}

export const ADMIN_ROLE_KEYS = ["ROLE_ROOT", "ROLE_ADMIN"] as const;

function isMenuVisible(menu: SiteMenuItem, canAccessAdmin: boolean): boolean {
  if (menu.requiresAdmin && !canAccessAdmin) {
    return false;
  }

  return menu.isVisible !== false;
}

function toLayoutItem(menu: SiteMenuItem, canAccessAdmin: boolean): LayoutSidebarItem | null {
  if (!isMenuVisible(menu, canAccessAdmin)) {
    return null;
  }

  const children = (menu.children ?? [])
    .map((child) => toLayoutItem(child, canAccessAdmin))
    .filter((child): child is LayoutSidebarItem => Boolean(child));

  if (!menu.to && !children.length) {
    return null;
  }

  return {
    key: menu.id,
    label: menu.label,
    icon: menu.icon ?? undefined,
    to: menu.to ?? undefined,
    translate: menu.translate,
    children: children.length ? children : undefined,
  } satisfies LayoutSidebarItem;
}

function sortMenus(menus: SiteMenuItem[]): SiteMenuItem[] {
  return [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function buildSidebarItems(
  settings: SiteSettings | null | undefined,
  canAccessAdmin: boolean,
): LayoutSidebarItem[] {
  const source = settings?.menus?.length ? settings.menus : getDefaultSiteSettings().menus;

  return sortMenus(source)
    .map((menu) => toLayoutItem(menu, canAccessAdmin))
    .filter((item): item is LayoutSidebarItem => Boolean(item));
}

export function buildProfileSidebarItems(): LayoutSidebarItem[] {
  return [
    {
      key: "profile-overview",
      label: "layout.sidebar.items.profileOverview",
      icon: "mdi-card-account-details-outline",
      to: "/profile",
      translate: true,
    },
    {
      key: "profile-edit",
      label: "layout.sidebar.items.profileSettings",
      icon: "mdi-cog-outline",
      to: "/profile-edit",
      translate: true,
    },
    {
      key: "profile-security",
      label: "layout.sidebar.items.profileSecurity",
      icon: "mdi-shield-check-outline",
      to: "/profile-security",
      translate: true,
    },
    {
      key: "profile-friends",
      label: "layout.sidebar.items.profileFriends",
      icon: "mdi-account-group-outline",
      to: "/profile-friends",
      translate: true,
    },
    {
      key: "profile-photos",
      label: "layout.sidebar.items.profilePhotos",
      icon: "mdi-image-multiple-outline",
      to: "/profile-photos",
      translate: true,
    },
  ];
}
