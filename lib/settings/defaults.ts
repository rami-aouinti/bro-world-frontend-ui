import type {
  SiteSettings,
  SiteMenuItem,
  SiteThemeDefinition,
  SiteProfileSettings,
  SiteUiSettings,
  SiteContentBlock,
  SiteLanguageDefinition,
  SiteLocalizedSettings,
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
        body:
          "BroWorld aide les équipes produit à créer des expériences immersives centrées sur la communauté, avec une itération rapide et une identité de marque cohérente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contactez l'équipage BroWorld",
        subtitle: "Nous sommes là pour vous aider à lancer des plateformes sociales audacieuses.",
        body:
          "Contactez-nous à support@broworld.com pour toute demande de partenariat, d'assistance ou de presse.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centre d'aide",
        subtitle: "Guides et ressources pour maîtriser la boîte à outils de BroWorld.",
        body:
          "Parcourez des liens rapides, des tutoriels et des FAQ pour obtenir des réponses en quelques minutes.",
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
        body:
          "BroWorld befähigt Produktteams, immersive, communityorientierte Erlebnisse mit schnellen Iterationen und konsistentem Branding zu entwickeln.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Kontaktiere die BroWorld-Crew",
        subtitle: "Wir helfen dir, mutige soziale Plattformen zu starten.",
        body:
          "Erreiche uns unter support@broworld.com für Partnerschaften, Support oder Presseanfragen.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Hilfecenter",
        subtitle: "Leitfäden und Ressourcen, um das BroWorld-Toolkit zu meistern.",
        body:
          "Durchstöbere Schnellzugriffe, Tutorials und FAQs, um in wenigen Minuten Antworten zu erhalten.",
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
        body:
          "BroWorld ayuda a los equipos de producto a crear experiencias inmersivas impulsadas por la comunidad con iteraciones rápidas y una marca coherente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contacta al equipo de BroWorld",
        subtitle: "Estamos aquí para ayudarte a lanzar plataformas sociales audaces.",
        body:
          "Escríbenos a support@broworld.com para colaboraciones, soporte o consultas de prensa.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centro de ayuda",
        subtitle: "Guías y recursos para dominar las herramientas de BroWorld.",
        body:
          "Explora accesos directos, tutoriales y preguntas frecuentes para obtener respuestas en minutos.",
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
        body:
          "BroWorld permette ai team di prodotto di creare esperienze immersive guidate dalla community con iterazioni rapide e un brand coerente.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Contatta l'equipaggio di BroWorld",
        subtitle: "Siamo qui per aiutarti a lanciare piattaforme social audaci.",
        body:
          "Scrivici a support@broworld.com per collaborazioni, assistenza o richieste stampa.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Centro assistenza",
        subtitle: "Guide e risorse per padroneggiare il toolkit di BroWorld.",
        body:
          "Consulta link rapidi, tutorial e FAQ per ottenere risposte in pochi minuti.",
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
        body:
          "BroWorld помогает продуктовым командам создавать иммерсивные, ориентированные на сообщество впечатления с быстрой итерацией и последовательным брендингом.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "Свяжитесь с командой BroWorld",
        subtitle: "Мы поможем вам запустить смелые социальные платформы.",
        body:
          "Пишите на support@broworld.com по вопросам партнёрства, поддержки или для прессы.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "Справочный центр",
        subtitle: "Руководства и ресурсы, чтобы освоить инструменты BroWorld.",
        body:
          "Просматривайте быстрые ссылки, учебные материалы и ответы на вопросы, чтобы получать информацию за считанные минуты.",
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
        body:
          "تمكّن BroWorld فرق المنتجات من ابتكار تجارب غامرة يقودها المجتمع مع وتيرة تطوير سريعة وهوية علامة تجارية متسقة.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      contact: {
        title: "تواصل مع فريق BroWorld",
        subtitle: "نحن هنا لمساعدتك على إطلاق منصات اجتماعية جريئة.",
        body:
          "تواصل معنا عبر support@broworld.com للشراكات أو الدعم أو استفسارات الصحافة.",
        updatedAt: DEFAULT_CONTENT_UPDATED_AT,
      },
      help: {
        title: "مركز المساعدة",
        subtitle: "أدلة وموارد لإتقان مجموعة أدوات BroWorld.",
        body:
          "تصفح الروابط السريعة والدروس والأسئلة الشائعة لتحصل على الإجابات في دقائق.",
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
  menus: [
    makeMenu({
      id: "create-world",
      label: "layout.sidebar.items.createWorld",
      icon: "mdi:earth-plus",
      translate: true,
      to: "/world-create",
      isVisible: true,
      order: -1,
    }),
    makeMenu({
      id: "jobs",
      label: "layout.sidebar.items.jobs",
      icon: "mdi:briefcase-search",
      translate: true,
      to: "/job",
      isVisible: true,
      order: 0,
    }),
    makeMenu({
      id: "game",
      label: "layout.sidebar.items.game",
      icon: "mdi:gamepad-variant-outline",
      translate: true,
      to: "/game",
      isVisible: true,
      order: 1,
    }),
    makeMenu(
      {
        id: "ecommerce",
        label: "layout.sidebar.items.ecommerce",
        icon: "mdi:shopping-outline",
        translate: true,
        to: "/ecommerce",
        isVisible: true,
        order: 2,
      },
      [
        {
          id: "ecommerce-overview",
          label: "layout.sidebar.items.ecommerceOverview",
          translate: true,
          to: "/ecommerce",
          icon: "mdi:view-dashboard-outline",
        },
        {
          id: "ecommerce-catalog",
          label: "layout.sidebar.items.ecommerceCatalog",
          translate: true,
          to: "/ecommerce/catalog",
          icon: "mdi:view-grid-outline",
        },
        {
          id: "ecommerce-cart",
          label: "layout.sidebar.items.ecommerceCart",
          translate: true,
          to: "/ecommerce/cart",
          icon: "mdi:cart",
        },
        {
          id: "ecommerce-checkout",
          label: "layout.sidebar.items.ecommerceCheckout",
          translate: true,
          to: "/ecommerce/checkout",
          icon: "mdi:credit-card-check-outline",
        },
      ],
    ),
    makeMenu({
      id: "education",
      label: "layout.sidebar.items.education",
      icon: "mdi:school-outline",
      translate: true,
      to: "/education",
      isVisible: true,
      order: 3,
    }),
    makeMenu({
      id: "academy",
      label: "layout.sidebar.items.academy",
      icon: "mdi:school-outline",
      translate: true,
      to: "/academy",
      isVisible: true,
      order: 4,
    }),
    makeMenu({
      id: "quiz",
      label: "layout.sidebar.items.quiz",
      icon: "mdi:clipboard-text-outline",
      translate: true,
      to: "/quiz",
      isVisible: true,
      order: 5,
    }),
    makeMenu(
      {
        id: "admin",
        label: "layout.sidebar.items.admin",
        icon: "mdi:shield-crown",
        translate: true,
        requiresAdmin: true,
        isVisible: true,
        order: 5,
      },
      [
        makeMenu(
          {
            id: "admin-general",
            label: "layout.sidebar.items.adminGeneral",
            icon: "mdi:view-dashboard-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 0,
          },
          [
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
              order: 3,
            },
          ],
        ),
        makeMenu(
          {
            id: "admin-blog-management",
            label: "layout.sidebar.items.adminBlogManagement",
            icon: "mdi:post-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 1,
          },
          [
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
        ),
        makeMenu(
          {
            id: "admin-user-management",
            label: "layout.sidebar.items.adminUserManagement",
            icon: "mdi:account-cog-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 2,
          },
          [
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
        ),
        makeMenu(
          {
            id: "admin-job-management",
            label: "layout.sidebar.items.adminJobManagement",
            icon: "mdi:briefcase-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 3,
          },
          [
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
        ),
        makeMenu(
          {
            id: "admin-ecommerce-management",
            label: "layout.sidebar.items.adminEcommerceManagement",
            icon: "mdi:shopping-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 4,
          },
          [
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
        ),
        makeMenu(
          {
            id: "admin-education-management",
            label: "layout.sidebar.items.adminEducationManagement",
            icon: "mdi:school-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 5,
          },
          [
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
        ),
        makeMenu(
          {
            id: "admin-game-management",
            label: "layout.sidebar.items.adminGameManagement",
            icon: "mdi:gamepad-variant-outline",
            translate: true,
            requiresAdmin: true,
            isVisible: true,
            order: 6,
          },
          [
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
        ),
      ],
    ),
  ],
  defaultLanguage: defaultLanguageCode,
  languages: defaultLanguages,
  localized: defaultLocalizedSettings,
  updatedAt: new Date(0).toISOString(),
};

export function getDefaultSiteSettings(): SiteSettings {
  return structuredClone(defaultSiteSettings);
}
