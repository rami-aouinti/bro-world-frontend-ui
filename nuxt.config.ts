// https://nuxt.com/docs/api/configuration/nuxt-config
import "./lib/setup-node-crypto";

import http from "node:http";
import https from "node:https";
import os from "node:os";
import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { URL, fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import compression from "vite-plugin-compression";
import tailwindcss from "@tailwindcss/vite";
import vuetify from "vite-plugin-vuetify";
import { normalizePath, type PluginOption } from "vite";
import { simplePurgeCssPlugin } from "./lib/vite/simple-purgecss";
import {
  CACHE_NAMESPACE_ADMIN,
  CACHE_NAMESPACE_BLOG,
  CACHE_NAMESPACE_PUBLIC,
  CACHE_NAMESPACE_USER,
} from "./lib/cache/namespaces";
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
const projectRoot = [currentDir, process.cwd()].find((dir) =>
  existsSync(resolvePath(dir, "package.json")),
);

function resolveFromRoot(...segments: string[]) {
  return resolvePath(projectRoot ?? currentDir, ...segments);
}

const redisUrl = process.env.NUXT_REDIS_URL?.trim();
const redisTls = process.env.NUXT_REDIS_TLS === "true";

function createCacheStorageDriver(base: string) {
  if (redisUrl) {
    return {
      driver: "redis" as const,
      base,
      url: redisUrl,
      tls: redisTls,
    };
  }

  return {
    driver: "memory" as const,
    base,
  };
}

const require = createRequire(import.meta.url);
const dayjsEsmIndexPath = normalizePath(require.resolve("dayjs/esm/index.js"));
const dayjsEsmDir = dirname(dayjsEsmIndexPath);

function createDayjsEsmResolver(): PluginOption {
  function stripJsExtension(specifier: string): string {
    return specifier.replace(/\.(?:mjs|cjs|js)$/i, "");
  }

  return {
    name: "dayjs-esm-resolver",
    enforce: "pre",
    resolveId(source) {
      if (source === "dayjs" || source === "dayjs/esm" || source === "dayjs/esm/index.js") {
        return dayjsEsmIndexPath;
      }

      if (source.startsWith("dayjs/plugin/")) {
        const pluginName = stripJsExtension(source.slice("dayjs/plugin/".length));
        return normalizePath(resolvePath(dayjsEsmDir, "plugin", pluginName, "index.js"));
      }

      if (source.startsWith("dayjs/locale/")) {
        const localeName = stripJsExtension(source.slice("dayjs/locale/".length));
        return normalizePath(resolvePath(dayjsEsmDir, "locale", `${localeName}.js`));
      }

      return null;
    },
  };
}
const normalizedLocalPagesDir = resolveFromRoot("pages").replace(/\\/g, "/");

type HtmlAttribute = {
  name: string;
  lowerName: string;
  value: string | null;
  quote: '"' | "'";
};

const entryStylesheetPattern =
  /<link\b[^>]*rel=(['"])stylesheet\1[^>]*href=(['"])[^'"\s>]*entry[^'"\s>]*\.css\2[^>]*>/gi;
const attributePattern = /([\w:-]+)(?:\s*=\s*(["'])(.*?)\2)?/g;

const vuetifyPlugin = vuetify({
  autoImport: false,
  styles: {
    configFile: "assets/styles/settings.scss",
  },
}) as PluginOption | PluginOption[];
const isProd = process.env.NODE_ENV === "production";
const isAnalyze = process.env.ANALYZE === "true";

const iconCollections = ["mdi", "logos", "heroicons", "lucide", "tabler", "vscode-icons"] as const;

const nuxtIconClientBundleIcons = [
  "mdi:account",
  "mdi:account-box-outline",
  "mdi:account-cog",
  "mdi:account-cog-outline",
  "mdi:account-group",
  "mdi:account-group-outline",
  "mdi:account-heart-outline",
  "mdi:account-key",
  "mdi:account-multiple",
  "mdi:account-multiple-check-outline",
  "mdi:account-multiple-outline",
  "mdi:account-outline",
  "mdi:account-plus",
  "mdi:account-plus-outline",
  "mdi:alert-circle",
  "mdi:alert-decagram",
  "mdi:api",
  "mdi:apple-keyboard-command",
  "mdi:apple-keyboard-control",
  "mdi:apple-keyboard-option",
  "mdi:apple-keyboard-shift",
  "mdi:arrow-down",
  "mdi:arrow-down-bold",
  "mdi:arrow-left",
  "mdi:arrow-right",
  "mdi:arrow-top-right",
  "mdi:arrow-up",
  "mdi:arrow-up-bold",
  "mdi:backspace",
  "mdi:basketball",
  "mdi:bell-outline",
  "mdi:bell-plus-outline",
  "mdi:bell-ring",
  "mdi:book-open-page-variant",
  "mdi:book-open-page-variant-outline",
  "mdi:briefcase-outline",
  "mdi:briefcase-search",
  "mdi:briefcase-search-outline",
  "mdi:bug-outline",
  "mdi:bullhorn",
  "mdi:bullhorn-outline",
  "mdi:cached",
  "mdi:calendar",
  "mdi:calendar-clock",
  "mdi:card-account-details-outline",
  "mdi:cash-multiple",
  "mdi:cash-sync",
  "mdi:chart-areaspline",
  "mdi:chart-bell-curve",
  "mdi:chart-box-outline",
  "mdi:chart-line-variant",
  "mdi:chat-outline",
  "mdi:check",
  "mdi:check-circle",
  "mdi:check-circle-outline",
  "mdi:check-decagram",
  "mdi:checkbox-blank-outline",
  "mdi:checkbox-marked",
  "mdi:chevron-down",
  "mdi:chevron-left",
  "mdi:chevron-right",
  "mdi:chevron-up",
  "mdi:circle",
  "mdi:clipboard-check",
  "mdi:clipboard-text",
  "mdi:clock-outline",
  "mdi:close",
  "mdi:close-circle",
  "mdi:cloud-upload",
  "mdi:cog-outline",
  "mdi:compass-outline",
  "mdi:connection",
  "mdi:content-save-outline",
  "mdi:controller-classic-outline",
  "mdi:credit-card-check-outline",
  "mdi:credit-card-sync",
  "mdi:currency-usd",
  "mdi:database",
  "mdi:database-outline",
  "mdi:delete",
  "mdi:delete-outline",
  "mdi:dots-grid",
  "mdi:dots-horizontal",
  "mdi:dots-vertical",
  "mdi:download",
  "mdi:earth",
  "mdi:earth-plus",
  "mdi:email",
  "mdi:email-edit-outline",
  "mdi:email-outline",
  "mdi:emoticon-happy-outline",
  "mdi:eye",
  "mdi:eye-off",
  "mdi:eye-outline",
  "mdi:eyedropper",
  "mdi:file-chart",
  "mdi:file-document",
  "mdi:file-document-edit",
  "mdi:file-document-outline",
  "mdi:filmstrip-box-multiple",
  "mdi:flag-outline",
  "mdi:format-align-justify",
  "mdi:fullscreen",
  "mdi:fullscreen-exit",
  "mdi:gamepad-variant-outline",
  "mdi:gavel",
  "mdi:github",
  "mdi:google",
  "mdi:history",
  "mdi:home-map-marker",
  "mdi:image-filter-hdr",
  "mdi:image-multiple",
  "mdi:image-multiple-outline",
  "mdi:image-outline",
  "mdi:information",
  "mdi:information-outline",
  "mdi:keyboard-return",
  "mdi:keyboard-space",
  "mdi:label-outline",
  "mdi:lifebuoy",
  "mdi:lightbulb-on-outline",
  "mdi:lightning-bolt",
  "mdi:link-variant",
  "mdi:linkedin",
  "mdi:loading",
  "mdi:lock",
  "mdi:login",
  "mdi:logout",
  "mdi:magnify",
  "mdi:map-marker",
  "mdi:map-marker-outline",
  "mdi:menu",
  "mdi:menu-down",
  "mdi:menu-right",
  "mdi:message",
  "mdi:message-outline",
  "mdi:message-plus-outline",
  "mdi:message-processing-outline",
  "mdi:message-reply-text",
  "mdi:microsoft",
  "mdi:minus",
  "mdi:minus-box",
  "mdi:monitor-dashboard",
  "mdi:open-in-new",
  "mdi:page-first",
  "mdi:page-last",
  "mdi:palette",
  "mdi:palette-outline",
  "mdi:paperclip",
  "mdi:pause",
  "mdi:pencil",
  "mdi:pencil-outline",
  "mdi:play",
  "mdi:play-circle",
  "mdi:playlist-plus",
  "mdi:plus",
  "mdi:post-outline",
  "mdi:radar",
  "mdi:radiobox-blank",
  "mdi:radiobox-marked",
  "mdi:refresh",
  "mdi:restore",
  "mdi:rhombus-medium",
  "mdi:robot-happy-outline",
  "mdi:robot-outline",
  "mdi:rocket-launch-outline",
  "mdi:school-outline",
  "mdi:send",
  "mdi:shape-outline",
  "mdi:share-outline",
  "mdi:shield-account",
  "mdi:shield-account-outline",
  "mdi:shield-alert",
  "mdi:shield-check",
  "mdi:shield-check-outline",
  "mdi:shield-crown",
  "mdi:shield-key",
  "mdi:shield-lock",
  "mdi:shopping-outline",
  "mdi:star",
  "mdi:star-half-full",
  "mdi:star-outline",
  "mdi:store-outline",
  "mdi:storefront-outline",
  "mdi:subdirectory-arrow-right",
  "mdi:svg",
  "mdi:tag-multiple-outline",
  "mdi:text-box-multiple",
  "mdi:theme-light-dark",
  "mdi:thumb-up-outline",
  "mdi:timeline-clock-outline",
  "mdi:timer-off",
  "mdi:timer-sand",
  "mdi:tools",
  "mdi:trophy-outline",
  "mdi:tune",
  "mdi:twitter",
  "mdi:unfold-more-horizontal",
  "mdi:update",
  "mdi:video",
  "mdi:view-dashboard-outline",
  "mdi:volume-high",
  "mdi:volume-low",
  "mdi:volume-medium",
  "mdi:volume-variant-off",
  "mdi:weather-night",
  "mdi:weather-sunny",
] as const;

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
  console.warn(
    `Nuxt Icon client bundle disabled: missing icon collections ${missingClientBundleCollections.join(", ")}`,
  );
}

const iconClientBundleConfig =
  missingClientBundleCollections.length === 0
    ? {
        icons: nuxtIconClientBundleIcons,
        scan: true,
      }
    : false;

const nuxtLayers: string[] = ["shadcn-docs-nuxt"];

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
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  plugins: [
    { src: "~/plugins/clarity.js", mode: "client" },
    "~/plugins/vuetify",
    "~/plugins/vuetify-i18n.ts",
  ],

  css: [
    "vuetify/styles",
    "flag-icons/css/flag-icons.min.css",
    "~/assets/styles/material-dashboard.scss",
    "~/assets/styles/index.css",
  ],

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    plugins: [
      createDayjsEsmResolver(),
      ...(Array.isArray(vuetifyPlugin) ? vuetifyPlugin : [vuetifyPlugin]),
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
      // Compression uniquement en prod (évite du travail inutile en dev)
      ...(isProd ? [compression({ algorithm: "brotliCompress" })] : []),
    ],
    build: {
      // Pas de sourcemaps en prod : -25/35% de JS à transférer
      sourcemap: !isProd,
      optimizeCSS: true,
      target: "es2022",
      splitChunks: {
        layouts: true,
        pages: true,
        commons: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vuetify: ["vuetify"],
            vendor: ["vue", "vue-router", "pinia"],
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2022",
      },
    },
  },

  modules: [
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
    "@braintree/sanitize-url": resolveFromRoot("lib/shims/sanitize-url.ts"),
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
      ignore: ["**/index.ts", "**/shaders.ts", "**/types.ts"],
    },
  ],
  extends: nuxtLayers,

  nitro: {
    compressPublicAssets: true,
    storage: {
      [CACHE_NAMESPACE_PUBLIC]: createCacheStorageDriver("cache/public"),
      [CACHE_NAMESPACE_USER]: createCacheStorageDriver("cache/user"),
      [CACHE_NAMESPACE_ADMIN]: createCacheStorageDriver("cache/admin"),
      [CACHE_NAMESPACE_BLOG]: createCacheStorageDriver("cache/blog"),
    },
    publicAssets: [
      {
        baseURL: "/",
        dir: resolveFromRoot("public"),
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
    prerender: {
      routes: ["/", "/de", "/fr", "/ar", "/it", "/es", "/ru"],
    },
  },

  routeRules: {
    "/": { isr: 60 },
    "/about": { isr: 300 },
    "/contact": { isr: 300 },
    "/help": { isr: 300 },
    "/api/auth/**": {
      // Auth endpoints need to write cookies, avoid SWR background cache.
      cache: false,
    },
    "/api/**": { swr: 60 },
    "/_nuxt/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
    "/img/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
    "/images/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
    "/icons/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
  },

  // Désactive les maps en prod côté serveur & client
  sourcemap: { server: !isProd, client: !isProd },

  ui: {
    icons: ["heroicons", "lucide"],
    safelistColors: ["primary", "red", "orange", "green"],
  },

  experimental: {
    typedPages: true,
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  typescript: {
    shim: false,
    strict: true,
  },

  vue: {
    propsDestructure: true,
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
    "render:html"(htmlChunks) {
      const headIndex = 0;

      htmlChunks[headIndex] = htmlChunks[headIndex].replace(entryStylesheetPattern, (match) => {
        if (/data-critical/i.test(match) || /rel=(['"])preload\1/i.test(match)) {
          return match;
        }

        const isSelfClosing = /\/>\s*$/.test(match);
        const closingLength = isSelfClosing ? 2 : 1;
        const attributesSegment = match.slice("<link".length, match.length - closingLength).trim();

        attributePattern.lastIndex = 0;

        const attributes: HtmlAttribute[] = [];
        let attributeMatch: RegExpExecArray | null;

        while ((attributeMatch = attributePattern.exec(attributesSegment))) {
          const [, rawName, rawQuote = '"', rawValue] = attributeMatch;
          const normalizedName = rawName.trim();

          if (!normalizedName) {
            continue;
          }

          const normalizedQuote = rawQuote === "'" ? "'" : '"';

          attributes.push({
            name: normalizedName,
            lowerName: normalizedName.toLowerCase(),
            value: rawValue ?? null,
            quote: normalizedQuote,
          });
        }

        function upsertAttribute(name: string, value: string) {
          const lowerName = name.toLowerCase();
          const existing = attributes.find((attribute) => attribute.lowerName === lowerName);

          if (existing) {
            existing.value = value;
            existing.quote = '"';
            return;
          }

          attributes.push({
            name,
            lowerName,
            value,
            quote: '"',
          });
        }

        upsertAttribute("rel", "preload");
        upsertAttribute("as", "style");
        upsertAttribute("onload", "this.onload=null;this.rel='stylesheet'");

        const serializedAttributes = attributes
          .map((attribute) =>
            attribute.value == null
              ? attribute.name
              : `${attribute.name}=${attribute.quote}${attribute.value}${attribute.quote}`,
          )
          .join(" ")
          .trim();

        const preloadLink = `<link ${serializedAttributes}${isSelfClosing ? " />" : ">"}`;
        const fallbackLink = match.endsWith("/>") ? match : match.replace(/>\s*$/, ">");

        return `${preloadLink}\n<noscript>${fallbackLink}</noscript>`;
      });
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
      // Ensure the language selected by the user is kept when navigating
      // across the app by avoiding repeated locale re-detections.
      alwaysRedirect: false,
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
    format: ["webp", "avif"],
    dir: "public",
    domains: ["images.unsplash.com", "bro-world-space.com"],
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

  ignore: ["components/**/index.ts", "components/**/shaders.ts", "components/**/types.ts"],

  runtimeConfig: {
    mercure: {
      hubUrl: process.env.NUXT_MERCURE_HUB_URL ?? "https://bro-world.org/.well-known/mercure",
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
      settingsTtl: Number.parseInt(process.env.NUXT_REDIS_SETTINGS_TTL ?? "300", 10),
      mercureTtl: Number.parseInt(process.env.NUXT_REDIS_MERCURE_TTL ?? "600", 10),
      profileTtl: Number.parseInt(process.env.NUXT_REDIS_PROFILE_TTL ?? "300", 10),
    },
    reviews: {
      apiBase: process.env.NUXT_REVIEWS_API_BASE ?? "https://bro-world.org",
    },
    configuration: {
      apiBase: process.env.NUXT_CONFIGURATION_API_BASE ?? "https://configuration.bro-world.org",
    },
    auth: {
      apiBase: process.env.NUXT_AUTH_API_BASE ?? "https://bro-world.org/api",
      apiToken: process.env.NUXT_AUTH_API_TOKEN ?? "",
      tokenCookieName: process.env.NUXT_AUTH_TOKEN_COOKIE ?? "auth_token",
      sessionTokenCookieName: process.env.NUXT_AUTH_SESSION_TOKEN_COOKIE ?? "auth_session_token",
      userCookieName: process.env.NUXT_AUTH_USER_COOKIE ?? "auth_user",
      tokenPresenceCookieName: process.env.NUXT_AUTH_TOKEN_PRESENCE_COOKIE ?? "auth_token_present",
      sessionMaxAge: process.env.NUXT_AUTH_SESSION_MAX_AGE ?? String(60 * 60 * 24 * 7),
    },
    users: {
      apiBase: process.env.NUXT_USERS_API_BASE ?? "https://bro-world.org/api/v1",
      apiToken: process.env.NUXT_USERS_API_TOKEN ?? process.env.NUXT_AUTH_API_TOKEN ?? "",
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
      weather: {
        apiKey: process.env.NUXT_PUBLIC_WEATHER_API_KEY ?? "",
        defaultLocation: process.env.NUXT_PUBLIC_WEATHER_DEFAULT_LOCATION ?? "Berlin, Germany",
      },
      NUXT_CLARITY_ID: process.env.NUXT_CLARITY_ID,
      NUXT_ADSENSE_ACCOUNT: process.env.NUXT_ADSENSE_ACCOUNT,
      blogApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_API_ENDPOINT ?? "https://blog.bro-world.org/public/post",
      blogCommentApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_COMMENT_API_ENDPOINT ??
        "https://blog.bro-world.org/api/v1/comments",
      blogPrivateApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_PRIVATE_API_ENDPOINT ??
        "https://blog.bro-world.org/v1/platform/post",
      blogPrivateCommentApiEndpoint:
        process.env.NUXT_PUBLIC_BLOG_PRIVATE_COMMENT_API_ENDPOINT ??
        "https://blog.bro-world.org/api/v1/comments",
      siteUrl: "https://bro-world-space.com",
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL ?? "https://bro-world-space.com",
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "/api",
      postsApiBase: process.env.NUXT_PUBLIC_POSTS_API_BASE ?? "https://blog.bro-world.org",
      reviews: {
        apiBase: process.env.NUXT_PUBLIC_REVIEWS_API_BASE ?? "https://bro-world.org",
      },
      configuration: {
        apiBase:
          process.env.NUXT_PUBLIC_CONFIGURATION_API_BASE ??
          process.env.NUXT_CONFIGURATION_API_BASE ??
          "https://configuration.bro-world.org",
      },
      mercure: {
        hubUrl:
          process.env.NUXT_PUBLIC_MERCURE_HUB_URL ??
          process.env.NUXT_MERCURE_HUB_URL ??
          "https://bro-world.org/.well-known/mercure",
      },
      apiBlogBase: "https://blog.bro-world.org",
      apiJobBase: "https://job.bro-world.org",
      apiProfileBase: process.env.NUXT_PUBLIC_PROFILE_API_BASE ?? "https://bro-world.org",
      groqApiKey: process.env.GROQ_API_KEY,
      tinyMceApiKey: process.env.TINYMCE_API_KEY || "no-api-key",
    },
    github: {
      clientId: "",
      clientSecret: "",
    },
    google: {
      clientId: "",
      clientSecret: "",
    },
    facebook: {
      clientId: "",
      clientSecret: "",
    },
    session: {
      name: "nuxt-session",
      password: "",
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
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&family=Space+Grotesk:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap",
        },
        {
          rel: "preconnect",
          href: "https://cdn.jsdelivr.net",
        },
        {
          rel: "preconnect",
          href: "https://cdn.inspira-ui.com",
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
  gtag: {
    initMode: "manual",
    loadingStrategy: "defer",
  },
  fonts: {
    families: [],
    providers: {
      google: false,
      googleicons: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
    },
  },
  compatibilityDate: "2025-06-10",
});
