<template>
  <NuxtLoadingIndicator
    :color="false"
    class="z-100 bg-primary/80"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AlertPanel />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { hasInjectionContext, tryUseNuxtApp, useAppConfig, useRequestURL } from "#imports";

const nuxtApp = tryUseNuxtApp();
const fallbackSiteConfig = {
  name: "Bro World",
  description: "Welcome to Bro World — your unique community platform.",
};

const siteConfig = computed(() => {
  if (!nuxtApp || !hasInjectionContext()) {
    return fallbackSiteConfig;
  }

  const appConfig = useAppConfig();
  const site = appConfig?.shadcnDocs?.site;

  return {
    name: site?.name ?? fallbackSiteConfig.name,
    description: site?.description ?? fallbackSiteConfig.description,
  };
});
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const { themeClass, radius } = useThemes();
const { locale } = useI18n();
const runtimeConfig = nuxtApp && hasInjectionContext() ? useRuntimeConfig() : null;
const requestUrl = nuxtApp && hasInjectionContext() ? useRequestURL() : null;

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

const matchedMeta = computed<SeoMetaFields>(() => {
  return (currentRoute.value?.matched?.[0]?.meta as SeoMetaFields) ?? {};
});
const currentMeta = computed<SeoMetaFields>(
  () => (currentRoute.value?.meta as SeoMetaFields) ?? {},
);

const defaultTitle = computed(() => siteConfig.value.name);
const defaultDescription = computed(() => siteConfig.value.description);
const canonicalUrl = computed(() => {
  const base = normalizedBaseUrl.value;

  if (!nuxtApp) {
    return base;
  }

  try {
    const fullPath = currentRoute.value?.fullPath ?? "/";
    return new URL(fullPath, base).toString();
  } catch {
    return base;
  }
});

const title = computed(
  () => currentMeta.value.title ?? matchedMeta.value.title ?? defaultTitle.value,
);
const description = computed(
  () => currentMeta.value.description ?? matchedMeta.value.description ?? defaultDescription.value,
);
const keywords = computed(
  () => currentMeta.value.keywords ?? matchedMeta.value.keywords ?? "social, Bro world, Community",
);

const structuredData = computed(() =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: canonicalUrl.value,
    name: "Bro World",
    description: description.value,
  }),
);

const socialImageUrl = computed(() => `${normalizedBaseUrl.value}/social-img.png`);

useHead({
  title,
  titleTemplate: (value) => (value ? `${value} | Bro World` : "Bro World"),
  htmlAttrs: {
    dir: computed(() => (locale.value === "ar" ? "rtl" : "ltr")),
    lang: computed(() => locale.value),
  },
  link: [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "canonical", href: canonicalUrl.value },
    { rel: "alternate", hrefLang: "en", href: `${normalizedBaseUrl.value}/en` },
    { rel: "alternate", hrefLang: "de", href: `${normalizedBaseUrl.value}/de` },
    { rel: "alternate", hrefLang: "fr", href: `${normalizedBaseUrl.value}/fr` },
    { rel: "alternate", hrefLang: "ar", href: `${normalizedBaseUrl.value}/ar` },
    { rel: "alternate", hrefLang: "x-default", href: `${normalizedBaseUrl.value}/` },
  ],
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
  bodyAttrs: {
    class: themeClass.value,
    style: `--radius: ${radius.value}rem;`,
  },
});

useSeoMeta({
  title,
  description,
  author: "rami.aouinti@gmail.com",
  ogTitle: title,
  ogDescription: description,
  ogType: "website",
  ogUrl: canonicalUrl,
  ogImage: socialImageUrl,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: socialImageUrl,
  twitterCard: "summary_large_image",
  keywords,
  themeColor: "#e91e63",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  ogLocale: locale,
  ogSiteName: "Bro World",
});
</script>
