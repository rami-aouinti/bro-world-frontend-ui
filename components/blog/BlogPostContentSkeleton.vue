<template>
  <div
    class="blog-post-content-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <v-skeleton-loader
      type="heading"
      class="mb-3"
    />
    <v-skeleton-loader
      type="paragraph@2"
      class="mb-4"
    />
    <v-skeleton-loader
      type="image"
      height="180"
      class="rounded-xl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>

<style scoped>
.blog-post-content-skeleton {
  display: flex;
  flex-direction: column;
}

.blog-post-content-skeleton :deep(.v-skeleton-loader__image) {
  border-radius: 0.75rem;
}
</style>
