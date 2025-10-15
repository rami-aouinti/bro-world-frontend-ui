<template>
  <section
    class="performance-metrics"
    aria-labelledby="performance-metrics-title"
  >
    <header class="performance-metrics__header">
      <div>
        <h2
          id="performance-metrics-title"
          class="text-h5 font-weight-semibold mb-1"
        >
          {{ title }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ subtitle }}
        </p>
      </div>
      <slot name="actions" />
    </header>
    <v-row
      class="performance-metrics__grid"
      dense
    >
      <v-col
        v-for="metric in metrics"
        :key="metric.key"
        cols="12"
        md="6"
        lg="4"
      >
        <MetricCard
          :label="metric.label"
          :value="metric.value"
          :unit="metric.unit"
          :description="metric.description"
          :icon="metric.icon"
          :status="metric.status"
          :trend="metric.trend"
        />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
type MetricDefinition = {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  description: string;
  icon: string;
  status: "good" | "average" | "poor";
  trend: string;
};

defineProps<{
  title: string;
  subtitle: string;
  metrics: MetricDefinition[];
}>();
</script>

<style scoped>
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.performance-metrics__header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 960px) {
  .performance-metrics__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
