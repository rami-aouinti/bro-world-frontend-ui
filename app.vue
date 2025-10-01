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

const config = useDocsConfig();
const route = useRoute();
const { themeClass, radius } = useThemes();
const { locale } = useI18n();
const runtimeConfig = useRuntimeConfig();

const baseUrl = runtimeConfig.public.siteUrl || "https://bro-world-space.com";
const normalizedBaseUrl = baseUrl.endsWith("/")
  ? baseUrl.slice(0, -1)
  : baseUrl;

type SeoMetaFields = {
  title?: string;
  description?: string;
  keywords?: string;
};

const matchedMeta = computed<SeoMetaFields>(
  () => (route.matched?.[0]?.meta as SeoMetaFields) ?? {},
);
const currentMeta = computed<SeoMetaFields>(() => route.meta as SeoMetaFields);

const defaultTitle = computed(
  () => config.value.site?.name ?? "Bro World",
);
const defaultDescription = computed(
  () =>
    config.value.site?.description ??
    "Welcome to Bro World — your unique community platform.",
);
const canonicalUrl = computed(() => {
  try {
    return new URL(route.fullPath, baseUrl).toString();
  } catch {
    return baseUrl;
  }
});

const title = computed(
  () => currentMeta.value.title ?? matchedMeta.value.title ?? defaultTitle.value,
);
const description = computed(
  () =>
    currentMeta.value.description ??
    matchedMeta.value.description ??
    defaultDescription.value,
);
const keywords = computed(
  () =>
    currentMeta.value.keywords ??
    matchedMeta.value.keywords ??
    "social, Bro world, Community",
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

const socialImageUrl = computed(() => `${normalizedBaseUrl}/social-img.png`);

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
    { rel: "alternate", hrefLang: "en", href: `${normalizedBaseUrl}/en` },
    { rel: "alternate", hrefLang: "de", href: `${normalizedBaseUrl}/de` },
    { rel: "alternate", hrefLang: "fr", href: `${normalizedBaseUrl}/fr` },
    { rel: "alternate", hrefLang: "ar", href: `${normalizedBaseUrl}/ar` },
    { rel: "alternate", hrefLang: "x-default", href: `${normalizedBaseUrl}/` },
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
