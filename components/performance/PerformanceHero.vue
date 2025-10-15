<template>
  <section
    class="performance-hero"
    aria-labelledby="performance-hero-title"
  >
    <v-sheet
      class="performance-hero__sheet"
      elevation="0"
      rounded="xl"
    >
      <div class="performance-hero__content">
        <div class="performance-hero__badge" role="status">
          <v-icon
            icon="mdi-speedometer"
            size="22"
            class="mr-2"
            aria-hidden="true"
          />
          <span class="text-caption font-weight-medium uppercase tracking-wide">
            {{ badge }}
          </span>
        </div>
        <h1
          id="performance-hero-title"
          class="text-h3 text-lg-h2 font-weight-bold mb-3"
        >
          {{ title }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ description }}
        </p>
        <div class="performance-hero__meta">
          <v-icon
            icon="mdi-update"
            size="18"
            class="mr-1"
            aria-hidden="true"
          />
          <span>{{ lastUpdated }}</span>
        </div>
      </div>
      <div class="performance-hero__gauge" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          class="performance-hero__gauge-svg"
          role="presentation"
        >
          <defs>
            <linearGradient
              id="heroGaugeGradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stop-color="var(--hero-gauge-stop-low)"
              />
              <stop
                offset="100%"
                stop-color="var(--hero-gauge-stop-high)"
              />
            </linearGradient>
          </defs>
          <circle
            class="gauge-track"
            cx="100"
            cy="100"
            r="90"
            stroke-width="16"
            fill="none"
          />
          <circle
            class="gauge-indicator"
            cx="100"
            cy="100"
            r="90"
            stroke="url(#heroGaugeGradient)"
            stroke-width="16"
            stroke-linecap="round"
            fill="none"
            :stroke-dasharray="gaugeCircumference"
            :stroke-dashoffset="gaugeOffset"
          />
          <text
            x="50%"
            y="50%"
            class="gauge-score"
            dominant-baseline="middle"
            text-anchor="middle"
          >
            {{ score }}
          </text>
          <text
            x="50%"
            y="62%"
            class="gauge-label"
            dominant-baseline="middle"
            text-anchor="middle"
          >
            {{ t('pages.performance.hero.scoreLabel') }}
          </text>
        </svg>
      </div>
    </v-sheet>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  title: string;
  description: string;
  badge: string;
  lastUpdated: string;
  score: number;
  maxScore?: number;
}>();

const maxScore = computed(() => Math.max(props.maxScore ?? 100, props.score));
const gaugeCircumference = computed(() => 2 * Math.PI * 90);
const gaugeOffset = computed(() => {
  const normalizedScore = Math.max(
    0,
    Math.min(props.score / maxScore.value, 1),
  );
  return gaugeCircumference.value * (1 - normalizedScore);
});

const { t } = useI18n();
</script>

<style scoped>
.performance-hero {
  padding-block: clamp(2rem, 4vw, 3rem);
}

.performance-hero__sheet {
  display: grid;
  gap: clamp(2rem, 4vw, 4rem);
  padding: clamp(2.5rem, 5vw, 3.5rem);
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.1),
    rgba(var(--v-theme-primary), 0.03)
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  --hero-gauge-stop-low: rgb(var(--v-theme-primary));
  --hero-gauge-stop-high: rgb(var(--v-theme-secondary));
}

@media (min-width: 960px) {
  .performance-hero__sheet {
    grid-template-columns: minmax(0, 1fr) minmax(200px, 360px);
    align-items: center;
  }
}

.performance-hero__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.performance-hero__badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  letter-spacing: 0.08em;
}

.performance-hero__meta {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.performance-hero__gauge {
  display: grid;
  place-items: center;
}

.performance-hero__gauge-svg {
  inline-size: clamp(200px, 35vw, 260px);
  block-size: auto;
}

.gauge-track {
  stroke: rgba(var(--v-theme-on-surface), 0.08);
}

.gauge-indicator {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.8s ease;
}

.gauge-score {
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: 700;
  fill: rgb(var(--v-theme-on-surface));
}

.gauge-label {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  fill: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
}
</style>
