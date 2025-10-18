<template>
  <NuxtLoadingIndicator
    :color="false"
    class="z-100 bg-primary/80"
  />
  <AppLoadingOverlay :visible="initialLoading" />
  <NuxtLayout>
    <NuxtPage :key="pageKey" />
  </NuxtLayout>
  <RouteLoadingOverlay :visible="routeLoading" />
  <AlertPanel />
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
import {
  hasInjectionContext,
  tryUseNuxtApp,
  useAppConfig,
  useI18n,
  useRuntimeConfig,
  useRequestURL,
  useRoute,
  useState,
} from "#imports";
import { useSwitchLocalePath } from "#i18n";

const AppLoadingOverlay = defineAsyncComponent({
  loader: () => import("~/components/layout/AppLoadingOverlay.vue"),
  suspensible: false,
});
const RouteLoadingOverlay = defineAsyncComponent({
  loader: () => import("~/components/layout/RouteLoadingOverlay.vue"),
  suspensible: false,
});
const AlertPanel = defineAsyncComponent({
  loader: () => import("~/components/AlertPanel.vue"),
  suspensible: false,
});

const nuxtApp = tryUseNuxtApp();
const fallbackSiteConfig = {
  name: "Bro World",
  description: "Welcome to Bro World — your unique community platform.",
};

const hasInjectionSupport = Boolean(nuxtApp && hasInjectionContext());
const appConfig = hasInjectionSupport ? useAppConfig() : null;
const runtimeConfig = hasInjectionSupport ? useRuntimeConfig() : null;
const requestUrl = hasInjectionSupport ? useRequestURL() : null;

const routeLoadingState = useState("route:loading", () => false);
const routeLoading = computed(() => routeLoadingState.value);
const initialLoadingState = useState("app:initial-loading", () => true);
const initialLoading = computed(() => initialLoadingState.value);

const initialRouteReady = ref(false);
const initialHydrationComplete = ref(!import.meta.client || !nuxtApp || !nuxtApp.isHydrating);

function maybeDismissInitialLoading(force = false) {
  if (!initialLoadingState.value) {
    return;
  }

  if (force || (initialRouteReady.value && initialHydrationComplete.value)) {
    initialLoadingState.value = false;
  }
}

function markInitialRouteReady() {
  if (!initialRouteReady.value) {
    initialRouteReady.value = true;
  }

  maybeDismissInitialLoading();
}

function markInitialHydrationComplete() {
  if (!initialHydrationComplete.value) {
    initialHydrationComplete.value = true;
  }

  maybeDismissInitialLoading();
}

const siteConfig = computed(() => {
  if (!hasInjectionSupport || !appConfig) {
    return fallbackSiteConfig;
  }

  const site = appConfig?.shadcnDocs?.site;

  return {
    name: site?.name ?? fallbackSiteConfig.name,
    description: site?.description ?? fallbackSiteConfig.description,
  };
});
const route = useRoute();

if (import.meta.client && nuxtApp) {
  let finishTimer: ReturnType<typeof setTimeout> | null = null;

  function handleRouteStart() {
    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
    routeLoadingState.value = true;
  }

  function handleRouteStop() {
    if (finishTimer) {
      clearTimeout(finishTimer);
    }
    finishTimer = setTimeout(() => {
      routeLoadingState.value = false;
      markInitialRouteReady();
    }, 250);
  }

  function handleRouteError() {
    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
    routeLoadingState.value = false;
    markInitialRouteReady();
    markInitialHydrationComplete();
    maybeDismissInitialLoading(true);
  }

  nuxtApp.hook("page:start", handleRouteStart);
  nuxtApp.hook("page:finish", handleRouteStop);
  nuxtApp.hook("page:error", handleRouteError);
  nuxtApp.hook("app:suspense:resolve", markInitialHydrationComplete);
  nuxtApp.hook("app:mounted", () => {
    markInitialRouteReady();
    if (!nuxtApp.isHydrating) {
      markInitialHydrationComplete();
    }
  });
}

const pageKey = computed(() => route.fullPath ?? route.name ?? "");
const { themeClass, radius, themePrimaryHex } = useThemes();
const { locale, locales } = useI18n();

const rtlLocales = new Set(["ar"]);
const isRtlLocale = computed(() => rtlLocales.has(locale.value));
const bodyClass = computed(() => {
  const classes = [themeClass.value];

  classes.push(isRtlLocale.value ? "rtl" : "ltr");

  return classes.join(" ").trim();
});
const bodyStyle = computed(() => `--radius: ${radius.value}rem;`);

const fallbackBaseUrl = "https://bro-world-space.com";

const resolvedBaseUrl = computed(() => {
  const configuredSiteUrl = runtimeConfig?.public?.siteUrl?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  const inferredOrigin = requestUrl?.origin ?? null;

  if (inferredOrigin && inferredOrigin !== "null") {
    return inferredOrigin;
  }

  return fallbackBaseUrl;
});

const normalizedBaseUrl = computed(() => {
  const base = resolvedBaseUrl.value;

  if (base.endsWith("/")) {
    return base.slice(0, -1);
  }

  return base;
});

type SeoMetaFields = {
  title?: string;
  description?: string;
  keywords?: string;
};

const canonicalUrl = computed(() => {
  const base = normalizedBaseUrl.value;

  if (!nuxtApp) {
    return base;
  }

  try {
    const fullPath = route.fullPath ?? "/";
    return new URL(fullPath, base).toString();
  } catch {
    return base;
  }
});

const DEFAULT_SEO_KEYWORDS = "social, Bro world, Community";

const resolvedSeoMeta = computed(() => {
  const matchedMeta = (route.matched?.[0]?.meta as SeoMetaFields) ?? {};
  const currentMeta = (route.meta as SeoMetaFields) ?? {};

  return {
    title: currentMeta.title ?? matchedMeta.title ?? siteConfig.value.name,
    description:
      currentMeta.description ?? matchedMeta.description ?? siteConfig.value.description,
    keywords: currentMeta.keywords ?? matchedMeta.keywords ?? DEFAULT_SEO_KEYWORDS,
  };
});

const structuredData = computed(() =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: canonicalUrl.value,
    name: "Bro World",
    description: resolvedSeoMeta.value.description,
  }),
);

const socialImageUrl = computed(() => `${normalizedBaseUrl.value}/social-img.png`);
const themeColor = computed(() => themePrimaryHex.value ?? "#03203d");

const switchLocalePath = hasInjectionSupport ? useSwitchLocalePath() : null;

type LocaleEntry = { code?: string };

const availableLocales = computed(() => {
  const rawLocales = locales as unknown;

  if (Array.isArray(rawLocales)) {
    return rawLocales as LocaleEntry[];
  }

  if (rawLocales && typeof rawLocales === "object" && "value" in rawLocales) {
    const value = (rawLocales as { value?: LocaleEntry[] }).value;
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [] as LocaleEntry[];
});

const alternateLocaleLinks = computed(() => {
  if (!switchLocalePath) {
    return [] as { rel: "alternate"; hrefLang: string; href: string }[];
  }

  const base = normalizedBaseUrl.value;
  const links: { rel: "alternate"; hrefLang: string; href: string }[] = [];
  const seen = new Set<string>();

  for (const localeEntry of availableLocales.value) {
    const code = localeEntry.code;

    if (!code || seen.has(code)) {
      continue;
    }

    const localizedPath = switchLocalePath(code);

    if (!localizedPath) {
      continue;
    }

    let href: string;

    try {
      href = new URL(localizedPath, base).toString();
    } catch {
      href = localizedPath;
    }

    links.push({ rel: "alternate", hrefLang: code, href });
    seen.add(code);
  }

  if (!seen.has("x-default")) {
    let defaultHref: string;

    try {
      defaultHref = new URL("/", base).toString();
    } catch {
      defaultHref = "/";
    }

    links.push({ rel: "alternate", hrefLang: "x-default", href: defaultHref });
  }

  return links;
});

const headLinks = computed(() => {
  const canonical = canonicalUrl.value;

  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "canonical", href: canonical },
    ...alternateLocaleLinks.value,
  ];
});

const htmlAttributes = computed(() => ({
  dir: isRtlLocale.value ? "rtl" : "ltr",
  lang: locale.value,
}));

const bodyAttributes = computed(() => ({
  class: bodyClass.value,
  style: bodyStyle.value,
}));

const headConfig = computed(() => ({
  title: resolvedSeoMeta.value.title,
  titleTemplate: (value?: string) => (value ? `${value} | Bro World` : "Bro World"),
  htmlAttrs: htmlAttributes.value,
  link: headLinks.value,
  meta: [
    {
      name: "google-site-verification",
      content: "TMfvcd4kWDKIVfrwdD3GFq6J9itPdd0ipFJdxO_yMro",
    },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: structuredData.value,
    },
  ],
  bodyAttrs: bodyAttributes.value,
}));

useHead(() => headConfig.value);

const seoMetaPayload = computed(() => ({
  title: resolvedSeoMeta.value.title,
  description: resolvedSeoMeta.value.description,
  author: "rami.aouinti@gmail.com",
  ogTitle: resolvedSeoMeta.value.title,
  ogDescription: resolvedSeoMeta.value.description,
  ogType: "website",
  ogUrl: canonicalUrl.value,
  ogImage: socialImageUrl.value,
  twitterTitle: resolvedSeoMeta.value.title,
  twitterDescription: resolvedSeoMeta.value.description,
  twitterImage: socialImageUrl.value,
  twitterCard: "summary_large_image",
  keywords: resolvedSeoMeta.value.keywords,
  themeColor: themeColor.value,
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  ogLocale: locale.value,
  ogSiteName: "Bro World",
}));

useSeoMeta(() => seoMetaPayload.value);
</script>
