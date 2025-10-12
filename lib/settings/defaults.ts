import type {
  SiteSettings,
  SiteMenuItem,
  SiteThemeDefinition,
  SiteProfileSettings,
  SiteUiSettings,
  SiteContentBlock,
} from "~/types/settings";

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

function makeProfileSettings(overrides: Partial<SiteProfileSettings> = {}): SiteProfileSettings {
  return {
    allowCustomization: true,
    allowAvatarUploads: true,
    allowCoverUploads: true,
    allowThemeSelection: true,
    showContactSection: true,
    showDetailsSection: true,
    showSocialSection: true,
    defaultBio: "Building vibrant connections across every world.",
    ...overrides,
  } satisfies SiteProfileSettings;
}

function makeUiSettings(overrides: Partial<SiteUiSettings> = {}): SiteUiSettings {
  return {
    allowThemeSwitching: true,
    defaultThemeMode: "system",
    ...overrides,
  } satisfies SiteUiSettings;
}

function makeContentBlock(block: SiteContentBlock): SiteContentBlock {
  return { ...block };
}

const DEFAULT_CONTENT_UPDATED_AT = "2024-01-01T00:00:00.000Z";

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
  profile: makeProfileSettings(),
  ui: makeUiSettings(),
  pages: {
    about: makeContentBlock({
      title: "The BroWorld mission",
      subtitle: "Designing social universes for modern communities.",
      body: "BroWorld empowers product teams to craft immersive, community-driven experiences with rapid iteration and consistent branding.",
      updatedAt: DEFAULT_CONTENT_UPDATED_AT,
    }),
    contact: makeContentBlock({
      title: "Contact the BroWorld crew",
      subtitle: "We’re here to help you launch bold social platforms.",
      body: "Reach us at support@broworld.com for partnership, support, or press enquiries.",
      updatedAt: DEFAULT_CONTENT_UPDATED_AT,
    }),
    help: makeContentBlock({
      title: "Help centre",
      subtitle: "Guides and resources to master BroWorld’s toolkit.",
      body: "Browse quick links, tutorials, and FAQs to get answers in minutes.",
      updatedAt: DEFAULT_CONTENT_UPDATED_AT,
    }),
  },
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
        makeMenu(
          {
            id: "admin-general",
            label: "layout.sidebar.items.adminGeneral",
            icon: "mdi-view-dashboard-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 0,
          },
          [
            {
              id: "admin-general-statistics",
              label: "layout.sidebar.items.adminStatistics",
              icon: "mdi-chart-box-outline",
              translate: true,
              to: "/admin",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-general-settings",
              label: "layout.sidebar.items.adminSettings",
              icon: "mdi-cog-outline",
              translate: true,
              to: "/admin/settings",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-blog-management",
            label: "layout.sidebar.items.adminBlogManagement",
            icon: "mdi-post-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 1,
          },
          [
            {
              id: "admin-blog-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/blog",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-blog-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/blog/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-blog-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/blog/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-user-management",
            label: "layout.sidebar.items.adminUserManagement",
            icon: "mdi-account-cog-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 2,
          },
          [
            {
              id: "admin-user-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/user-management",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-user-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/user-management/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-user-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/user-management/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-job-management",
            label: "layout.sidebar.items.adminJobManagement",
            icon: "mdi-briefcase-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 3,
          },
          [
            {
              id: "admin-job-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/job-management",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-job-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/job-management/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-job-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/job-management/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-ecommerce-management",
            label: "layout.sidebar.items.adminEcommerceManagement",
            icon: "mdi-shopping-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 4,
          },
          [
            {
              id: "admin-ecommerce-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/ecommerce-management",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-ecommerce-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/ecommerce-management/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-ecommerce-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/ecommerce-management/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-education-management",
            label: "layout.sidebar.items.adminEducationManagement",
            icon: "mdi-school-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 5,
          },
          [
            {
              id: "admin-education-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/education-management",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-education-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/education-management/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-education-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/education-management/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-game-management",
            label: "layout.sidebar.items.adminGameManagement",
            icon: "mdi-gamepad-variant-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 6,
          },
          [
            {
              id: "admin-game-general",
              label: "layout.sidebar.items.adminGeneralSetting",
              icon: "mdi-tune",
              translate: true,
              to: "/admin/game-management",
              requiresAdmin: true,
              isVisible: true,
              order: 0,
            },
            {
              id: "admin-game-data",
              label: "layout.sidebar.items.adminData",
              icon: "mdi-database-outline",
              translate: true,
              to: "/admin/game-management/data",
              requiresAdmin: true,
              isVisible: true,
              order: 1,
            },
            {
              id: "admin-game-crons",
              label: "layout.sidebar.items.adminCrons",
              icon: "mdi-clock-outline",
              translate: true,
              to: "/admin/game-management/crons",
              requiresAdmin: true,
              isVisible: true,
              order: 2,
            },
          ],
        ),
      ],
    ),
  ],
  updatedAt: new Date(0).toISOString(),
};

export function getDefaultSiteSettings(): SiteSettings {
  return structuredClone(defaultSiteSettings);
}
