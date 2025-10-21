<template>
  <div>
    <v-container class="py-10">
      <HelpBreadcrumbs :items="breadcrumbItems" />
      <article>
        <header class="mb-6">
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-3">
            {{ article.title }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ article.excerpt }}
          </p>
          <p
            v-if="article.updatedAtIso"
            class="text-caption text-disabled"
          >
            {{ t("help.article.updated", { date: formatDate(article.updatedAtIso) }) }}
          </p>
        </header>
        <HelpArticle
          :content="article.body"
          :toc-title="t('help.article.toc')"
          :copy-label="t('help.article.copyLink')"
          :copied-label="t('help.article.copied')"
        />
        <HelpFeedback
          class="mt-8"
          :article-id="article.id"
          :question="t('help.article.feedback.question')"
          :yes-label="t('help.article.feedback.yes')"
          :no-label="t('help.article.feedback.no')"
          :thanks-label="t('help.article.feedback.thanks')"
        />
      </article>

      <section
        v-if="relatedArticles.length"
        class="mt-12"
        aria-labelledby="related-articles"
      >
        <h2
          id="related-articles"
          class="text-h5 font-weight-semibold mb-4"
        >
          {{ t("help.article.related") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="related in relatedArticles"
            :key="related.id"
            cols="12"
            md="4"
          >
            <v-card
              :to="articleLink(related)"
              class="rounded-xl"
              elevation="1"
            >
              <v-card-item>
                <v-card-title class="text-subtitle-1 mb-1">{{ related.title }}</v-card-title>
                <v-card-subtitle class="text-body-2 text-medium-emphasis">
                  {{ related.excerpt }}
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createError } from "h3";

import HelpArticle from "~/components/help/HelpArticle.vue";
import HelpBreadcrumbs from "~/components/help/HelpBreadcrumbs.vue";
import HelpFeedback from "~/components/help/HelpFeedback.vue";
import type { HelpArticleDetail, HelpArticleSummary } from "~/types/help";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const route = useRoute();
const { t, locale } = useI18n();
await useLocaleNamespaces(["help"]);
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
const requestUrl = useRequestURL();
const siteName = runtimeConfig.public?.siteName || "Bro World";

const slug = computed(() => String(route.params.slug));

const article = await $fetch<HelpArticleDetail>(`/api/help/articles/${slug.value}`, {
  params: { locale: locale.value },
}).catch(() => {
  throw createError({ statusCode: 404, statusMessage: "Article not found" });
});

const relatedArticles = await $fetch<HelpArticleSummary[]>("/api/help/articles", {
  params: { locale: locale.value, category: article.categorySlug },
}).then((items) => items.filter((entry) => entry.slug !== article.slug).slice(0, 3));

const breadcrumbItems = computed(() => [
  { title: t("help.breadcrumbs.home"), to: localePath({ name: "index" }) },
  { title: t("help.breadcrumbs.help"), to: localePath({ name: "help" }) },
  { title: article.title },
]);

function articleLink(target: HelpArticleSummary) {
  return localePath({ name: "help-article-slug", params: { slug: target.slug } });
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateIso));
}

const seoTitle = computed(() => `${article.title} · ${t("help.meta.title")}`);
const seoDescription = computed(() => article.excerpt);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: "article",
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
});

const localeHead = useLocaleHead({
  addDirAttribute: false,
  addSeoAttributes: true,
  identifierAttribute: "id",
});

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: locale.value === "ar" ? "rtl" : "ltr",
  },
  link: localeHead.value.link ?? [],
  meta: localeHead.value.meta ?? [],
}));

const siteUrl = runtimeConfig.public?.siteUrl?.toString().trim() || requestUrl.origin;
const articleUrl = new URL(
  localePath({ name: "help-article-slug", params: { slug: article.slug } }),
  siteUrl,
).toString();

const articleJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.excerpt,
  dateModified: article.updatedAtIso ?? new Date().toISOString(),
  mainEntityOfPage: articleUrl,
  author: {
    "@type": "Organization",
    name: siteName,
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
  },
  inLanguage: locale.value,
}));

useHead(() => ({
  script: [
    {
      key: `help-article-${article.id}`,
      type: "application/ld+json",
      children: JSON.stringify(articleJsonLd.value),
    },
  ],
}));

definePageMeta({
  layout: "default",
});
</script>

<style scoped>
.v-card-title {
  line-height: 1.4;
}
</style>
