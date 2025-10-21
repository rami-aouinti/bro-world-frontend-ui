<template>
  <main class="py-10">
    <v-container v-if="product">
      <v-breadcrumbs
        :items="breadcrumbs"
        class="mb-6"
      />
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-carousel
            height="360"
            hide-delimiter-background
            show-arrows-on-hover
            class="rounded-lg"
          >
            <v-carousel-item
              v-for="(image, index) in product.images"
              :key="index"
            >
              <NuxtImg
                :src="image"
                :alt="t(product.nameKey)"
                class="rounded-lg"
                height="360"
                fit="cover"
              />
            </v-carousel-item>
          </v-carousel>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <section>
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                v-for="badge in product.badges || []"
                :key="badge"
                color="primary"
                variant="tonal"
              >
                {{ t(badge) }}
              </v-chip>
            </div>
            <h1 class="text-h4 font-weight-bold mb-2">
              {{ t(product.nameKey) }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ t(product.summaryKey) }}
            </p>
            <div class="d-flex align-center gap-4 mb-4">
              <div class="text-h5 font-weight-semibold">{{ formattedPrice }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{
                  t("demo.ecommerce.product.rating", {
                    rating: product.rating,
                    reviews: product.reviews,
                  })
                }}
              </div>
            </div>
            <v-alert
              v-if="inventory && inventory.available <= (inventory.lowStockThreshold ?? 10)"
              type="warning"
              variant="tonal"
              class="mb-4"
            >
              {{ t("demo.ecommerce.inventory.lowStock", { count: inventory.available }) }}
            </v-alert>
            <v-card
              variant="outlined"
              class="pa-4 mb-6"
            >
              <div class="d-flex flex-column gap-3">
                <v-text-field
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="inventory?.available ?? 10"
                  :label="t('demo.ecommerce.product.quantityLabel')"
                  hide-details
                  variant="outlined"
                />
                <div class="d-flex flex-wrap gap-3">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="addToCart"
                  >
                    {{ t("demo.ecommerce.actions.addToCart") }}
                  </v-btn>
                  <v-btn
                    :to="localePath('/ecommerce/cart')"
                    size="large"
                    variant="tonal"
                  >
                    {{ t("demo.ecommerce.product.viewCart") }}
                  </v-btn>
                </div>
                <p class="text-caption text-medium-emphasis">
                  {{ availabilityMessage }}
                </p>
              </div>
            </v-card>
          </section>
        </v-col>
      </v-row>

      <v-row
        class="mt-8"
        dense
      >
        <v-col
          cols="12"
          md="7"
        >
          <v-card
            variant="tonal"
            class="pa-6 mb-6"
          >
            <h2 class="text-h5 font-weight-semibold mb-3">
              {{ t("demo.ecommerce.product.detailsTitle") }}
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t(product.descriptionKey) }}
            </p>
          </v-card>

          <v-card
            variant="outlined"
            class="pa-6"
          >
            <h3 class="text-subtitle-1 font-weight-semibold mb-4">
              {{ t("demo.ecommerce.product.specificationsTitle") }}
            </h3>
            <v-list density="comfortable">
              <v-list-item
                v-for="spec in product.specifications"
                :key="spec.labelKey"
              >
                <v-list-item-title class="font-weight-medium">
                  {{ t(spec.labelKey) }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2">
                  {{ t(spec.valueKey) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="5"
        >
          <OrderSummary
            :items="cart.itemsWithDetails"
            :subtotal="cart.subtotal"
            :tax="cart.tax"
            :shipping="cart.shipping"
            :total="cart.total"
          >
            <template #actions>
              <div class="pa-4 pt-0 d-flex flex-column gap-2">
                <v-btn
                  :to="localePath('/ecommerce/checkout')"
                  block
                  color="primary"
                  size="large"
                >
                  {{ t("demo.ecommerce.product.goToCheckout") }}
                </v-btn>
                <v-btn
                  :to="localePath('/ecommerce/catalog')"
                  block
                  variant="tonal"
                  size="large"
                >
                  {{ t("demo.ecommerce.product.backToCatalog") }}
                </v-btn>
              </div>
            </template>
          </OrderSummary>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useHead, useSeoMeta, useRuntimeConfig, createError } from "#imports";
import OrderSummary from "~/components/ecommerce/OrderSummary.vue";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { getProductBySlug, getInventoryForProduct, formatCurrency } from "~/lib/demo/ecommerce";
import { useDemoCartStore } from "~/stores/useDemoCart";
import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const cart = useDemoCartStore();
const { t, locale, localeProperties } = useI18n();
await useLocaleNamespaces(["demo"]);
const route = useRoute();
const localePath = useResolvedLocalePath();
const runtimeConfig = useRuntimeConfig();

const slug = computed(() => route.params.slug as string);
const product = computed(() => getProductBySlug(slug.value));

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: "Product not found" });
}

const inventory = computed(() => getInventoryForProduct(product.value!.slug));
const quantity = ref(1);

const formattedPrice = computed(() =>
  formatCurrency(product.value!.price, locale.value, product.value!.currency),
);

const availabilityMessage = computed(() => {
  if (!inventory.value) {
    return t("demo.ecommerce.inventory.defaultMessage");
  }

  if (inventory.value.available === 0) {
    return t("demo.ecommerce.inventory.outOfStock");
  }

  if (inventory.value.available <= (inventory.value.lowStockThreshold ?? 10)) {
    return t("demo.ecommerce.inventory.lowStock", { count: inventory.value.available });
  }

  return t("demo.ecommerce.inventory.inStock", { count: inventory.value.available });
});

const breadcrumbs = computed(() => [
  { title: t("layout.sidebar.items.ecommerce"), to: localePath("/ecommerce") },
  { title: t("demo.ecommerce.catalog.breadcrumb"), to: localePath("/ecommerce/catalog") },
  { title: t(product.value!.nameKey), disabled: true },
]);

useSeoMeta(() => ({
  description: t(product.value!.summaryKey),
}));

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = `${t(product.value!.nameKey)} | ${t("demo.ecommerce.catalog.title")}`;
  const canonical = new URL(route.path, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "product" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:url", name: "twitter:url", content: canonical },
      { key: "description", name: "description", content: t(product.value!.summaryKey) },
    ],
  };
});

function addToCart() {
  cart.addItem(product.value!.slug, quantity.value);
  cart.setStep("cart");
}

watchEffect(() => {
  if (quantity.value < 1) {
    quantity.value = 1;
  }

  if (inventory.value && quantity.value > inventory.value.available) {
    quantity.value = inventory.value.available;
  }
});

cart.setStep("cart");
</script>
