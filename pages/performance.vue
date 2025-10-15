<template>
  <main
    class="performance-page py-12"
    aria-labelledby="performance-heading"
  >
    <v-container class="performance-container">
      <section
        class="mb-10"
        aria-describedby="performance-subtitle"
      >
        <v-sheet
          class="performance-hero"
          elevation="0"
          rounded="xl"
        >
          <div class="performance-hero__badge">
            <v-icon
              icon="mdi-speedometer"
              size="22"
              class="mr-2"
              aria-hidden="true"
            />
            <span class="text-caption font-weight-medium text-uppercase tracking-wide">
              {{ performanceBadge }}
            </span>
          </div>
          <h1
            id="performance-heading"
            class="text-h3 font-weight-bold mb-3"
          >
            {{ performanceTitle }}
          </h1>
          <p
            id="performance-subtitle"
            class="text-body-1 text-medium-emphasis mb-4"
          >
            {{ performanceSubtitle }}
          </p>
          <div class="d-flex align-center gap-3 text-body-2 text-medium-emphasis">
            <v-icon
              icon="mdi-clock-check-outline"
              size="18"
              aria-hidden="true"
            />
            <span>{{ performanceUpdated }}</span>
          </div>
        </v-sheet>
      </section>

      <section
        class="mb-10"
        aria-labelledby="performance-metrics"
      >
        <header class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-6 gap-4">
          <div>
            <h2
              id="performance-metrics"
              class="text-h5 font-weight-semibold mb-1"
            >
              {{ t("pages.performance.metrics.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.performance.metrics.subtitle") }}
            </p>
          </div>
        </header>
        <v-row
          class="performance-metrics__row"
          dense
        >
          <v-col
            v-for="metric in metrics"
            :key="metric.key"
            cols="12"
            md="4"
          >
            <SidebarCard
              class="performance-metric-card h-100"
              glow
            >
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <p class="text-caption text-medium-emphasis mb-2">
                    {{ metric.label }}
                  </p>
                  <p class="text-h3 text-lg-h2 font-weight-bold mb-2">
                    {{ metric.value }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ metric.description }}
                  </p>
                </div>
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="48"
                >
                  <v-icon
                    :icon="metric.icon"
                    size="26"
                    aria-hidden="true"
                  />
                </v-avatar>
              </div>
              <div class="performance-metric-card__trend">
                <v-icon
                  :icon="metric.trendIcon"
                  :class="metric.trendClass"
                  size="18"
                  aria-hidden="true"
                />
                <span class="text-caption text-medium-emphasis">
                  {{ metric.trend }}
                </span>
              </div>
            </SidebarCard>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-10"
        aria-labelledby="performance-pillars"
      >
        <v-sheet
          class="performance-pillars"
          elevation="0"
          rounded="xl"
        >
          <header class="mb-6">
            <h2
              id="performance-pillars"
              class="text-h5 font-weight-semibold mb-2"
            >
              {{ t("pages.performance.pillars.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.performance.pillars.subtitle") }}
            </p>
          </header>
          <v-row dense>
            <v-col
              v-for="pillar in pillars"
              :key="pillar.key"
              cols="12"
              md="4"
            >
              <v-card
                class="performance-pillar-card h-100"
                elevation="0"
                rounded="lg"
              >
                <div class="d-flex align-start mb-4">
                  <v-avatar
                    size="44"
                    class="mr-3 performance-pillar-card__icon"
                  >
                    <v-icon
                      :icon="pillar.icon"
                      size="24"
                      aria-hidden="true"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                      {{ pillar.title }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ pillar.description }}
                    </p>
                  </div>
                </div>
                <ul class="performance-pillar-card__list">
                  <li
                    v-for="point in pillar.points"
                    :key="point"
                  >
                    <v-icon
                      icon="mdi-check-circle-outline"
                      size="18"
                      class="mr-2 text-primary"
                      aria-hidden="true"
                    />
                    <span class="text-body-2 text-medium-emphasis">{{ point }}</span>
                  </li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </section>

      <section aria-labelledby="performance-audits">
        <v-sheet
          class="performance-audits"
          elevation="0"
          rounded="xl"
        >
          <header class="mb-6">
            <h2
              id="performance-audits"
              class="text-h5 font-weight-semibold mb-2"
            >
              {{ t("pages.performance.audits.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.performance.audits.subtitle") }}
            </p>
          </header>
          <v-table
            class="performance-audits__table"
            density="comfortable"
          >
            <thead>
              <tr>
                <th scope="col">
                  {{ t("pages.performance.audits.columns.metric") }}
                </th>
                <th scope="col">
                  {{ auditColumns.target }}
                </th>
                <th scope="col">
                  {{ auditColumns.current }}
                </th>
                <th scope="col">
                  {{ auditColumns.status }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="audit in audits"
                :key="audit.key"
              >
                <th scope="row">
                  <div class="d-flex flex-column">
                    <span class="text-body-2 font-weight-medium">{{ audit.label }}</span>
                    <span class="text-caption text-medium-emphasis">{{ audit.context }}</span>
                  </div>
                </th>
                <td>
                  <span class="text-body-2 text-medium-emphasis">{{ audit.target }}</span>
                </td>
                <td>
                  <span class="text-body-2 font-weight-medium">{{ audit.current }}</span>
                </td>
                <td>
                  <v-chip
                    :color="audit.statusColor"
                    variant="tonal"
                    size="small"
                  >
                    {{ audit.status }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

definePageMeta({
  documentDriven: false,
});

const { t, tm, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.performance.title");
  const description = t("seo.performance.description");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "description", name: "description", content: description },
      { key: "og:title", property: "og:title", content: title },
      { key: "og:description", property: "og:description", content: description },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:description", name: "twitter:description", content: description },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
    link: [{ rel: "canonical", href: canonical }],
  };
});

const performanceBadge = computed(() => t("pages.performance.badge"));
const performanceTitle = computed(() => t("pages.performance.title"));
const performanceSubtitle = computed(() => t("pages.performance.subtitle"));
const performanceUpdated = computed(() => t("pages.performance.updated"));

const metrics = computed(() => [
  {
    key: "jsExecution",
    icon: "mdi-timer-sand-complete",
    label: t("pages.performance.metrics.jsExecution.label"),
    value: t("pages.performance.metrics.jsExecution.value"),
    description: t("pages.performance.metrics.jsExecution.description"),
    trend: t("pages.performance.metrics.jsExecution.trend"),
    trendIcon: "mdi-arrow-bottom-left", // downward indicates improvement
    trendClass: "text-success",
  },
  {
    key: "bundleSize",
    icon: "mdi-package-variant",
    label: t("pages.performance.metrics.bundleSize.label"),
    value: t("pages.performance.metrics.bundleSize.value"),
    description: t("pages.performance.metrics.bundleSize.description"),
    trend: t("pages.performance.metrics.bundleSize.trend"),
    trendIcon: "mdi-arrow-bottom-left",
    trendClass: "text-success",
  },
  {
    key: "lcp",
    icon: "mdi-clock-fast",
    label: t("pages.performance.metrics.lcp.label"),
    value: t("pages.performance.metrics.lcp.value"),
    description: t("pages.performance.metrics.lcp.description"),
    trend: t("pages.performance.metrics.lcp.trend"),
    trendIcon: "mdi-chart-bell-curve-cumulative",
    trendClass: "text-primary",
  },
]);

const pillars = computed(() => {
  const definitions = [
    { key: "scripting", icon: "mdi-cog-sync" },
    { key: "rendering", icon: "mdi-monitor-star" },
    { key: "media", icon: "mdi-image-multiple" },
  ] as const;

  return definitions.map((definition) => {
    const points = tm(`pages.performance.pillars.items.${definition.key}.points`) as string[] | undefined;

    return {
      key: definition.key,
      icon: definition.icon,
      title: t(`pages.performance.pillars.items.${definition.key}.title`),
      description: t(`pages.performance.pillars.items.${definition.key}.description`),
      points: points ?? [],
    };
  });
});

const auditColumns = computed(() => ({
  target: t("pages.performance.audits.columns.target"),
  current: t("pages.performance.audits.columns.current"),
  status: t("pages.performance.audits.columns.status"),
}));

const audits = computed(() => [
  {
    key: "lighthouse",
    label: t("pages.performance.audits.rows.lighthouse.label"),
    context: t("pages.performance.audits.rows.lighthouse.context"),
    target: t("pages.performance.audits.rows.lighthouse.target"),
    current: t("pages.performance.audits.rows.lighthouse.current"),
    status: t("pages.performance.audits.rows.lighthouse.status"),
    statusColor: "success",
  },
  {
    key: "mainThread",
    label: t("pages.performance.audits.rows.mainThread.label"),
    context: t("pages.performance.audits.rows.mainThread.context"),
    target: t("pages.performance.audits.rows.mainThread.target"),
    current: t("pages.performance.audits.rows.mainThread.current"),
    status: t("pages.performance.audits.rows.mainThread.status"),
    statusColor: "success",
  },
  {
    key: "largestContentfulPaint",
    label: t("pages.performance.audits.rows.largestContentfulPaint.label"),
    context: t("pages.performance.audits.rows.largestContentfulPaint.context"),
    target: t("pages.performance.audits.rows.largestContentfulPaint.target"),
    current: t("pages.performance.audits.rows.largestContentfulPaint.current"),
    status: t("pages.performance.audits.rows.largestContentfulPaint.status"),
    statusColor: "primary",
  },
]);
</script>

<style scoped>
@reference "../assets/css/tailwind.css";

.performance-container {
  max-width: 1040px;
}

.performance-hero {
  position: relative;
  overflow: hidden;
  padding: clamp(2.5rem, 4vw, 4rem);
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 55%),
    radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.12), transparent 60%),
    rgba(15, 23, 42, 0.7);
  color: inherit;
}

.performance-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    120deg,
    rgba(59, 130, 246, 0.25) 0%,
    rgba(56, 189, 248, 0.15) 35%,
    rgba(129, 140, 248, 0.15) 70%,
    transparent 100%
  );
  opacity: 0.6;
}

.performance-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  background: rgba(59, 130, 246, 0.16);
  backdrop-filter: blur(12px);
  color: inherit;
  position: relative;
  z-index: 1;
  margin-bottom: 1.25rem;
}

.performance-metric-card {
  position: relative;
  isolation: isolate;
  min-height: 220px;
}

.performance-metric-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(148, 163, 184, 0.12);
}

.performance-pillars {
  padding: clamp(2rem, 3vw, 3rem);
  background: rgba(15, 23, 42, 0.6);
}

.performance-pillar-card {
  height: 100%;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.performance-pillar-card__icon {
  background: rgba(59, 130, 246, 0.16);
  color: rgb(59, 130, 246);
}

.performance-pillar-card__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.performance-pillar-card__list li {
  display: flex;
  align-items: flex-start;
}

.performance-audits {
  padding: clamp(2rem, 3vw, 3rem);
  background: rgba(15, 23, 42, 0.55);
}

.performance-audits__table :deep(thead tr) {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: rgba(148, 163, 184, 0.9);
}

.performance-audits__table :deep(tbody tr) {
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

@media (max-width: 960px) {
  .performance-hero {
    text-align: left;
  }

  .performance-metric-card {
    min-height: auto;
  }
}
</style>
