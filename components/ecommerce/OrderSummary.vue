<template>
  <v-card
    class="order-summary"
    variant="tonal"
  >
    <v-card-title class="text-h6 font-weight-semibold">
      {{ t("demo.ecommerce.summary.title") }}
    </v-card-title>
    <v-divider />
    <v-list class="py-0">
      <v-list-item
        v-for="item in items"
        :key="item.product.slug"
      >
        <template #prepend>
          <v-avatar
            size="48"
            rounded
          >
            <NuxtImg
              :src="item.product.images[0]"
              :alt="t(item.product.nameKey)"
              width="48"
              height="48"
              fit="cover"
            />
          </v-avatar>
        </template>
        <v-list-item-title class="text-subtitle-2 font-weight-medium">
          {{ t(item.product.nameKey) }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption text-medium-emphasis">
          {{ t("demo.ecommerce.summary.quantity", { count: item.quantity }) }}
        </v-list-item-subtitle>
        <template #append>
          <div class="text-body-2 font-weight-semibold">
            {{ formatCurrency(item.lineTotal) }}
          </div>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2" />

    <v-card-text class="d-flex flex-column gap-2">
      <div class="d-flex justify-space-between">
        <span class="text-body-2 text-medium-emphasis">
          {{ t("demo.ecommerce.summary.subtotal") }}
        </span>
        <span class="text-body-2 font-weight-medium">{{ formatCurrency(subtotal) }}</span>
      </div>
      <div class="d-flex justify-space-between">
        <span class="text-body-2 text-medium-emphasis">
          {{ t("demo.ecommerce.summary.tax") }}
        </span>
        <span class="text-body-2 font-weight-medium">{{ formatCurrency(tax) }}</span>
      </div>
      <div class="d-flex justify-space-between">
        <span class="text-body-2 text-medium-emphasis">
          {{ t("demo.ecommerce.summary.shipping") }}
        </span>
        <span class="text-body-2 font-weight-medium">{{ formatCurrency(shipping) }}</span>
      </div>
      <v-divider class="my-2" />
      <div class="d-flex justify-space-between align-center">
        <span class="text-subtitle-1 font-weight-semibold">
          {{ t("demo.ecommerce.summary.total") }}
        </span>
        <span class="text-subtitle-1 font-weight-semibold">{{ formatCurrency(total) }}</span>
      </div>
    </v-card-text>
    <slot name="actions" />
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { DemoCartItem } from "~/stores/useDemoCart";
import type { DemoEcommerceInventory, DemoEcommerceProduct } from "~/lib/demo/ecommerce";
import { formatCurrency as formatCurrencyUtil } from "~/lib/demo/ecommerce";

interface ItemWithDetails extends DemoCartItem {
  product: DemoEcommerceProduct;
  inventory?: DemoEcommerceInventory;
  lineTotal: number;
}

interface Props {
  items: ItemWithDetails[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency?: string;
}

const props = defineProps<Props>();
const { t, locale } = useI18n();

function formatCurrency(value: number) {
  return formatCurrencyUtil(value, locale.value, props.currency ?? "EUR");
}
</script>

<style scoped>
.order-summary {
  position: sticky;
  top: 88px;
}
</style>
