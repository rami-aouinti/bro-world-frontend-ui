<template>
  <SidebarCard
    class="metric-card"
    glow
  >
    <header class="metric-card__header">
      <div>
        <p class="metric-card__label text-caption text-medium-emphasis">
          {{ label }}
        </p>
        <p class="metric-card__value">
          <span>{{ value }}</span>
          <span
            v-if="unit"
            class="metric-card__unit"
          >
            {{ unit }}
          </span>
        </p>
      </div>
      <v-avatar
        :color="statusColor"
        variant="tonal"
        size="48"
      >
        <v-icon
          :icon="icon"
          size="26"
          aria-hidden="true"
        />
      </v-avatar>
    </header>
    <p class="metric-card__description text-body-2 text-medium-emphasis mb-4">
      {{ description }}
    </p>
    <footer class="metric-card__footer">
      <div class="metric-card__status-chip">
        <span class="metric-card__status-dot" />
        <span class="metric-card__status-label">{{ statusLabel }}</span>
      </div>
      <span class="metric-card__trend text-caption text-medium-emphasis">
        {{ trend }}
      </span>
    </footer>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  label: string;
  value: string | number;
  description: string;
  icon: string;
  status: "good" | "average" | "poor";
  trend: string;
  unit?: string;
}>();

const { t } = useI18n();

const statusColor = computed(() => {
  switch (props.status) {
    case "good":
      return "success";
    case "average":
      return "warning";
    default:
      return "error";
  }
});

const statusLabel = computed(() => {
  switch (props.status) {
    case "good":
      return t("pages.performance.metrics.status.good");
    case "average":
      return t("pages.performance.metrics.status.average");
    default:
      return t("pages.performance.metrics.status.poor");
  }
});
</script>

<style scoped>
.metric-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.75rem;
}

.metric-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.metric-card__value {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: clamp(2.25rem, 5vw, 2.75rem);
  font-weight: 700;
  line-height: 1.1;
  color: rgb(var(--v-theme-on-surface));
}

.metric-card__unit {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.metric-card__footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-card__status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  color: rgba(var(--v-theme-on-surface), 0.74);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-card__status-dot {
  inline-size: 0.65rem;
  block-size: 0.65rem;
  border-radius: 50%;
  background: currentColor;
}
</style>
