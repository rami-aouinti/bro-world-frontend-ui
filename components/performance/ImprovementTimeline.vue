<template>
  <section
    class="performance-timeline"
    aria-labelledby="performance-timeline-title"
  >
    <header class="performance-timeline__header">
      <h2
        id="performance-timeline-title"
        class="text-h5 font-weight-semibold mb-1"
      >
        {{ title }}
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ subtitle }}
      </p>
    </header>

    <ol class="timeline">
      <li
        v-for="item in milestones"
        :key="item.key"
        class="timeline__item"
      >
        <div class="timeline__marker" aria-hidden="true">
          <span class="timeline__dot" />
          <span class="timeline__line" />
        </div>
        <div class="timeline__content">
          <p class="timeline__date text-caption text-medium-emphasis mb-1">
            {{ item.date }}
          </p>
          <h3 class="text-subtitle-1 font-weight-semibold mb-2">
            {{ item.title }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-2">
            {{ item.description }}
          </p>
          <ul class="timeline__actions">
            <li
              v-for="action in item.actions"
              :key="action"
              class="timeline__action text-caption"
            >
              {{ action }}
            </li>
          </ul>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
type TimelineMilestone = {
  key: string;
  date: string;
  title: string;
  description: string;
  actions: string[];
};

defineProps<{
  title: string;
  subtitle: string;
  milestones: TimelineMilestone[];
}>();
</script>

<style scoped>
.performance-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.performance-timeline__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.15);
}

.timeline__line {
  flex: 1;
  inline-size: 2px;
  background: linear-gradient(
    to bottom,
    rgba(var(--v-theme-primary), 0.4),
    rgba(var(--v-theme-primary), 0)
  );
  margin-block-start: 0.25rem;
}

.timeline__content {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 92%, transparent);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
}

.timeline__actions {
  list-style: disc;
  margin: 0;
  padding-inline-start: 1.25rem;
  display: grid;
  gap: 0.35rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.timeline__action {
  font-weight: 500;
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
