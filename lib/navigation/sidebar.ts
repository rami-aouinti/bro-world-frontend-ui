import type { SiteMenuItem, SiteProfileSettings, SiteSettings } from "~/types/settings";
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

function slugifyKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function createCandidateKey(menu: SiteMenuItem, fallbackPrefix: string): string {
  if (menu.id != null) {
    const id = String(menu.id).trim();
    if (id) return id;
  }

  const slugSource =
    (menu.to != null && String(menu.to).trim()) ||
    (menu.label != null && String(menu.label).trim()) ||
    fallbackPrefix;

  const slug = slugSource ? slugifyKey(slugSource) : "";

  if (slug) {
    return slug;
  }

  return slugifyKey(fallbackPrefix || "menu-item");
}

function normalizeKey(base: string, usedKeys: Set<string>): string {
  let candidate = base;
  let suffix = 1;

  while (usedKeys.has(candidate)) {
    candidate = `${base}-${suffix++}`;
  }

  usedKeys.add(candidate);
  return candidate;
}

function toLayoutItem(
  menu: SiteMenuItem,
  canAccessAdmin: boolean,
  usedKeys: Set<string>,
  fallbackPrefix: string,
): LayoutSidebarItem | null {
  if (!isMenuVisible(menu, canAccessAdmin)) {
    return null;
  }

  const candidateKey = createCandidateKey(menu, fallbackPrefix);
  const key = normalizeKey(candidateKey, usedKeys);

  const children = (menu.children ?? [])
    .map((child, index) => toLayoutItem(child, canAccessAdmin, usedKeys, `${key}-${index}`))
    .filter((child): child is LayoutSidebarItem => Boolean(child));

  if (!menu.to && !children.length) {
    return null;
  }

  return {
    key,
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
  const usedKeys = new Set<string>();

  return sortMenus(source)
    .map((menu, index) => toLayoutItem(menu, canAccessAdmin, usedKeys, `root-${index}`))
    .filter((item): item is LayoutSidebarItem => Boolean(item));
}

export function buildProfileSidebarItems(
  profileSettings?: SiteProfileSettings | null,
): LayoutSidebarItem[] {
  const allowCustomization = profileSettings?.allowCustomization !== false;

  const items: LayoutSidebarItem[] = [
    {
      key: "profile-overview",
      label: "layout.sidebar.items.profileOverview",
      icon: "mdi:card-account-details-outline",
      to: "/profile",
      translate: true,
    },
  ];

  if (allowCustomization) {
    items.push({
      key: "profile-edit",
      label: "layout.sidebar.items.profileSettings",
      icon: "mdi:cog-outline",
      to: "/profile-edit",
      translate: true,
    });
  }

  items.push(
    {
      key: "profile-security",
      label: "layout.sidebar.items.profileSecurity",
      icon: "mdi:shield-check-outline",
      to: "/profile-security",
      translate: true,
    },
    {
      key: "profile-notifications",
      label: "layout.sidebar.items.profileNotifications",
      icon: "mdi:bell-cog-outline",
      to: "/profile-notifications",
      translate: true,
    },
    {
      key: "profile-calendar",
      label: "layout.sidebar.items.profileCalendar",
      icon: "mdi:calendar-month-outline",
      to: "/profile/calendar",
      translate: true,
    },
    {
      key: "profile-friends",
      label: "layout.sidebar.items.profileFriends",
      icon: "mdi:account-group-outline",
      to: "/profile-friends",
      translate: true,
    },
    {
      key: "profile-photos",
      label: "layout.sidebar.items.profilePhotos",
      icon: "mdi:image-multiple-outline",
      to: "/profile-photos",
      translate: true,
    },
  );

  return items;
}
