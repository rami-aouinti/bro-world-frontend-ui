import type { SiteSettings, SiteMenuItem, SiteThemeDefinition } from "~/types/settings";

function makeMenu(
  menu: Omit<SiteMenuItem, "order"> & { order?: number },
  children: SiteMenuItem[] = [],
): SiteMenuItem {
  return {
    ...menu,
    order: menu.order ?? 0,
    children: children.map((child, index) => ({ ...child, order: child.order ?? index })),
  };
}

function makeTheme(theme: SiteThemeDefinition): SiteThemeDefinition {
  return { ...theme };
}

export const defaultSiteSettings: SiteSettings = {
  siteName: "BroWorld",
  tagline: "Build vibrant communities with a bold design system.",
  activeThemeId: "aurora",
  themes: [
    makeTheme({
      id: "aurora",
      name: "Aurora",
      description: "Gradient-rich palette blending violet and pink hues.",
      primaryColor: "#7C3AED",
      accentColor: "#F472B6",
      surfaceColor: "#F4F7FC",
    }),
    makeTheme({
      id: "midnight",
      name: "Midnight",
      description: "Deep blues with electric highlights for dark interfaces.",
      primaryColor: "#2563EB",
      accentColor: "#38BDF8",
      surfaceColor: "#0F172A",
    }),
    makeTheme({
      id: "sunrise",
      name: "Sunrise",
      description: "Warm oranges and amber notes for optimistic products.",
      primaryColor: "#EA580C",
      accentColor: "#F97316",
      surfaceColor: "#FFF7ED",
    }),
  ],
  menus: [
    makeMenu({
      id: "jobs",
      label: "layout.sidebar.items.jobs",
      icon: "mdi-briefcase-search",
      translate: true,
      to: "/job",
      isVisible: true,
      order: 0,
    }),
    makeMenu({
      id: "game",
      label: "layout.sidebar.items.game",
      icon: "mdi-gamepad-variant-outline",
      translate: true,
      to: "/game",
      isVisible: true,
      order: 1,
    }),
    makeMenu({
      id: "ecommerce",
      label: "layout.sidebar.items.ecommerce",
      icon: "mdi-shopping-outline",
      translate: true,
      to: "/ecommerce",
      isVisible: true,
      order: 2,
    }),
    makeMenu({
      id: "education",
      label: "layout.sidebar.items.education",
      icon: "mdi-school-outline",
      translate: true,
      to: "/education",
      isVisible: true,
      order: 3,
    }),
    makeMenu({
      id: "about",
      label: "layout.sidebar.items.about",
      icon: "mdi-information-outline",
      translate: true,
      to: "/about",
      isVisible: true,
      order: 4,
    }),
    makeMenu({
      id: "contact",
      label: "layout.sidebar.items.contact",
      icon: "mdi-email-outline",
      translate: true,
      to: "/contact",
      isVisible: true,
      order: 5,
    }),
    makeMenu(
      {
        id: "admin",
        label: "layout.sidebar.items.admin",
        icon: "mdi-shield-crown",
        translate: true,
        requiresAdmin: true,
        isVisible: true,
        order: 6,
      },
      [
        {
          id: "admin-general",
          label: "layout.sidebar.items.adminGeneral",
          icon: "mdi-view-dashboard-outline",
          translate: true,
          to: "/admin",
          requiresAdmin: true,
          isVisible: true,
          order: 0,
        },
        {
          id: "admin-settings",
          label: "layout.sidebar.items.adminSettings",
          icon: "mdi-cog-outline",
          translate: true,
          to: "/admin/settings",
          requiresAdmin: true,
          isVisible: true,
          order: 1,
        },
        {
          id: "admin-user-management",
          label: "layout.sidebar.items.adminUserManagement",
          icon: "mdi-account-cog-outline",
          translate: true,
          to: "/admin/user-management",
          requiresAdmin: true,
          isVisible: true,
          order: 2,
        },
        {
          id: "admin-blog",
          label: "layout.sidebar.items.adminBlog",
          icon: "mdi-post-outline",
          translate: true,
          to: "/admin/blog",
          requiresAdmin: true,
          isVisible: true,
          order: 3,
        },
      ],
    ),
  ],
  updatedAt: new Date(0).toISOString(),
};

export function getDefaultSiteSettings(): SiteSettings {
  return structuredClone(defaultSiteSettings);
}
