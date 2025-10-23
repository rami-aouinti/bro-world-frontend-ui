<template>
  <main class="py-10">
    <v-container>
      <v-breadcrumbs
        :items="breadcrumbs"
        class="mb-6"
      />
      <header class="mb-8 text-center text-md-left">
        <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
          {{ t("demo.ecommerce.cart.title") }}
        </h1>
        <p
          class="text-body-1 text-medium-emphasis mx-auto mx-md-0"
          style="max-width: 640px"
        >
          {{ t("demo.ecommerce.cart.subtitle") }}
        </p>
      </header>

      <v-row
        v-if="!cart.isEmpty"
        dense
      >
        <v-col
          cols="12"
          md="8"
        >
          <v-card
            variant="outlined"
            class="mb-6"
          >
            <v-table
              hover
              density="comfortable"
            >
              <thead>
                <tr>
                  <th>{{ t("demo.ecommerce.cart.table.product") }}</th>
                  <th class="text-center">{{ t("demo.ecommerce.cart.table.quantity") }}</th>
                  <th class="text-right">{{ t("demo.ecommerce.cart.table.price") }}</th>
                  <th class="text-right">{{ t("demo.ecommerce.cart.table.total") }}</th>
                  <th
                    class="text-right"
                    :aria-label="t('demo.ecommerce.cart.table.actions')"
                  ></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in cart.itemsWithDetails"
                  :key="item.product.slug"
                >
                  <td>
                    <div class="d-flex align-start gap-3">
                      <v-avatar
                        size="64"
                        rounded
                      >
                        <NuxtImg
                          :src="item.product.images[0]"
                          :alt="t(item.product.nameKey)"
                          width="64"
                          height="64"
                          fit="cover"
                        />
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-semibold">
                          {{ t(item.product.nameKey) }}
                        </div>
                        <div class="text-caption text-medium-emphasis">{{ item.product.sku }}</div>
                        <v-chip
                          size="x-small"
                          class="mt-2"
                          color="surface-variant"
                        >
                          {{ t(`demo.ecommerce.categories.${item.product.categorySlug}.name`) }}
                        </v-chip>
                      </div>
                    </div>
                  </td>
                  <td
                    class="text-center"
                    style="width: 140px"
                  >
                    <v-text-field
                      v-model.number="quantities[item.product.slug]"
                      type="number"
                      min="1"
                      :max="item.inventory?.available ?? 99"
                      hide-details
                      variant="outlined"
                      density="comfortable"
                      @update:model-value="(value) => updateQuantity(item.product.slug, value)"
                    />
                  </td>
                  <td class="text-right text-body-2 font-weight-medium">
                    {{ formatPrice(item.product.price, item.product.currency) }}
                  </td>
                  <td class="text-right text-body-2 font-weight-semibold">
                    {{ formatPrice(item.lineTotal, item.product.currency) }}
                  </td>
                  <td
                    class="text-right"
                    style="width: 80px"
                  >
                    <v-btn
                      icon="mdi:delete-outline"
                      variant="text"
                      color="error"
                      @click="remove(item.product.slug)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-card
            variant="tonal"
            class="pa-6"
          >
            <h2 class="text-subtitle-1 font-weight-semibold mb-3">
              {{ t("demo.ecommerce.cart.nextStepsTitle") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t("demo.ecommerce.cart.nextStepsDescription") }}
            </p>
            <div class="d-flex flex-wrap gap-3">
              <v-btn
                :to="localePath('/ecommerce/catalog')"
                variant="tonal"
                prepend-icon="mdi:shopping-search"
              >
                {{ t("demo.ecommerce.cart.continueShopping") }}
              </v-btn>
              <v-btn
                color="primary"
                :to="localePath('/ecommerce/checkout')"
                prepend-icon="mdi:credit-card-check-outline"
              >
                {{ t("demo.ecommerce.cart.proceedToCheckout") }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
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
                  {{ t("demo.ecommerce.cart.checkoutCta") }}
                </v-btn>
                <v-btn
                  block
                  variant="text"
                  color="error"
                  @click="clearCart"
                >
                  {{ t("demo.ecommerce.cart.clearCart") }}
                </v-btn>
              </div>
            </template>
          </OrderSummary>
        </v-col>
      </v-row>

      <v-empty-state
        v-else
        icon="mdi:cart-off"
        :title="t('demo.ecommerce.cart.emptyTitle')"
        :text="t('demo.ecommerce.cart.emptySubtitle')"
      >
        <template #actions>
          <v-btn
            color="primary"
            variant="flat"
            :to="localePath('/ecommerce/catalog')"
          >
            {{ t("demo.ecommerce.cart.shopNow") }}
          </v-btn>
        </template>
      </v-empty-state>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useHead, useSeoMeta, useRuntimeConfig, useRoute } from "#imports";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import OrderSummary from "~/components/ecommerce/OrderSummary.vue";
import { useDemoCartStore } from "~/stores/useDemoCart";
import { formatCurrency } from "~/lib/demo/ecommerce";

const vuetifyComponentsPromise = import("vuetify/components");

const VTable = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VTable));

const VEmptyState = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VEmptyState),
);

const cart = useDemoCartStore();
const { t, locale, localeProperties } = useI18n();
const localePath = useResolvedLocalePath();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

cart.setStep("cart");

const quantities = reactive<Record<string, number>>({});

watch(
  cart.itemsWithDetails,
  (items) => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.product.slug] = item.quantity;
    });

    for (const key of Object.keys(quantities)) {
      if (!(key in next)) {
        delete quantities[key];
      }
    }

    for (const [slug, quantity] of Object.entries(next)) {
      quantities[slug] = quantity;
    }
  },
  { immediate: true, deep: true },
);

const breadcrumbs = computed(() => [
  { title: t("layout.sidebar.items.ecommerce"), to: localePath("/ecommerce") },
  { title: t("demo.ecommerce.cart.breadcrumb"), disabled: true },
]);

const pageDescription = computed(() => t("seo.ecommerce.cart.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.ecommerce.cart.title");
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

function formatPrice(value: number, currency = "EUR") {
  return formatCurrency(value, locale.value, currency);
}

function updateQuantity(slug: string, value: number) {
  const normalized = Number.parseInt(String(value), 10);
  if (Number.isNaN(normalized)) {
    return;
  }

  cart.updateItemQuantity(slug, normalized);
  const item = cart.state.items.find((entry) => entry.slug === slug);
  if (item) {
    quantities[slug] = item.quantity;
  }
}

function remove(slug: string) {
  cart.removeItem(slug);
  delete quantities[slug];
}

function clearCart() {
  cart.reset();
  Object.keys(quantities).forEach((key) => {
    delete quantities[key];
  });
}
</script>
