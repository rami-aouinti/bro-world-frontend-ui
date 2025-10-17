<template>
  <v-card
    class="product-card h-100 d-flex flex-column"
    variant="outlined"
  >
    <v-img
      :src="product.images[0]"
      :alt="t(product.nameKey)"
      height="200"
      cover
    />

    <v-card-text class="flex-grow-1 d-flex flex-column">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-caption text-medium-emphasis">{{ formatPrice }}</div>
        <v-chip
          v-if="badgeLabel"
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ badgeLabel }}
        </v-chip>
      </div>

      <h3 class="text-subtitle-1 font-weight-semibold mb-1">
        {{ t(product.nameKey) }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t(product.summaryKey) }}
      </p>

      <div class="mt-auto d-flex flex-wrap gap-2">
        <v-chip
          v-for="tag in product.tags"
          :key="tag"
          size="x-small"
          color="surface-variant"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="d-flex flex-column gap-2 pa-4">
      <v-btn
        block
        color="primary"
        variant="flat"
        size="large"
        @click="handleAdd"
      >
        {{ t("demo.ecommerce.actions.addToCart") }}
      </v-btn>
      <v-btn
        :to="productLink"
        block
        variant="tonal"
        size="large"
      >
        {{ t("demo.ecommerce.actions.viewDetails") }}
      </v-btn>
      <div
        v-if="inventory"
        class="text-caption text-medium-emphasis text-center"
      >
        <span v-if="inventory.available > lowStockThreshold">
          {{ t("demo.ecommerce.inventory.inStock", { count: inventory.available }) }}
        </span>
        <span v-else>
          {{ t("demo.ecommerce.inventory.lowStock", { count: inventory.available }) }}
        </span>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import type { DemoEcommerceInventory, DemoEcommerceProduct } from "~/lib/demo/ecommerce";
import { formatCurrency } from "~/lib/demo/ecommerce";

interface Props {
  product: DemoEcommerceProduct;
  inventory?: DemoEcommerceInventory;
  lowStockThreshold?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (event: "add", slug: string): void }>();

const { t, locale } = useI18n();
const localePath = useResolvedLocalePath();

const productLink = computed(() => localePath(`/ecommerce/product-${props.product.slug}`));

const lowStockThreshold = computed(() => props.lowStockThreshold ?? props.inventory?.lowStockThreshold ?? 10);

const formatPrice = computed(() =>
  formatCurrency(props.product.price, locale.value, props.product.currency),
);

const badgeLabel = computed(() => {
  const badge = props.product.badges?.[0];
  return badge ? t(badge) : null;
});

function handleAdd() {
  emit("add", props.product.slug);
}
</script>

<style scoped>
.product-card {
  transition: box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: var(--v-shadow-4);
}
</style>
