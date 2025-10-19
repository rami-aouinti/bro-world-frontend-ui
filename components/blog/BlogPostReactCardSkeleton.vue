<template>
  <div
    class="react-card-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="react-card-skeleton__metrics">
      <div class="react-card-skeleton__bubble-group">
        <span
          v-for="index in 3"
          :key="index"
          class="react-card-skeleton__bubble"
        ></span>
      </div>
      <span class="react-card-skeleton__metric"></span>
      <span class="react-card-skeleton__metric react-card-skeleton__metric--short"></span>
    </div>

    <div class="react-card-skeleton__actions">
      <span class="react-card-skeleton__button react-card-skeleton__button--primary"></span>
      <span class="react-card-skeleton__button"></span>
      <span class="react-card-skeleton__button"></span>
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
.react-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-block: 0.25rem;
}

.react-card-skeleton__metrics {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.25rem;
}

.react-card-skeleton__bubble-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 1.75rem;
  width: 3.5rem;
}

.react-card-skeleton__bubble {
  position: absolute;
  inset-block-start: 0;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.15));
  animation: react-card-skeleton-pulse 1.4s ease-in-out infinite;
}

.react-card-skeleton__bubble:nth-child(2) {
  inset-inline-start: 0.75rem;
}

.react-card-skeleton__bubble:nth-child(3) {
  inset-inline-start: 1.5rem;
}

.react-card-skeleton__metric {
  display: inline-block;
  inline-size: 3.5rem;
  block-size: 1.1rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.15));
  animation: react-card-skeleton-pulse 1.4s ease-in-out infinite;
}

.react-card-skeleton__metric--short {
  inline-size: 1.75rem;
}

.react-card-skeleton__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.react-card-skeleton__button {
  flex: 1;
  display: inline-block;
  border-radius: 9999px;
  block-size: 2.5rem;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.15));
  animation: react-card-skeleton-pulse 1.4s ease-in-out infinite;
}

.react-card-skeleton__button--primary {
  flex: 1.35;
}

@keyframes react-card-skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
