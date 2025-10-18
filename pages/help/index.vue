<template>
  <div>
    <HelpHero
      :title="t('help.hero.title')"
      :subtitle="t('help.hero.subtitle')"
      :badge="t('help.hero.badge')"
      :popular-title="t('help.hero.popular')"
      :popular-items="popularLinks"
    >
      <HelpSearch
        v-model="searchQuery"
        :placeholder="t('help.hero.searchPlaceholder')"
        :aria-label="t('help.hero.searchAria')"
        :results="searchResults"
        :loading="isSearching"
        :empty-message="t('help.empty.subtitle')"
        :results-label="t('help.search.resultsLabel')"
        @submit="performSearch"
      />
    </HelpHero>

    <v-container class="py-12">
      <section aria-labelledby="help-categories-title" class="mb-14">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-6">
          <div>
            <h2 id="help-categories-title" class="text-h4 font-weight-bold mb-2">
              {{ t('help.categories.title') }}
            </h2>
            <p class="text-medium-emphasis">
              {{ t('help.categories.subtitle') }}
            </p>
          </div>
        </div>
        <v-row dense>
          <v-col
            v-for="category in categories"
            :key="category.id"
            cols="12"
            md="6"
            lg="4"
          >
            <HelpCategoryCard
              :category="category"
              :count-label="t('help.categories.count', { count: category.articleCount })"
            />
          </v-col>
        </v-row>
      </section>

      <HelpFaq :title="t('help.faq.title')" :items="faqItems" :subtitle="t('help.faq.subtitle')" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";

import HelpHero from "~/components/help/HelpHero.vue";
import HelpSearch from "~/components/help/HelpSearch.vue";
import HelpCategoryCard from "~/components/help/HelpCategoryCard.vue";
import HelpFaq from "~/components/help/HelpFaq.vue";
import type { HelpArticleSummary, HelpCategory } from "~/types/help";

const { t, tm, locale } = useI18n();
const runtimeConfig = useRuntimeConfig();
const siteName = runtimeConfig.public?.siteName || "Bro World";
const localePath = useLocalePath();

const categories = ref<HelpCategory[]>([]);
const popularArticles = ref<HelpArticleSummary[]>([]);
const searchResults = ref<HelpArticleSummary[]>([]);
const isSearching = ref(false);
const searchQuery = ref("");

const faqItems = computed(() => (tm("help.faq.items") as Array<{ q: string; a: string }>) ?? []);

const popularLinks = computed(() =>
  popularArticles.value.slice(0, 5).map((article) => ({
    label: article.title,
    to: localePath({ name: "help-article-slug", params: { slug: article.slug } }),
  })),
);

async function loadBaseData(currentLocale: string) {
  const [fetchedCategories, fetchedPopular] = await Promise.all([
    $fetch<HelpCategory[]>("/api/help/categories", { params: { locale: currentLocale } }),
    $fetch<HelpArticleSummary[]>("/api/help/articles", {
      params: { locale: currentLocale, popular: "true" },
    }),
  ]);

  categories.value = fetchedCategories;
  popularArticles.value = fetchedPopular;
}

await loadBaseData(locale.value);

watch(
  () => locale.value,
  async (nextLocale) => {
    await loadBaseData(nextLocale);
    if (searchQuery.value.trim().length >= 2) {
      performSearch();
    }
  },
);

const debouncedSearch = useDebounceFn(async () => {
  const query = searchQuery.value.trim();

  if (query.length < 2) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  try {
    searchResults.value = await $fetch<HelpArticleSummary[]>("/api/help/search", {
      params: { q: query, locale: locale.value },
    });
  } finally {
    isSearching.value = false;
  }
}, 250);

function performSearch() {
  debouncedSearch();
}

watch(searchQuery, () => {
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = [];
    isSearching.value = false;
  }
  debouncedSearch();
});

const seoTitle = computed(() => t("help.meta.title"));
const seoDescription = computed(() => t("help.meta.description", { site: siteName }));

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
:global(html[dir="rtl"]) .help-search__panel {
  text-align: right;
}
</style>
