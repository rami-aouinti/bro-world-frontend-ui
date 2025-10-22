import type {
  SiteSettings,
  SiteMenuItem,
  SiteThemeDefinition,
  SiteProfileSettings,
  SiteUiSettings,
  SiteContentBlock,
  SiteLanguageDefinition,
  SiteLocalizedSettings,
  SiteWorldSettings,
} from "~/types/settings";
import { defaultLanguageCode, supportedLanguages } from "~/lib/i18n/languages";

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

type MenuBlueprint = Omit<SiteMenuItem, "order" | "children"> & {
  order?: number;
  children?: MenuBlueprint[];
};

function cloneMenuBlueprint(blueprint: MenuBlueprint): MenuBlueprint {
  return {
    ...blueprint,
    children: blueprint.children?.map((child) => cloneMenuBlueprint(child)),
  } satisfies MenuBlueprint;
}

function mergeBlueprintNode(base: MenuBlueprint, addition: MenuBlueprint): MenuBlueprint {
  const merged: MenuBlueprint = {
    ...base,
    ...(addition.order !== undefined ? { order: addition.order } : {}),
  };

  if (addition.label !== undefined) merged.label = addition.label;
  if (addition.icon !== undefined) merged.icon = addition.icon;
  if (addition.to !== undefined) merged.to = addition.to;
  if (addition.requiresAdmin !== undefined) merged.requiresAdmin = addition.requiresAdmin;
  if (addition.translate !== undefined) merged.translate = addition.translate;
  if (addition.isVisible !== undefined) merged.isVisible = addition.isVisible;

  const baseChildren = base.children ?? [];
  const additionChildren = addition.children ?? [];

  if (additionChildren.length > 0 || baseChildren.length > 0) {
    merged.children = mergeMenuBlueprints(baseChildren, additionChildren);
  }

  return merged;
}

function mergeMenuBlueprints(base: MenuBlueprint[], additions: MenuBlueprint[]): MenuBlueprint[] {
  const result: MenuBlueprint[] = base.map((item) => cloneMenuBlueprint(item));

  for (const addition of additions) {
    const additionClone = cloneMenuBlueprint(addition);
    if (additionClone.id) {
      const existingIndex = result.findIndex((item) => item.id === additionClone.id);
      if (existingIndex !== -1) {
        result[existingIndex] = mergeBlueprintNode(result[existingIndex], additionClone);
        continue;
      }
    }

    result.push(additionClone);
  }

  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function convertBlueprintsToMenus(blueprints: MenuBlueprint[]): SiteMenuItem[] {
  const sorted = [...blueprints].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return sorted.map((blueprint, index) =>
    makeMenu(
      { ...blueprint, order: blueprint.order ?? index },
      convertBlueprintsToMenus(blueprint.children ?? []),
    ),
  );
}

function convertMenusToBlueprints(menus: SiteMenuItem[]): MenuBlueprint[] {
  return menus.map((menu) => ({
    id: menu.id,
    label: menu.label,
    icon: menu.icon ?? undefined,
    to: menu.to ?? undefined,
    requiresAdmin: menu.requiresAdmin,
    translate: menu.translate,
    isVisible: menu.isVisible,
    order: menu.order,
    children: menu.children ? convertMenusToBlueprints(menu.children) : undefined,
  }));
}

function cloneMenuTree(menus: SiteMenuItem[]): SiteMenuItem[] {
  return menus.map((menu) => ({
    ...menu,
    children: menu.children ? cloneMenuTree(menu.children) : undefined,
  }));
}

const DEFAULT_CONTENT_UPDATED_AT = "2024-01-01T00:00:00.000Z";

const DEFAULT_SITE_NAME = "BroWorld";
const DEFAULT_TAGLINE = "Build vibrant communities with a bold design system.";

const defaultAboutContent: SiteContentBlock = {
  title: "The BroWorld mission",
  subtitle: "Designing social universes for modern communities.",
  body: "BroWorld empowers product teams to craft immersive, community-driven experiences with rapid iteration and consistent branding.",
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const defaultContactContent: SiteContentBlock = {
  title: "Contact the BroWorld crew",
  subtitle: "We’re here to help you launch bold social platforms.",
  body: "Reach us at support@broworld.com for partnership, support, or press enquiries.",
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const defaultHelpContent: SiteContentBlock = {
  title: "Help centre",
  subtitle: "Guides and resources to master BroWorld’s toolkit.",
  body: "Browse quick links, tutorials, and FAQs to get answers in minutes.",
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

type LocalizedContentOverrides = {
  tagline?: string | null;
  pages?: Partial<Record<keyof SiteLocalizedSettings["pages"], SiteContentBlock>>;
};

const localizedContentOverrides: Partial<Record<string, LocalizedContentOverrides>> = {
  fr: {
    tagline: "Construisez des communautés dynamiques avec un système de design audacieux.",
    pages: {
      about: {
        title: "La mission de BroWorld",
        subtitle: "Concevoir des univers sociaux pour les communautés modernes.",
        body: "BroWorld aide les équipes produit à créer des expériences immersives centrées sur la communauté, avec une itération rapide et une identité de marque cohérente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contactez l'équipage BroWorld",
        subtitle: "Nous sommes là pour vous aider à lancer des plateformes sociales audacieuses.",
        body: "Contactez-nous à support@broworld.com pour toute demande de partenariat, d'assistance ou de presse.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centre d'aide",
        subtitle: "Guides et ressources pour maîtriser la boîte à outils de BroWorld.",
        body: "Parcourez des liens rapides, des tutoriels et des FAQ pour obtenir des réponses en quelques minutes.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
  de: {
    tagline: "Baue lebendige Communities mit einem mutigen Designsystem.",
    pages: {
      about: {
        title: "Die Mission von BroWorld",
        subtitle: "Soziale Universen für moderne Gemeinschaften gestalten.",
        body: "BroWorld befähigt Produktteams, immersive, communityorientierte Erlebnisse mit schnellen Iterationen und konsistentem Branding zu entwickeln.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Kontaktiere die BroWorld-Crew",
        subtitle: "Wir helfen dir, mutige soziale Plattformen zu starten.",
        body: "Erreiche uns unter support@broworld.com für Partnerschaften, Support oder Presseanfragen.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Hilfecenter",
        subtitle: "Leitfäden und Ressourcen, um das BroWorld-Toolkit zu meistern.",
        body: "Durchstöbere Schnellzugriffe, Tutorials und FAQs, um in wenigen Minuten Antworten zu erhalten.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
  es: {
    tagline: "Crea comunidades vibrantes con un sistema de diseño audaz.",
    pages: {
      about: {
        title: "La misión de BroWorld",
        subtitle: "Diseñamos universos sociales para las comunidades modernas.",
        body: "BroWorld ayuda a los equipos de producto a crear experiencias inmersivas impulsadas por la comunidad con iteraciones rápidas y una marca coherente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contacta al equipo de BroWorld",
        subtitle: "Estamos aquí para ayudarte a lanzar plataformas sociales audaces.",
        body: "Escríbenos a support@broworld.com para colaboraciones, soporte o consultas de prensa.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centro de ayuda",
        subtitle: "Guías y recursos para dominar las herramientas de BroWorld.",
        body: "Explora accesos directos, tutoriales y preguntas frecuentes para obtener respuestas en minutos.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
  it: {
    tagline: "Crea community vibranti con un design system audace.",
    pages: {
      about: {
        title: "La missione di BroWorld",
        subtitle: "Progettiamo universi sociali per le comunità moderne.",
        body: "BroWorld permette ai team di prodotto di creare esperienze immersive guidate dalla community con iterazioni rapide e un brand coerente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contatta l'equipaggio di BroWorld",
        subtitle: "Siamo qui per aiutarti a lanciare piattaforme social audaci.",
        body: "Scrivici a support@broworld.com per collaborazioni, assistenza o richieste stampa.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centro assistenza",
        subtitle: "Guide e risorse per padroneggiare il toolkit di BroWorld.",
        body: "Consulta link rapidi, tutorial e FAQ per ottenere risposte in pochi minuti.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
  ru: {
    tagline: "Создавайте яркие сообщества с дерзкой дизайн-системой.",
    pages: {
      about: {
        title: "Миссия BroWorld",
        subtitle: "Проектируем социальные вселенные для современных сообществ.",
        body: "BroWorld помогает продуктовым командам создавать иммерсивные, ориентированные на сообщество впечатления с быстрой итерацией и последовательным брендингом.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Свяжитесь с командой BroWorld",
        subtitle: "Мы поможем вам запустить смелые социальные платформы.",
        body: "Пишите на support@broworld.com по вопросам партнёрства, поддержки или для прессы.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Справочный центр",
        subtitle: "Руководства и ресурсы, чтобы освоить инструменты BroWorld.",
        body: "Просматривайте быстрые ссылки, учебные материалы и ответы на вопросы, чтобы получать информацию за считанные минуты.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
  ar: {
    tagline: "ابنِ مجتمعات نابضة بالحياة مع نظام تصميم جريء.",
    pages: {
      about: {
        title: "مهمة BroWorld",
        subtitle: "نصمم عوالم اجتماعية للمجتمعات المعاصرة.",
        body: "تمكّن BroWorld فرق المنتجات من ابتكار تجارب غامرة يقودها المجتمع مع وتيرة تطوير سريعة وهوية علامة تجارية متسقة.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "تواصل مع فريق BroWorld",
        subtitle: "نحن هنا لمساعدتك على إطلاق منصات اجتماعية جريئة.",
        body: "تواصل معنا عبر support@broworld.com للشراكات أو الدعم أو استفسارات الصحافة.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "مركز المساعدة",
        subtitle: "أدلة وموارد لإتقان مجموعة أدوات BroWorld.",
        body: "تصفح الروابط السريعة والدروس والأسئلة الشائعة لتحصل على الإجابات في دقائق.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
    },
  },
};

const defaultLanguages: SiteLanguageDefinition[] = supportedLanguages.map((language) => ({
  code: language.code,
  label: language.label,
  endonym: language.endonym,
  enabled: true,
}));

const defaultLocalizedSettings: Record<string, SiteLocalizedSettings> = Object.fromEntries(
  defaultLanguages.map((language) => {
    const overrides = localizedContentOverrides[language.code];

    return [
      language.code,
      {
        tagline: overrides?.tagline ?? DEFAULT_TAGLINE,
        pages: {
          about: makeContentBlock(overrides?.pages?.about ?? defaultAboutContent),
          contact: makeContentBlock(overrides?.pages?.contact ?? defaultContactContent),
          help: makeContentBlock(overrides?.pages?.help ?? defaultHelpContent),
        },
      } satisfies SiteLocalizedSettings,
    ];
  }),
);

const BASE_MENU_BLUEPRINTS: MenuBlueprint[] = [
  {
    id: "home",
    label: "layout.sidebar.items.home",
    icon: "mdi:home-variant-outline",
    translate: true,
    to: "/home",
    isVisible: true,
    order: -2,
  },
  {
    id: "create-world",
    label: "layout.sidebar.items.createWorld",
    icon: "mdi:earth-plus",
    translate: true,
    to: "/world-create",
    isVisible: true,
    order: -1,
  },
  {
    id: "admin",
    label: "layout.sidebar.items.admin",
    icon: "mdi:shield-crown",
    translate: true,
    requiresAdmin: true,
    isVisible: true,
    order: 6,
    children: [
      {
        id: "admin-general",
        label: "layout.sidebar.items.adminGeneral",
        icon: "mdi:view-dashboard-outline",
        translate: true,
        requiresAdmin: true,
        isVisible: true,
        order: 0,
        children: [
          {
            id: "admin-general-overview",
            label: "layout.sidebar.items.adminGeneral",
            icon: "mdi:view-dashboard-outline",
            translate: true,
            to: "/admin",
            requiresAdmin: true,
            isVisible: true,
            order: 0,
          },
          {
            id: "admin-general-statistics",
            label: "layout.sidebar.items.adminStatistics",
            icon: "mdi:chart-box-outline",
            translate: true,
            to: "/admin/statistics",
            requiresAdmin: true,
            isVisible: true,
            order: 1,
          },
          {
            id: "admin-general-performance",
            label: "layout.sidebar.items.performance",
            icon: "mdi:speedometer",
            translate: true,
            to: "/admin/performance",
            requiresAdmin: true,
            isVisible: true,
            order: 2,
          },
          {
            id: "admin-general-settings",
            label: "layout.sidebar.items.adminSettings",
            icon: "mdi:cog-outline",
            translate: true,
            to: "/admin/settings",
            requiresAdmin: true,
            isVisible: true,
            order: 4,
          },
        ],
      },
      {
        id: "admin-user-management",
        label: "layout.sidebar.items.adminUserManagement",
        icon: "mdi:account-cog-outline",
        translate: true,
        requiresAdmin: true,
        isVisible: true,
        order: 2,
        children: [
          {
            id: "admin-user-general",
            label: "layout.sidebar.items.adminGeneralSetting",
            icon: "mdi:tune",
            translate: true,
            to: "/admin/user-management",
            requiresAdmin: true,
            isVisible: true,
            order: 0,
          },
          {
            id: "admin-user-data",
            label: "layout.sidebar.items.adminData",
            icon: "mdi:database-outline",
            translate: true,
            to: "/admin/user-management/data",
            requiresAdmin: true,
            isVisible: true,
            order: 1,
          },
          {
            id: "admin-user-crons",
            label: "layout.sidebar.items.adminCrons",
            icon: "mdi:clock-outline",
            translate: true,
            to: "/admin/user-management/crons",
            requiresAdmin: true,
            isVisible: true,
            order: 2,
          },
        ],
      },
    ],
  },
];

const PLUGIN_MENU_CONTRIBUTIONS: Record<string, MenuBlueprint[]> = {
  "job-board": [
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
  game: [
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
  crm: [
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
  ecommerce: [
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
  education: [
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
  blog: [
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
};

export const DEFAULT_WORLD_PLUGIN_IDS = [
  "messenger",
  "job-board",
  "game",
  "crm",
  "ecommerce",
  "education",
  "blog",
] as const;

function buildPluginMenuBlueprints(selectedPluginIds: Iterable<string>): MenuBlueprint[] {
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

    const contributions = PLUGIN_MENU_CONTRIBUTIONS[normalized];
    if (!contributions?.length) {
      seen.add(normalized);
      continue;
    }

    merged = mergeMenuBlueprints(merged, contributions);
    seen.add(normalized);
  }

  return merged;
}

export function buildMenusForPlugins(
  selectedPluginIds: Iterable<string>,
  _locale?: string,
): SiteMenuItem[] {
  return convertBlueprintsToMenus(buildPluginMenuBlueprints(selectedPluginIds));
}

export function composeMenusWithPlugins(
  baseMenus: SiteMenuItem[],
  selectedPluginIds: Iterable<string>,
  _locale?: string,
): SiteMenuItem[] {
  const baseBlueprints = convertMenusToBlueprints(baseMenus);
  const pluginBlueprints = buildPluginMenuBlueprints(selectedPluginIds);

  if (!pluginBlueprints.length) {
    return convertBlueprintsToMenus(baseBlueprints);
  }

  return convertBlueprintsToMenus(mergeMenuBlueprints(baseBlueprints, pluginBlueprints));
}

export function getDefaultMenuBlueprints(): SiteMenuItem[] {
  return convertBlueprintsToMenus(BASE_MENU_BLUEPRINTS);
}

const defaultMenuBlueprints = getDefaultMenuBlueprints();
const defaultMenus = composeMenusWithPlugins(defaultMenuBlueprints, DEFAULT_WORLD_PLUGIN_IDS);

const homeWorld: SiteWorldSettings = {
  id: "home",
  name: "Community Feed",
  slug: "home",
  pluginIds: ["blog", "messenger", "education"],
  locale: defaultLanguageCode,
  description: "Stay in sync with every launch, announcement, and story across BroWorld.",
  visibility: "public",
  region: "global",
  theme: "aurora",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["featured", "global"],
  guidelines: "Celebrate each other, share wins, and keep the feed inspiring.",
  enableMonetization: false,
  enableIntegrations: true,
  requireVerification: false,
  allowGuests: true,
  createdBy: {
    name: "BroWorld Core Team",
    handle: "@bro.world",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const defaultWorld: SiteWorldSettings = {
  id: "bro-world",
  name: DEFAULT_SITE_NAME,
  slug: "bro-world",
  pluginIds: Array.from(DEFAULT_WORLD_PLUGIN_IDS),
  locale: defaultLanguageCode,
  description: null,
  visibility: "public",
  region: "global",
  theme: "aurora",
  launchDate: "",
  tags: [],
  guidelines: "",
  enableMonetization: true,
  enableIntegrations: true,
  requireVerification: false,
  allowGuests: true,
  createdBy: {
    name: "Aurora Studio",
    handle: "@aurora",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const innovationWorld: SiteWorldSettings = {
  id: "innovation-lab",
  name: "Innovation Lab",
  slug: "innovation-lab",
  pluginIds: ["game", "education", "crm"],
  locale: "en",
  description:
    "Prototype gamified onboarding loops, product experiments, and cross-team rituals in a safe sandbox.",
  visibility: "private",
  region: "north-america",
  theme: "midnight",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["beta", "experiments"],
  guidelines: "Keep conversations confidential and ship new ideas weekly.",
  enableMonetization: false,
  enableIntegrations: true,
  requireVerification: true,
  allowGuests: false,
  createdBy: {
    name: "Skunkworks Crew",
    handle: "@innovation",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const marketplaceWorld: SiteWorldSettings = {
  id: "creator-market",
  name: "Creator Market",
  slug: "creator-market",
  pluginIds: ["ecommerce", "crm", "blog"],
  locale: "en",
  description:
    "Connect with verified creators, launch product drops, and manage partnerships in one vibrant hub.",
  visibility: "public",
  region: "global",
  theme: "sunrise",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["commerce", "community"],
  guidelines: "Promote collaborations that uplift the community and credit every contributor.",
  enableMonetization: true,
  enableIntegrations: true,
  requireVerification: true,
  allowGuests: false,
  createdBy: {
    name: "Marketplace Guild",
    handle: "@market",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const designWorld: SiteWorldSettings = {
  id: "design-sprint-hq",
  name: "Design Sprint HQ",
  slug: "design-sprint-hq",
  pluginIds: ["education", "messenger", "blog"],
  locale: "en",
  description:
    "Run async workshops, publish recaps, and align the entire product squad in one vibrant studio.",
  visibility: "public",
  region: "europe-west",
  theme: "sunrise",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["design", "collaboration"],
  guidelines: "Keep feedback actionable, celebrate learnings, and document every sprint.",
  enableMonetization: false,
  enableIntegrations: true,
  requireVerification: false,
  allowGuests: true,
  createdBy: {
    name: "Pixelcraft Collective",
    handle: "@pixelcraft",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const talentWorld: SiteWorldSettings = {
  id: "talent-network",
  name: "Talent Network",
  slug: "talent-network",
  pluginIds: ["job-board", "crm", "messenger"],
  locale: "en",
  description:
    "Spot rising builders, manage outreach campaigns, and coordinate interviews with the hiring crew.",
  visibility: "private",
  region: "global",
  theme: "aurora",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["hiring", "operations"],
  guidelines: "Share referrals with context, respect candidate privacy, and keep pipelines tidy.",
  enableMonetization: false,
  enableIntegrations: true,
  requireVerification: true,
  allowGuests: false,
  createdBy: {
    name: "People Ops Guild",
    handle: "@peopleops",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const esportsWorld: SiteWorldSettings = {
  id: "esports-lounge",
  name: "Esports Lounge",
  slug: "esports-lounge",
  pluginIds: ["game", "messenger", "education"],
  locale: "en",
  description:
    "Host scrim reviews, share tournament highlights, and coach every roster with data-rich playbooks.",
  visibility: "public",
  region: "asia-pacific",
  theme: "midnight",
  launchDate: DEFAULT_CONTENT_UPDATED_AT,
  tags: ["gaming", "community"],
  guidelines: "Keep callouts constructive, respect scrim NDAs, and hype every victory together.",
  enableMonetization: true,
  enableIntegrations: true,
  requireVerification: true,
  allowGuests: false,
  createdBy: {
    name: "Arena Ops Squad",
    handle: "@arena",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

export const defaultSiteSettings: SiteSettings = {
  siteName: DEFAULT_SITE_NAME,
  tagline: DEFAULT_TAGLINE,
  activeThemeId: "aurora",
  themes: [
    makeTheme({
      id: "aurora",
      name: "Aurora",
      description: "Gradient-rich palette blending violet and pink hues.",
      primaryColor: "#2563EB",
      accentColor: "#38BDF8",
      surfaceColor: "#0F172A",
    }),
    makeTheme({
      id: "midnight",
      name: "Midnight",
      description: "Deep blues with electric highlights for dark interfaces.",
      primaryColor: "#7C3AED",
      accentColor: "#F472B6",
      surfaceColor: "#F4F7FC",
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
    about: makeContentBlock(defaultAboutContent),
    contact: makeContentBlock(defaultContactContent),
    help: makeContentBlock(defaultHelpContent),
  },
  menuBlueprints: cloneMenuTree(defaultMenuBlueprints),
  menus: cloneMenuTree(defaultMenus),
  worlds: [
    {
      ...homeWorld,
      pluginIds: [...homeWorld.pluginIds],
      tags: [...(homeWorld.tags ?? [])],
    },
    {
      ...defaultWorld,
      pluginIds: [...defaultWorld.pluginIds],
      tags: [...(defaultWorld.tags ?? [])],
    },
    {
      ...innovationWorld,
      pluginIds: [...innovationWorld.pluginIds],
      tags: [...(innovationWorld.tags ?? [])],
    },
    {
      ...marketplaceWorld,
      pluginIds: [...marketplaceWorld.pluginIds],
      tags: [...(marketplaceWorld.tags ?? [])],
    },
    {
      ...designWorld,
      pluginIds: [...designWorld.pluginIds],
      tags: [...(designWorld.tags ?? [])],
    },
    {
      ...talentWorld,
      pluginIds: [...talentWorld.pluginIds],
      tags: [...(talentWorld.tags ?? [])],
    },
    {
      ...esportsWorld,
      pluginIds: [...esportsWorld.pluginIds],
      tags: [...(esportsWorld.tags ?? [])],
    },
  ],
  activeWorldId: homeWorld.id,
  defaultLanguage: defaultLanguageCode,
  languages: defaultLanguages,
  localized: defaultLocalizedSettings,
  updatedAt: new Date(0).toISOString(),
};

export function getDefaultSiteSettings(): SiteSettings {
  return structuredClone(defaultSiteSettings);
}
