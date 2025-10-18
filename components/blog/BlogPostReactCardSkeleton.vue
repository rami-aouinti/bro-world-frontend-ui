<template>
  <div
    class="blog-post-react-card-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="blog-post-react-card-skeleton__metrics">
      <v-skeleton-loader
        v-for="index in 3"
        :key="`metric-${index}`"
        type="chip"
        width="88"
      />
    </div>
    <div class="blog-post-react-card-skeleton__actions">
      <v-skeleton-loader
        v-for="index in 3"
        :key="`action-${index}`"
        type="button"
        width="120"
        height="40"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>

<style scoped>
.blog-post-react-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-post-react-card-skeleton__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.blog-post-react-card-skeleton__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
