<template>
  <main class="py-10">
    <v-container>
      <header class="mb-10 text-center">
        <v-breadcrumbs
          class="justify-center mb-4"
          :items="breadcrumbs"
        />
        <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
          {{ t("demo.ecommerce.catalog.title") }}
        </h1>
        <p
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ t("demo.ecommerce.catalog.subtitle") }}
        </p>
        <div class="d-flex flex-wrap justify-center gap-4 mt-6">
          <v-btn
            :to="localePath('/ecommerce')"
            variant="tonal"
            prepend-icon="mdi:arrow-left"
          >
            {{ t("demo.ecommerce.catalog.backToOverview") }}
          </v-btn>
          <v-btn
            :to="localePath('/ecommerce/cart')"
            color="primary"
            variant="flat"
            prepend-icon="mdi:cart"
          >
            {{ t("demo.ecommerce.catalog.goToCart", { count: cart.totalItems }) }}
          </v-btn>
        </div>
      </header>

      <v-row
        class="mb-6"
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="6"
        >
          <v-tabs
            v-model="selectedCategory"
            grow
            class="rounded-lg"
          >
            <v-tab
              v-for="category in categoryFilters"
              :key="category.slug"
              :value="category.slug"
            >
              {{ t(category.nameKey) }}
            </v-tab>
          </v-tabs>
        </v-col>
        <v-col
          cols="12"
          md="5"
        >
          <v-text-field
            v-model="search"
            :label="t('demo.ecommerce.catalog.searchLabel')"
            prepend-inner-icon="mdi:magnify"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>
      </v-row>

      <v-row
        v-if="filteredProducts.length"
        dense
      >
        <v-col
          v-for="product in filteredProducts"
          :key="product.slug"
          cols="12"
          sm="6"
          md="4"
        >
          <ProductCard
            :product="product"
            :inventory="getInventory(product.slug)"
            @add="handleAdd"
          />
        </v-col>
      </v-row>
      <v-empty-state
        v-else
        :title="t('demo.ecommerce.catalog.emptyTitle')"
        :text="t('demo.ecommerce.catalog.emptySubtitle', { query: search || '…' })"
        icon="mdi:emoticon-sad-outline"
      >
        <template #actions>
          <v-btn
            color="primary"
            variant="flat"
            @click="resetFilters"
          >
            {{ t("demo.ecommerce.catalog.resetFilters") }}
          </v-btn>
        </template>
      </v-empty-state>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSeoMeta, useHead, useRoute, useRuntimeConfig } from "#imports";
import ProductCard from "~/components/ecommerce/ProductCard.vue";
import {
  demoEcommerceCategories,
  getInventoryForProduct,
  getProductsMatchingQuery,
} from "~/lib/demo/ecommerce";
import { useDemoCartStore } from "~/stores/useDemoCart";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

const vuetifyComponentsPromise = import("vuetify/components");

const VTabs = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VTabs));

const VTab = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VTab));

const VEmptyState = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VEmptyState),
);

const cart = useDemoCartStore();
const { t, locale, localeProperties } = useI18n();
const route = useRoute();
const localePath = useResolvedLocalePath();

const pageDescription = computed(() => t("seo.ecommerce.catalog.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

const runtimeConfig = useRuntimeConfig();
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.ecommerce.catalog.title");
  const canonical = new URL(route.path, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:url", name: "twitter:url", content: canonical },
      { key: "description", name: "description", content: pageDescription.value },
    ],
  };
});

const selectedCategory = ref<string>("all");
const search = ref("");

const categoryFilters = computed(() => [
  { slug: "all", nameKey: "demo.ecommerce.catalog.filters.all" },
  ...demoEcommerceCategories.map((category) => ({
    slug: category.slug,
    nameKey: category.nameKey,
  })),
]);

const matchedProducts = computed(() => getProductsMatchingQuery(search.value));

const filteredProducts = computed(() =>
  matchedProducts.value.filter(
    (product) =>
      selectedCategory.value === "all" || product.categorySlug === selectedCategory.value,
  ),
);

const breadcrumbs = computed(() => [
  { title: t("layout.sidebar.items.ecommerce"), to: localePath("/ecommerce") },
  { title: t("demo.ecommerce.catalog.breadcrumb"), disabled: true },
]);

cart.setStep("cart");

function handleAdd(slug: string) {
  cart.addItem(slug, 1);
}

function getInventory(slug: string) {
  return getInventoryForProduct(slug);
}

function resetFilters() {
  selectedCategory.value = "all";
  search.value = "";
}
</script>
