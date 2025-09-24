// https://nuxt.com/docs/api/configuration/nuxt-config
import os from 'node:os'
import { webcrypto } from 'node:crypto'
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import compression from 'vite-plugin-compression'
import { aliases } from 'vuetify/iconsets/mdi'

const globalScope = globalThis as typeof globalThis & {
  crypto: Crypto | undefined
  Blob: typeof NodeBlob | undefined
  File: typeof NodeFile | undefined
}

if (!globalScope.crypto || typeof globalScope.crypto.getRandomValues !== 'function') {
  globalScope.crypto = webcrypto as Crypto
}

if (typeof globalScope.Blob !== 'function') {
  globalScope.Blob = NodeBlob
}

if (typeof globalScope.File !== 'function') {
  globalScope.File = NodeFile
}

const osWithAvailableParallelism = os as typeof os & {
  availableParallelism?: () => number
}

if (typeof osWithAvailableParallelism.availableParallelism !== 'function') {
  Object.defineProperty(osWithAvailableParallelism, 'availableParallelism', {
    configurable: true,
    enumerable: false,
    value: () => {
      try {
        const cpuInfo = os.cpus()
        return Array.isArray(cpuInfo) && cpuInfo.length > 0 ? cpuInfo.length : 1
      } catch {
        return 1
      }
    },
  })
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: [{ src: "~/plugins/clarity.js", mode: "client" }, "~/plugins/vuetify"],

  css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.css", "~/assets/styles/index.css"],

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    plugins: [
      cssInjectedByJsPlugin(),
      compression({ algorithm: 'brotliCompress' }),
    ],
    build: {
      sourcemap: false,
      optimizeCSS: true,
      splitChunks: {
        layouts: true,
        pages: true,
        commons: true
      }
    },
  },

  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "nuxt-gtag",
    "@nuxt/eslint",
    "@nuxt/scripts",
    "motion-v/nuxt",
    "lenis/nuxt",
    "@nuxtjs/i18n",
    "nuxt-llms",
  ],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
      ignore: ["**/index.ts", "**/shaders.ts", "**/types.ts"],
    },
  ],
  extends: ['@nuxt/ui-pro'],
  plugins: [
    '~/plugins/vuetify-i18n.ts'
  ],
  sitemap: {
    siteUrl: 'https://bro-world-space.com',
    trailingSlash: false,
    gzip: true,
  },

  sourcemap: {
    server: true,
    client: true,
  },

  ui: {
    icons: ["heroicons", "lucide"],
    safelistColors: ['primary', 'red', 'orange', 'green'],
  },

  experimental: {
    typedPages: true,
    componentIslands: false,
    payloadExtraction: true,
  },

  typescript: {
    shim: false,
    strict: true,
  },

  vue: {
    propsDestructure: true,
  },

  vueuse: {
    ssrHandlers: true,
  },

  i18n: {
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'en',
    },
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', icon: 'fi-gb gb', file: 'en.json' },
      { code: 'de', name: 'Deutsch', iso: 'de-DE', icon: 'fi-de de', file: 'de.json' },
      { code: 'fr', name: 'Frensh', iso: 'fr-FR', icon: 'fi-fr fr', file: 'fr.json' },
      { code: 'ar', name: 'Arabic', iso: 'tn-TN', icon: 'fi-tn tn', file: 'ar.json' },
    ],
    baseUrl: 'https://bro-world-space.com'
  },

  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        viewportSize: true,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {},
        reloadOnFirstRequest: true,
      },
    },
  },

  icon: {
    clientBundle: {
      icons: Object.values(aliases).map((v) => (v as string).replace(/^mdi-/, 'mdi:')),
      scan: true,
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './assets/icons',
      },
    ],
  },

  image: {
    dir: 'public',
    domains: ['images.unsplash.com'],
    screens: {
      sm: 320,
      md: 640,
      lg: 1024,
      xl: 1280,
    },
    quality: 80,
    ipx: {
      dir: 'public',
      allowFiles: true,
      domains: [],
    },
    presets: {
      lcp: {
        modifiers: {
          format: 'webp',
          quality: 80,
        },
      },
    },
  },
  echarts: {
    charts: ['LineChart', 'BarChart', 'PieChart', 'RadarChart'],
    renderer: 'svg',
    components: [
      'DataZoomComponent',
      'LegendComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'GridComponent',
      'TitleComponent',
      'DatasetComponent',
      'VisualMapComponent',
    ],
  },

  ignore: ["components/**/index.ts", "components/**/shaders.ts", "components/**/types.ts"],

  runtimeConfig: {
    public: {
      NUXT_CLARITY_ID: process.env.NUXT_CLARITY_ID,
      NUXT_ADSENSE_ACCOUNT: process.env.NUXT_ADSENSE_ACCOUNT,
      blogApiEndpoint: process.env.NUXT_PUBLIC_BLOG_API_ENDPOINT ?? "http://localhost/public/post",
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  app: {
    head: {
      meta: [
        {
          name: "google-adsense-account",
          content: process.env.NUXT_ADSENSE_ACCOUNT,
        },
      ],
    },
    baseURL: process.env.NODE_ENV === "development" ? "/" : "/docs/",
  },
  llms: {
    domain: "https://broworld.com/",
    title: "BroWorld",
    description:
      "BroWorld is a free and open-source Vue.js component library that provides a collection of beautiful and customizable components for building modern web applications.",
    full: {
      title: "BroWorld Documentation",
      description: "The complete BroWorld documentation.",
    },
  },
  fonts: {
    processCSSVariables: true,
    families: [
      {
        name: "Plus Jakarta Sans",
        provider: "google",
        global: true,
        weights: [300, 400, 500, 600, 700],
      },
      {
        name: "Space Grotesk",
        provider: "google",
        global: true,
        weights: [300, 400, 500, 600, 700],
      },
      {
        name: "JetBrains Mono",
        provider: "google",
        global: true,
        weights: [300, 400, 500, 600, 700],
      },
    ],
  },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2025-06-10",
});
