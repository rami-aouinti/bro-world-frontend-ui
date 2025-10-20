import type { IconifyIcon } from "@iconify/vue";

export interface WorldPluginRouteDefinition {
  path: string;
  label: string;
  description?: string;
}

export interface WorldPluginMenuDefinition {
  id: string;
  label: string;
  description?: string;
  icon?: string | IconifyIcon;
}

export interface WorldPluginCategoryDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface WorldPluginDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  categoryId: WorldPluginCategoryDefinition["id"];
  highlights?: string[];
  routes?: WorldPluginRouteDefinition[];
  menus?: WorldPluginMenuDefinition[];
}

export const WORLD_PLUGIN_CATEGORIES: WorldPluginCategoryDefinition[] = [
  {
    id: "content",
    label: "Content",
    description: "Editorial, marketing, and knowledge experiences for your world.",
    icon: "mdi:file-document-edit-outline",
  },
  {
    id: "engagement",
    label: "Engagement",
    description: "Interactive destinations to bring communities together in real time.",
    icon: "mdi:gamepad-variant-outline",
  },
  {
    id: "operations",
    label: "Operations",
    description: "Workflow, communication, and relationship tooling for operators.",
    icon: "mdi:chart-box-outline",
  },
  {
    id: "commerce",
    label: "Commerce",
    description: "Monetisation, marketplaces, and transactional experiences.",
    icon: "mdi:cart-outline",
  },
  {
    id: "talent",
    label: "Talent",
    description: "Hiring journeys and workforce enablement modules.",
    icon: "mdi:briefcase-account-outline",
  },
];

export const WORLD_PLUGIN_REGISTRY: WorldPluginDefinition[] = [
  {
    id: "blog",
    name: "Blog",
    description: "Publish editorial updates with featured stories, tags, and author highlights.",
    icon: "mdi:post-outline",
    categoryId: "content",
    highlights: [
      "Supports rich text, video, and podcast embeds",
      "Featured collections for seasonal campaigns",
      "SEO-ready metadata controls",
    ],
    routes: [
      {
        path: "/blog",
        label: "Blog home",
        description: "Landing page with hero, featured posts, and search.",
      },
      {
        path: "/blog/:slug",
        label: "Article detail",
        description: "Individual articles with reading progress, sharing, and related stories.",
      },
    ],
    menus: [
      {
        id: "main",
        label: "Main navigation",
        description: "Adds Blog to the primary header menu.",
      },
      {
        id: "footer",
        label: "Footer navigation",
        description: "Links to the blog archive and RSS feed.",
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    description: "Deliver course catalogues, lesson modules, and certification paths.",
    icon: "mdi:school-outline",
    categoryId: "content",
    highlights: [
      "Adaptive lessons with quiz checkpoints",
      "Cohort dashboards for instructors",
      "Completion certificates and badges",
    ],
    routes: [
      {
        path: "/academy",
        label: "Academy overview",
        description: "Course catalogue with filters and featured tracks.",
      },
      {
        path: "/academy/courses/:slug",
        label: "Course detail",
        description: "Syllabus, instructors, and enrollment actions.",
      },
    ],
    menus: [
      {
        id: "learn",
        label: "Learning hub",
        description: "Adds Academy to contextual learning menus.",
      },
    ],
  },
  {
    id: "game",
    name: "Game",
    description: "Launch live operations with matchmaking, leaderboards, and patch notes.",
    icon: "mdi:controller-classic-outline",
    categoryId: "engagement",
    highlights: [
      "Dynamic matchmaking queues",
      "Live events calendar",
      "Player progression analytics",
    ],
    routes: [
      {
        path: "/game",
        label: "Game hub",
        description: "Game overview with news, updates, and quick actions.",
      },
      {
        path: "/game/leaderboards",
        label: "Leaderboards",
        description: "Global and seasonal rankings with filters.",
      },
    ],
    menus: [
      {
        id: "community",
        label: "Community hub",
        description: "Highlights competitive events and patch timelines.",
      },
    ],
  },
  {
    id: "messenger",
    name: "Messenger",
    description: "Embed chat, announcements, and DM experiences across your world.",
    icon: "mdi:message-text-outline",
    categoryId: "engagement",
    highlights: [
      "Channel and thread support",
      "Presence indicators with typing states",
      "Integration ready webhooks",
    ],
    routes: [
      {
        path: "/messages",
        label: "Inbox",
        description: "Unified messaging inbox with channel filters.",
      },
    ],
    menus: [
      {
        id: "quick-actions",
        label: "Quick actions",
        description: "Adds messaging shortcuts to the floating launcher.",
      },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Pipeline dashboards and customer health views for go-to-market teams.",
    icon: "mdi:account-group-outline",
    categoryId: "operations",
    highlights: [
      "Pipeline boards with drag-and-drop stages",
      "Account health and revenue forecasting",
      "Automated handover reminders",
    ],
    routes: [
      {
        path: "/crm",
        label: "CRM workspace",
        description: "Pipeline overview with metrics and tables.",
      },
      {
        path: "/crm/projects/:id",
        label: "Project detail",
        description: "Deal timeline, tasks, and attachments.",
      },
    ],
    menus: [
      {
        id: "sidebar",
        label: "Operations sidebar",
        description: "Adds CRM projects to the operator sidebar.",
      },
    ],
  },
  {
    id: "job-board",
    name: "Job board",
    description: "Recruitment funnels with job listings, applications, and hiring workflows.",
    icon: "mdi:briefcase-search-outline",
    categoryId: "talent",
    highlights: [
      "Role templates for rapid posting",
      "Application tracker with scoring",
      "Interview scheduling integrations",
    ],
    routes: [
      {
        path: "/careers",
        label: "Careers home",
        description: "Listing of open roles with departments and locations.",
      },
      {
        path: "/careers/:slug",
        label: "Role detail",
        description: "Responsibilities, requirements, and application actions.",
      },
    ],
    menus: [
      {
        id: "primary",
        label: "Primary navigation",
        description: "Adds Careers to the global navigation.",
      },
      {
        id: "footer",
        label: "Footer resources",
        description: "Links to hiring FAQs and talent community.",
      },
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Product catalogue, cart, and checkout experiences ready for launch.",
    icon: "mdi:shopping-outline",
    categoryId: "commerce",
    highlights: [
      "Merch collections with variant support",
      "Persistent carts and wishlists",
      "Secure checkout with order receipts",
    ],
    routes: [
      {
        path: "/shop",
        label: "Storefront",
        description: "Featured products with filters and merchandising.",
      },
      {
        path: "/shop/product/:slug",
        label: "Product detail",
        description: "Gallery, specs, availability, and reviews.",
      },
      {
        path: "/shop/cart",
        label: "Cart",
        description: "Cart summary with upsell modules and promo codes.",
      },
    ],
    menus: [
      {
        id: "header",
        label: "Header navigation",
        description: "Adds Shop with badge indicators to the main nav.",
      },
      {
        id: "account",
        label: "Account menu",
        description: "Links to orders, subscriptions, and saved items.",
      },
    ],
  },
];

export const WORLD_PLUGIN_REGISTRY_MAP = new Map(
  WORLD_PLUGIN_REGISTRY.map((plugin) => [plugin.id, plugin] as const),
);

export function groupWorldPluginsByCategory(
  plugins: WorldPluginDefinition[] = WORLD_PLUGIN_REGISTRY,
  categories: WorldPluginCategoryDefinition[] = WORLD_PLUGIN_CATEGORIES,
) {
  return categories
    .map((category) => ({
      ...category,
      plugins: plugins.filter((plugin) => plugin.categoryId === category.id),
    }))
    .filter((category) => category.plugins.length > 0);
}

export function getWorldPluginById(id: string) {
  return WORLD_PLUGIN_REGISTRY_MAP.get(id) ?? null;
}
