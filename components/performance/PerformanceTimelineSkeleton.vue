<template>
  <section
    class="performance-timeline performance-timeline--skeleton"
    aria-hidden="true"
  >
    <header class="performance-timeline__header">
      <v-skeleton-loader
        class="performance-timeline__title"
        type="heading"
      />
      <v-skeleton-loader
        class="performance-timeline__subtitle"
        type="text"
      />
    </header>
    <ol class="timeline">
      <li
        v-for="index in itemCount"
        :key="index"
        class="timeline__item"
      >
        <div
          class="timeline__marker"
          aria-hidden="true"
        >
          <span class="timeline__dot" />
          <span class="timeline__line" />
        </div>
        <div
          class="timeline__content"
          aria-busy="true"
        >
          <v-skeleton-loader
            class="timeline__date"
            type="text"
            width="120"
          />
          <v-skeleton-loader
            class="timeline__heading"
            type="text"
          />
          <v-skeleton-loader
            v-for="line in 3"
            :key="`line-${index}-${line}`"
            class="timeline__paragraph"
            type="text"
          />
        </div>
      </li>
    </ol>
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
    itemCount?: number;
  }>(),
  {
    itemCount: 4,
  },
);

const itemCount = computed(() => normalizePositiveInteger(props.itemCount, 4));
</script>

<style scoped>
.performance-timeline--skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.performance-timeline__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.performance-timeline__title {
  max-inline-size: 280px;
}

.performance-timeline__subtitle {
  max-inline-size: 360px;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2rem;
}

.timeline__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
}

.timeline__marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.25rem;
}

.timeline__dot {
  inline-size: 0.75rem;
  block-size: 0.75rem;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.6);
}

.timeline__line {
  flex: 1;
  inline-size: 2px;
  background: linear-gradient(
    to bottom,
    rgba(var(--v-theme-primary), 0.3),
    rgba(var(--v-theme-primary), 0)
  );
  margin-block-start: 0.25rem;
}

.timeline__content {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 92%, transparent);
  display: grid;
  gap: 0.75rem;
}

.timeline__date {
  max-inline-size: 140px;
}

.timeline__heading {
  max-inline-size: 220px;
}

.timeline__paragraph {
  max-inline-size: 320px;
}

@media (max-width: 959px) {
  .timeline__item {
    grid-template-columns: 1fr;
  }

  .timeline__marker {
    display: none;
  }
}
</style>
