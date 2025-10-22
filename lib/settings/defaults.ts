import type {
  SiteSettings,
  SiteMenuItem,
  SiteThemeDefinition,
  SiteProfileSettings,
  SiteUiSettings,
  SiteContentBlock,
  SiteLanguageDefinition,
  SiteLocalizedSettings,
  SiteWorldCreator,
  SiteWorldSettings,
} from "~/types/settings";
import { defaultLanguageCode, supportedLanguages } from "~/lib/i18n/languages";
import {
  cloneMenuTree,
  convertBlueprintsToMenus,
  convertMenusToBlueprints,
  mergeMenuBlueprints,
} from "~/lib/navigation/menu-blueprints";
import type { MenuBlueprint } from "~/lib/navigation/menu-blueprints";
import { getAllPluginIds, getPluginMenuBlueprints } from "~/lib/navigation/plugins";

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

export const DEFAULT_WORLD_PLUGIN_IDS: readonly string[] = getAllPluginIds();

export function buildMenusForPlugins(
  selectedPluginIds: Iterable<string>,
  _locale?: string,
): SiteMenuItem[] {
  return convertBlueprintsToMenus(getPluginMenuBlueprints(selectedPluginIds));
}

export function composeMenusWithPlugins(
  baseMenus: SiteMenuItem[],
  selectedPluginIds: Iterable<string>,
  _locale?: string,
): SiteMenuItem[] {
  const baseBlueprints = convertMenusToBlueprints(baseMenus);
  const pluginBlueprints = getPluginMenuBlueprints(selectedPluginIds);

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

const defaultWorldCreator: SiteWorldCreator = {
  id: "bro-world-team",
  name: "BroWorld Team",
  avatar: null,
};

const homeWorld: {
  pluginIds: string[];
  visibility: string;
  enableMonetization: boolean;
  description: string;
  launchDate: string;
  locale: string;
  tags: string[];
  createdAt: string;
  createdBy: { avatarUrl: null; name: string; handle: string };
  allowGuests: boolean;
  name: string;
  requireVerification: boolean;
  guidelines: string;
  theme: string;
  id: string;
  region: string;
  enableIntegrations: boolean;
  slug: string;
  updatedAt: string;
  participantsCount: number;
  rating: number;
} = {
  id: "home",
  name: "Community Feed",
  slug: "home",
  pluginIds: ["blog", "education"],
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
  participantsCount: 18450,
  rating: 4.9,
  createdBy: {
    name: "BroWorld Core Team",
    handle: "@bro.world",
    avatarUrl: null,
  },
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const defaultWorld: {
  pluginIds: string[];
  visibility: string;
  enableMonetization: boolean;
  description: null;
  launchDate: string;
  locale: string;
  tags: string[];
  createdAt: string;
  createdBy: { name: string; id: string; avatar?: string | null };
  allowGuests: boolean;
  name: string;
  requireVerification: boolean;
  guidelines: string;
  theme: string;
  id: string;
  region: string;
  enableIntegrations: boolean;
  slug: string;
  updatedAt: string;
  participantsCount: number;
  rating: number;
} = {
  id: "bro-world",
  name: DEFAULT_SITE_NAME,
  slug: "bro-world",
  pluginIds: Array.from(DEFAULT_WORLD_PLUGIN_IDS),
  createdBy: { ...defaultWorldCreator },
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
  participantsCount: 9620,
  rating: 4.8,
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
  participantsCount: 2840,
  rating: 4.6,
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
  participantsCount: 5130,
  rating: 4.7,
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const designWorld: SiteWorldSettings = {
  id: "design-sprint-hq",
  name: "Design Sprint HQ",
  slug: "design-sprint-hq",
  pluginIds: ["education", "blog"],
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
  participantsCount: 3710,
  rating: 4.5,
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const talentWorld: SiteWorldSettings = {
  id: "talent-network",
  name: "Talent Network",
  slug: "talent-network",
  pluginIds: ["job", "crm"],
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
  participantsCount: 1980,
  rating: 4.4,
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

const esportsWorld: SiteWorldSettings = {
  id: "esports-lounge",
  name: "Esports Lounge",
  slug: "esports-lounge",
  pluginIds: [],
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
  participantsCount: 7420,
  rating: 4.8,
  createdAt: DEFAULT_CONTENT_UPDATED_AT,
  updatedAt: DEFAULT_CONTENT_UPDATED_AT,
};

export const defaultSiteSettings: {
  menuBlueprints: SiteMenuItem[];
  worlds: (
    | {
        pluginIds: string[];
        visibility: string;
        enableMonetization: boolean;
        description: string;
        launchDate: string;
        locale: string;
        tags: string[];
        createdAt: string;
        createdBy: { avatarUrl: null; name: string; handle: string };
        allowGuests: boolean;
        name: string;
        requireVerification: boolean;
        guidelines: string;
        theme: string;
        id: string;
        region: string;
        enableIntegrations: boolean;
        slug: string;
        updatedAt: string;
        participantsCount: number;
        rating: number;
      }
    | {
        pluginIds: string[];
        visibility: string;
        enableMonetization: boolean;
        description: null;
        launchDate: string;
        locale: string;
        tags: string[];
        createdAt: string;
        createdBy: { name: string; id: string; avatar?: string | null } | null;
        allowGuests: boolean;
        name: string;
        requireVerification: boolean;
        guidelines: string;
        theme: string;
        id: string;
        region: string;
        enableIntegrations: boolean;
        slug: string;
        updatedAt: string;
        participantsCount: number;
        rating: number;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
        participantsCount?: number;
        rating?: number;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
        participantsCount?: number;
        rating?: number;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
        participantsCount?: number;
        rating?: number;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
        participantsCount?: number;
        rating?: number;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
        participantsCount?: number;
        rating?: number;
      }
  )[];
  languages: SiteLanguageDefinition[];
  profile: SiteProfileSettings;
  localized: Record<string, SiteLocalizedSettings>;
  siteName: string;
  themes: SiteThemeDefinition[];
  pages: { help: SiteContentBlock; contact: SiteContentBlock; about: SiteContentBlock };
  defaultLanguage: string;
  ui: SiteUiSettings;
  tagline: string;
  menus: SiteMenuItem[];
  activeWorldId: string;
  activeThemeId: string;
  updatedAt: string;
} = {
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
      createdBy: defaultWorld.createdBy ? { ...defaultWorld.createdBy } : null,
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

export function getDefaultSiteSettings(): {
  menuBlueprints: SiteMenuItem[];
  worlds: (
    | {
        pluginIds: string[];
        visibility: string;
        enableMonetization: boolean;
        description: string;
        launchDate: string;
        locale: string;
        tags: string[];
        createdAt: string;
        createdBy: { avatarUrl: null; name: string; handle: string };
        allowGuests: boolean;
        name: string;
        requireVerification: boolean;
        guidelines: string;
        theme: string;
        id: string;
        region: string;
        enableIntegrations: boolean;
        slug: string;
        updatedAt: string;
      }
    | {
        pluginIds: string[];
        visibility: string;
        enableMonetization: boolean;
        description: null;
        launchDate: string;
        locale: string;
        tags: string[];
        createdAt: string;
        createdBy: { name: string; id: string; avatar?: string | null } | null;
        allowGuests: boolean;
        name: string;
        requireVerification: boolean;
        guidelines: string;
        theme: string;
        id: string;
        region: string;
        enableIntegrations: boolean;
        slug: string;
        updatedAt: string;
      }
    | {
        pluginIds: string[];
        visibility?: string | null;
        enableMonetization?: boolean;
        description?: string | null;
        launchDate?: string | null;
        locale?: string | null;
        tags: string[];
        createdAt: string;
        createdBy?: SiteWorldCreator | null;
        allowGuests?: boolean;
        name: string;
        requireVerification?: boolean;
        guidelines?: string | null;
        theme?: string | null;
        id: string;
        region?: string | null;
        enableIntegrations?: boolean;
        slug: string;
        updatedAt: string;
      }
  )[];
  languages: SiteLanguageDefinition[];
  profile: SiteProfileSettings;
  localized: Record<string, SiteLocalizedSettings>;
  siteName: string;
  themes: SiteThemeDefinition[];
  pages: { help: SiteContentBlock; contact: SiteContentBlock; about: SiteContentBlock };
  defaultLanguage: string;
  ui: SiteUiSettings;
  tagline: string;
  menus: SiteMenuItem[];
  activeWorldId: string;
  activeThemeId: string;
  updatedAt: string;
} {
  return structuredClone(defaultSiteSettings);
}
