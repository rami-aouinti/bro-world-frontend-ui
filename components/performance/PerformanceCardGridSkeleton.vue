<template>
  <section
    class="performance-section-skeleton"
    aria-hidden="true"
  >
    <header class="performance-section-skeleton__header">
      <v-skeleton-loader
        class="performance-section-skeleton__title"
        type="heading"
      />
      <v-skeleton-loader
        class="performance-section-skeleton__subtitle"
        type="text"
      />
    </header>
    <v-row
      class="performance-section-skeleton__grid"
      dense
    >
      <v-col
        v-for="index in cardCount"
        :key="index"
        cols="12"
        md="6"
        lg="4"
      >
        <v-sheet
          class="performance-section-skeleton__card"
          elevation="0"
          rounded="lg"
        >
          <v-skeleton-loader
            class="performance-section-skeleton__card-icon"
            type="avatar"
          />
          <v-skeleton-loader
            class="performance-section-skeleton__card-title"
            type="text"
          />
          <v-skeleton-loader
            v-for="line in cardLineCount"
            :key="`line-${index}-${line}`"
            class="performance-section-skeleton__card-line"
            type="text"
          />
        </v-sheet>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.round(numericValue));
}

const props = withDefaults(
  defineProps<{
    cardCount?: number;
    cardLineCount?: number;
  }>(),
  {
    cardCount: 6,
    cardLineCount: 3,
  },
);

const cardCount = computed(() => normalizePositiveInteger(props.cardCount, 6));
const cardLineCount = computed(() => normalizePositiveInteger(props.cardLineCount, 3));
</script>

<style scoped>
.performance-section-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.performance-section-skeleton__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.performance-section-skeleton__title {
  max-inline-size: 240px;
}

.performance-section-skeleton__subtitle {
  max-inline-size: 360px;
}

.performance-section-skeleton__grid {
  row-gap: 1rem;
}

.performance-section-skeleton__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 94%, transparent);
}

.performance-section-skeleton__card-icon {
  align-self: flex-start;
  inline-size: 48px;
  block-size: 48px;
}

.performance-section-skeleton__card-title {
  max-inline-size: 180px;
}

.performance-section-skeleton__card-line {
  max-inline-size: 220px;
}
</style>
