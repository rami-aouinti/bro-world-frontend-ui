<template>
  <div
    class="sidebar-widget-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="sidebar-widget-skeleton__icon">
      <v-skeleton-loader type="avatar" />
    </div>
    <div class="sidebar-widget-skeleton__content">
      <v-skeleton-loader type="text" width="160" />
      <v-skeleton-loader type="text" width="220" />
      <v-skeleton-loader type="text" width="120" />
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
.sidebar-widget-skeleton {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.sidebar-widget-skeleton__icon {
  width: 48px;
  height: 48px;
  border-radius: 1rem;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-widget-skeleton__icon :deep(.v-skeleton-loader) {
  width: 100%;
  height: 100%;
}

.sidebar-widget-skeleton__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
</style>
