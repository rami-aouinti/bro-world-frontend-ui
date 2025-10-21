<template>
  <div>
    <v-container class="py-10">
      <HelpBreadcrumbs :items="breadcrumbItems" />
      <header class="mb-8">
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-3">
          {{ category.title }}
        </h1>
        <p
          v-if="category.description"
          class="text-body-1 text-medium-emphasis"
        >
          {{ category.description }}
        </p>
      </header>

      <v-row
        v-if="articles.length"
        dense
      >
        <v-col
          v-for="article in articles"
          :key="article.id"
          cols="12"
          md="6"
        >
          <v-card
            :to="articleLink(article)"
            class="rounded-xl"
            elevation="1"
          >
            <v-card-item>
              <v-card-title class="text-h5 mb-2">{{ article.title }}</v-card-title>
              <v-card-subtitle class="text-body-2 text-medium-emphasis mb-2">
                {{ article.excerpt }}
              </v-card-subtitle>
              <p
                v-if="article.updatedAtIso"
                class="text-caption text-disabled"
              >
                {{ t("help.article.updated", { date: formatDate(article.updatedAtIso) }) }}
              </p>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <div
        v-else
        class="py-12 text-center"
      >
        <h2 class="text-h5 font-weight-semibold mb-2">{{ t("help.empty.title") }}</h2>
        <p class="text-medium-emphasis">{{ t("help.empty.subtitle") }}</p>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createError } from "h3";

import HelpBreadcrumbs from "~/components/help/HelpBreadcrumbs.vue";
import type { HelpArticleSummary, HelpCategory } from "~/types/help";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const route = useRoute();
const { t, locale } = useI18n();
await useLocaleNamespaces(["help"]);
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
const siteName = runtimeConfig.public?.siteName || "Bro World";

const slug = computed(() => String(route.params.slug));

const categories = await $fetch<HelpCategory[]>("/api/help/categories", {
  params: { locale: locale.value },
});

const category = categories.find((entry) => entry.slug === slug.value);

if (!category) {
  throw createError({ statusCode: 404, statusMessage: "Category not found" });
}

const articles = await $fetch<HelpArticleSummary[]>("/api/help/articles", {
  params: { locale: locale.value, category: slug.value },
});

const breadcrumbItems = computed(() => [
  { title: t("help.breadcrumbs.home"), to: localePath({ name: "index" }) },
  { title: t("help.breadcrumbs.help"), to: localePath({ name: "help" }) },
  { title: category.title },
]);

function articleLink(article: HelpArticleSummary) {
  return localePath({ name: "help-article-slug", params: { slug: article.slug } });
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateIso));
}

const seoTitle = computed(() => `${category.title} · ${t("help.meta.title")}`);
const seoDescription = computed(
  () => category.description ?? t("help.meta.description", { site: siteName }),
);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: "website",
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

definePageMeta({
  layout: "default",
});
</script>

<style scoped>
.v-card-title {
  line-height: 1.4;
}
</style>
