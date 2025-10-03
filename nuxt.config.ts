// https://nuxt.com/docs/api/configuration/nuxt-config
import "./lib/setup-node-crypto";

import http from "node:http";
import https from "node:https";
import os from "node:os";
import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { URL, fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";
import { createRequire } from "node:module";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import compression from "vite-plugin-compression";
import tailwindcss from "@tailwindcss/vite";
import type { PluginOption } from "vite";
import { simplePurgeCssPlugin } from "./lib/vite/simple-purgecss";
import { aliases } from "vuetify/iconsets/mdi";

type FetchHeadersInit = Record<string, string | number | readonly string[]>;

type FetchRequestInit = {
  method?: string;
  headers?: FetchHeadersInit;
  body?: string | Buffer;
};

class SimpleHeaders {
  private readonly headersMap = new Map<string, string>();

  constructor(init?: FetchHeadersInit | http.IncomingHttpHeaders) {
    if (!init) {
      return;
    }

    const entries = Array.isArray(init) ? init : Object.entries(init);

    for (const [rawKey, rawValue] of entries) {
      if (!rawKey || rawValue == null) {
        continue;
      }

      const key = String(rawKey).toLowerCase();
      const value = Array.isArray(rawValue)
        ? rawValue.filter(Boolean).join(", ")
        : String(rawValue);

      if (!value) {
        continue;
      }

      this.headersMap.set(key, value);
    }
  }

  get(name: string): string | null {
    return this.headersMap.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: string): void {
    this.headersMap.set(name.toLowerCase(), value);
  }

  entries(): IterableIterator<[string, string]> {
    return this.headersMap.entries();
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }
}

class SimpleResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: SimpleHeaders;

  constructor(
    private readonly body: Buffer,
    res: http.IncomingMessage,
  ) {
    this.status = res.statusCode ?? 0;
    this.statusText = res.statusMessage ?? "";
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new SimpleHeaders(res.headers);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const cloned = Buffer.from(this.body);
    return cloned.buffer.slice(cloned.byteOffset, cloned.byteOffset + cloned.byteLength);
  }

  async text(): Promise<string> {
    return this.body.toString("utf8");
  }

  async json(): Promise<unknown> {
    const text = await this.text();
    return JSON.parse(text);
  }
}

class SimpleRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: SimpleHeaders;
  readonly body?: string | Buffer;

  constructor(input: string | URL, init?: FetchRequestInit) {
    this.url = typeof input === "string" ? input : input.toString();
    this.method = init?.method ?? "GET";
    this.headers = new SimpleHeaders(init?.headers);
    this.body = init?.body;
  }
}

function createFetch() {
  return function nodeFetch(input: string | URL, init?: FetchRequestInit): Promise<SimpleResponse> {
    const request = new SimpleRequest(input, init);
    const url = new URL(request.url);
    const client = url.protocol === "https:" ? https : http;

    const requestOptions: http.RequestOptions = {
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };

    return new Promise((resolve, reject) => {
      const req = client.request(url, requestOptions, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve(new SimpleResponse(Buffer.concat(chunks), res));
        });
      });

      req.on("error", reject);

      if (request.body) {
        req.write(request.body);
      }

      req.end();
    });
  };
}

const globalScope = globalThis as typeof globalThis & {
  Blob: typeof NodeBlob | undefined;
  File: typeof NodeFile | undefined;
  fetch: ReturnType<typeof createFetch> | undefined;
  Headers: typeof SimpleHeaders | undefined;
  Request: typeof SimpleRequest | undefined;
  Response: typeof SimpleResponse | undefined;
};

if (typeof globalScope.Blob !== "function") {
  globalScope.Blob = NodeBlob;
}

if (typeof globalScope.File !== "function") {
  globalScope.File = NodeFile;
}

if (typeof globalScope.fetch !== "function") {
  globalScope.fetch = createFetch();
}

if (typeof globalScope.Headers !== "function") {
  globalScope.Headers = SimpleHeaders;
}

if (typeof globalScope.Request !== "function") {
  globalScope.Request = SimpleRequest;
}

if (typeof globalScope.Response !== "function") {
  globalScope.Response = SimpleResponse;
}

const osWithAvailableParallelism = os as typeof os & {
  availableParallelism?: () => number;
};

const currentDir = dirname(fileURLToPath(new URL(".", import.meta.url)));
function resolveFromRoot(...segments: string[]) {
  return resolvePath(currentDir, ...segments);
}

const require = createRequire(import.meta.url);
const normalizedLocalPagesDir = resolveFromRoot("pages").replace(/\\/g, "/");

type VuetifyPluginFactory = (options?: { autoImport?: boolean }) => PluginOption | PluginOption[];

let vuetifyPlugin: PluginOption | PluginOption[] | null = null;

try {
  const { default: vuetify } = require("vite-plugin-vuetify") as { default: VuetifyPluginFactory };
  vuetifyPlugin = vuetify({
    autoImport: true,
  });
} catch (error) {
  console.warn(
    `vite-plugin-vuetify not loaded: ${(error as Error | undefined)?.message ?? "unknown error"}`,
  );
}

const iconCollections = ["mdi", "logos", "heroicons", "lucide", "tabler", "vscode-icons"] as const;

function hasIconCollection(name: (typeof iconCollections)[number]) {
  try {
    require.resolve(`@iconify-json/${name}/icons.json`);
    return true;
  } catch {
    return false;
  }
}

const availableIconCollections = iconCollections.filter(hasIconCollection);
const clientBundleCollections = ["mdi", "logos", "heroicons"] as const;
const missingClientBundleCollections = clientBundleCollections.filter(
  (collection) => !availableIconCollections.includes(collection),
);

if (missingClientBundleCollections.length > 0) {
  console.info(
    `Nuxt Icon client bundle disabled: missing icon collections ${missingClientBundleCollections.join(", ")}`,
  );
}

const iconClientBundleConfig =
  missingClientBundleCollections.length === 0
    ? {
        icons: Object.values(aliases).map((v) => (v as string).replace(/^mdi-/, "mdi:")),
        scan: true,
      }
    : false;

const nuxtLayers: string[] = ["shadcn-docs-nuxt"];

try {
  require.resolve("@nuxt/ui-pro/nuxt.config");
  nuxtLayers.unshift("@nuxt/ui-pro");
} catch (error) {
  console.info(
    `@nuxt/ui-pro layer skipped: ${(error as Error | undefined)?.message ?? "Unknown error"}`,
  );
}

if (typeof osWithAvailableParallelism.availableParallelism !== "function") {
  Object.defineProperty(osWithAvailableParallelism, "availableParallelism", {
    configurable: true,
    enumerable: false,
    value: () => {
      try {
        const cpuInfo = os.cpus();
        return Array.isArray(cpuInfo) && cpuInfo.length > 0 ? cpuInfo.length : 1;
      } catch {
        return 1;
      }
    },
  });
}

const rawBaseURL =
  process.env.NUXT_APP_BASE_URL ??
  process.env.NUXT_PUBLIC_APP_BASE_URL ??
  (process.env.NODE_ENV === "development" ? "/" : "/");

const normalizedBaseURL = rawBaseURL.startsWith("/") ? rawBaseURL : `/${rawBaseURL}`;
const baseURL = normalizedBaseURL.endsWith("/") ? normalizedBaseURL : `${normalizedBaseURL}/`;

export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: [
    { src: "~/plugins/clarity.js", mode: "client" },
    "~/plugins/vuetify",
    "~/plugins/vuetify-i18n.ts",
  ],

  css: [
    "vuetify/styles",
    "@mdi/font/css/materialdesignicons.css",
    "flag-icons/css/flag-icons.min.css",
    "~/assets/styles/material-dashboard.scss",
    "~/assets/styles/index.css",
  ],

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    plugins: [
      ...(vuetifyPlugin ? (Array.isArray(vuetifyPlugin) ? vuetifyPlugin : [vuetifyPlugin]) : []),
      tailwindcss(),
      simplePurgeCssPlugin({
        content: [
          "app.vue",
          "app.config.ts",
          "components/**/*.{vue,js,ts}",
          "layouts/**/*.vue",
          "pages/**/*.vue",
          "composables/**/*.{js,ts}",
          "content/**/*.{md,mdx,json,yml,yaml}",
          "lib/**/*.{js,ts,vue}",
          "plugins/**/*.{js,ts}",
          "stores/**/*.{js,ts}",
        ],
        safelist: {
          standard: ["dark", "rtl", "ltr", "text-align-auto", "nuxt-loading-indicator"],
          deep: [
            /^v-/, // Vuetify utility classes
            /^d-/, // display utilities
            /^pa[trblxy]?-/,
            /^ma[trblxy]?-/,
            /^ga-/, // gap utilities
            /^text-/, // typography utilities
            /^bg-/, // background helpers
            /^elevation-/,
            /^rounded/,
            /^border-/,
            /-enter$/, // transition classes
            /-leave$/,
            /-leave-active$/,
            /-move$/,
            /^col-/,
            /^row-/,
            /^order-/,
            /^offset-/,
            /^justify-/,
            /^items-/,
            /^content-/,
            /^flex-/,
            /^grid-/,
            /^gap-/,
            /^min-/,
            /^max-/,
            /^w-/,
            /^h-/,
            /^z-/,
            /^shadow-/,
            /^opacity-/,
            /^transition-/,
            /^duration-/,
            /^ease-/,
            /^delay-/,
            /^animate-/,
          ],
          greedy: [
            /\\:/, // Tailwind responsive prefixes (sm:, md:, ...)
            /\\\//, // Fraction based utilities (w-1\/2, etc.)
          ],
        },
      }),
      cssInjectedByJsPlugin(),
      compression({ algorithm: "brotliCompress" }),
    ],
    build: {
      sourcemap: false,
      optimizeCSS: true,
      splitChunks: {
        layouts: true,
        pages: true,
        commons: true,
      },
    },
  },

  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "nuxt-gtag",
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/scripts",
    "motion-v/nuxt",
    "lenis/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/icon",
    "nuxt-llms",
  ],
  alias: {
    pinia: resolveFromRoot("lib/pinia-shim.ts"),
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
      ignore: ["**/index.ts", "**/shaders.ts", "**/types.ts"],
    },
  ],
  extends: nuxtLayers,
  sitemap: {
    siteUrl: "https://bro-world-space.com",
    trailingSlash: false,
    gzip: true,
  },

  sourcemap: {
    server: true,
    client: true,
  },

  ui: {
    icons: ["heroicons", "lucide"],
    safelistColors: ["primary", "red", "orange", "green"],
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

  hooks: {
    "pages:extend"(pages) {
      for (const page of pages) {
        const normalizedFilePath = page.file?.replace(/\\/g, "/");

        if (!normalizedFilePath) {
          continue;
        }

        if (!normalizedFilePath.startsWith(normalizedLocalPagesDir)) {
          continue;
        }

        if (page.meta?.documentDriven !== undefined) {
          continue;
        }

        page.meta = { ...page.meta, documentDriven: false };
      }
    },
  },

  i18n: {
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: true,
      fallbackLocale: "en",
    },
    locales: [
      { code: "en", name: "English", iso: "en-US", icon: "fi-gb gb", file: "en.json" },
      { code: "de", name: "Deutsch", iso: "de-DE", icon: "fi-de de", file: "de.json" },
      { code: "fr", name: "Frensh", iso: "fr-FR", icon: "fi-fr fr", file: "fr.json" },
      { code: "ar", name: "Arabic", iso: "tn-TN", icon: "fi-tn tn", file: "ar.json" },
      { code: "it", name: "Italian", iso: "it-IT", icon: "fi-it it", file: "it.json" },
      { code: "es", name: "Spanish", iso: "es-ES", icon: "fi-es es", file: "es.json" },
      { code: "ru", name: "Russian", iso: "ru-RU", icon: "fi-ru ru", file: "ru.json" },
      { code: "zh-cn", name: "中文 (简体)", iso: "zh-CN", icon: "fi-cn cn", file: "zh-cn.json" },
    ],
    baseUrl: "https://bro-world-space.com",
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
    ...(availableIconCollections.length
      ? { serverBundle: { collections: availableIconCollections } }
      : {}),
    ...(iconClientBundleConfig ? { clientBundle: iconClientBundleConfig } : {}),
    customCollections: [
      {
        prefix: "custom",
        dir: "./assets/icons",
      },
    ],
  },

  image: {
    dir: "public",
    domains: ["images.unsplash.com"],
    screens: {
      sm: 320,
      md: 640,
      lg: 1024,
      xl: 1280,
    },
    quality: 80,
    ipx: {
      dir: "public",
      allowFiles: true,
      domains: [],
    },
    presets: {
      lcp: {
        modifiers: {
          format: "webp",
          quality: 80,
        },
      },
    },
  },
  echarts: {
    charts: ["LineChart", "BarChart", "PieChart", "RadarChart"],
    renderer: "svg",
    components: [
      "DataZoomComponent",
      "LegendComponent",
      "TooltipComponent",
      "ToolboxComponent",
      "GridComponent",
      "TitleComponent",
      "DatasetComponent",
      "VisualMapComponent",
    ],
  },

  ignore: ["components/**/index.ts", "components/**/shaders.ts", "components/**/types.ts"],

  runtimeConfig: {
    mercure: {
      hubUrl:
        process.env.NUXT_MERCURE_HUB_URL ?? "https://bro-world.org/.well-known/mercure",
      token:
        process.env.NUXT_MERCURE_TOKEN ??
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InN1YnNjcmliZSI6WyJodHRwczovL2Jyby13b3JsZC5vcmcvdXNlci9ub3RpZmljYXRpb25zLzEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJdLCJwdWJsaXNoIjpbIioiXX0sImlhdCI6MTcxOTUxNTI4NSwiZXhwIjoxNzE5NTE4ODg1fQ.k2Zf_8YXHk7VfW7SwkpHjSkD7rm4_7yKD_ZZsd_ZIwo",
    },
    redis: {
      url: process.env.NUXT_REDIS_URL ?? "",
      tls: process.env.NUXT_REDIS_TLS === "true",
      keyPrefix: process.env.NUXT_REDIS_KEY_PREFIX ?? "bro-world",
      listTtl: Number.parseInt(process.env.NUXT_REDIS_POST_LIST_TTL ?? "60", 10),
      itemTtl: Number.parseInt(process.env.NUXT_REDIS_POST_ITEM_TTL ?? "300", 10),
    },
    auth: {
      apiBase: process.env.NUXT_AUTH_API_BASE ?? "https://bro-world.org/api",
      tokenCookieName: process.env.NUXT_AUTH_TOKEN_COOKIE ?? "auth_token",
      sessionTokenCookieName: process.env.NUXT_AUTH_SESSION_TOKEN_COOKIE ?? "auth_session_token",
      userCookieName: process.env.NUXT_AUTH_USER_COOKIE ?? "auth_user",
      tokenPresenceCookieName: process.env.NUXT_AUTH_TOKEN_PRESENCE_COOKIE ?? "auth_token_present",
      sessionMaxAge: process.env.NUXT_AUTH_SESSION_MAX_AGE ?? String(60 * 60 * 24 * 7),
    },
    public: {
      redis: {
        listTtl: Number.parseInt(process.env.NUXT_REDIS_POST_LIST_TTL ?? "60", 10),
        itemTtl: Number.parseInt(process.env.NUXT_REDIS_POST_ITEM_TTL ?? "300", 10),
      },
      auth: {
        sessionTokenCookieName:
          process.env.NUXT_PUBLIC_AUTH_SESSION_TOKEN_COOKIE ??
          process.env.NUXT_AUTH_SESSION_TOKEN_COOKIE ??
          "auth_session_token",
        tokenPresenceCookieName:
          process.env.NUXT_PUBLIC_AUTH_TOKEN_PRESENCE_COOKIE ??
          process.env.NUXT_AUTH_TOKEN_PRESENCE_COOKIE ??
          "auth_token_present",
        userCookieName:
          process.env.NUXT_PUBLIC_AUTH_USER_COOKIE ??
          process.env.NUXT_AUTH_USER_COOKIE ??
          "auth_user",
        socialRedirects: {
          ...(process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_GOOGLE
            ? { google: process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_GOOGLE }
            : {}),
          ...(process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_GITHUB
            ? { github: process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_GITHUB }
            : {}),
          ...(process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_MICROSOFT
            ? { microsoft: process.env.NUXT_PUBLIC_AUTH_SOCIAL_REDIRECT_MICROSOFT }
            : {}),
        },
      },
      NUXT_CLARITY_ID: process.env.NUXT_CLARITY_ID,
      NUXT_ADSENSE_ACCOUNT: process.env.NUXT_ADSENSE_ACCOUNT,
      blogApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_API_ENDPOINT ?? "https://blog.bro-world.org/public/post",
      blogCommentApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_COMMENT_API_ENDPOINT ??
        "https://blog.bro-world.org/public/comment",
      blogPrivateApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_PRIVATE_API_ENDPOINT ??
        "https://blog.bro-world.org/v1/platform/post",
      blogPrivateCommentApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_PRIVATE_COMMENT_API_ENDPOINT ??
        "https://blog.bro-world.org/v1/platform/comment",
      siteUrl: "https://bro-world-space.com",
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL ?? "https://bro-world-space.com",
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "/api",
      mercure: {
        hubUrl:
          process.env.NUXT_PUBLIC_MERCURE_HUB_URL ??
          process.env.NUXT_MERCURE_HUB_URL ??
          "https://bro-world.org/.well-known/mercure",
      },
      auth: {
        sessionTokenCookieName:
          process.env.NUXT_PUBLIC_AUTH_SESSION_TOKEN_COOKIE ??
          process.env.NUXT_AUTH_SESSION_TOKEN_COOKIE ??
          "auth_session_token",
        userCookieName:
          process.env.NUXT_PUBLIC_AUTH_USER_COOKIE ??
          process.env.NUXT_AUTH_USER_COOKIE ??
          "auth_user",
        tokenPresenceCookieName:
          process.env.NUXT_PUBLIC_AUTH_TOKEN_PRESENCE_COOKIE ??
          process.env.NUXT_AUTH_TOKEN_PRESENCE_COOKIE ??
          "auth_token_present",
      },
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
    baseURL,
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
  compatibilityDate: "2025-06-10",
});
