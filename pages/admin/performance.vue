<template>
  <main
    class="performance-page py-12"
    aria-labelledby="performance-heading"
  >
    <v-container class="performance-page__container">
      <PerformanceHero
        :title="performanceTitle"
        :description="performanceSubtitle"
        :badge="performanceBadge"
        :last-updated="performanceUpdated"
        :score="performanceScore"
        :max-score="performanceMaxScore"
      />

      <MetricGrid
        :title="metricsTitle"
        :subtitle="metricsSubtitle"
        :metrics="metricCards"
      />

      <OpportunityList
        :title="opportunitiesTitle"
        :subtitle="opportunitiesSubtitle"
        :opportunities="opportunities"
      />

      <ImprovementTimeline
        :title="timelineTitle"
        :subtitle="timelineSubtitle"
        :milestones="timelineMilestones"
      />
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";

import PerformanceHero from "~/components/performance/PerformanceHero.vue";
import MetricGrid from "~/components/performance/MetricGrid.vue";
import OpportunityList from "~/components/performance/OpportunityList.vue";
import ImprovementTimeline from "~/components/performance/ImprovementTimeline.vue";

const METRIC_ICON_MAP = Object.freeze({
  fcp: "mdi:flash", // First Contentful Paint
  lcp: "mdi:clock-fast",
  tbt: "mdi:timer-sand",
  speedIndex: "mdi:speedometer-medium",
  cls: "mdi:crop-square",
} satisfies Record<string, string>);

const OPPORTUNITY_ICON_MAP = Object.freeze({
  layout: { icon: "mdi:table-arrow-down", color: "primary" },
  script: { icon: "mdi:script-text-play-outline", color: "secondary" },
  assets: { icon: "mdi:file-download-outline", color: "info" },
  monitoring: { icon: "mdi:chart-box-outline", color: "success" },
} satisfies Record<string, { icon: string; color: string }>);

const { t, tm, rt, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.performance.description"));

definePageMeta({
  middleware: ["auth", "admin"],
  documentDriven: false,
  showRightWidgets: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");
const localeKey = computed(() => localeProperties.value?.iso ?? locale.value);

type PrimitiveLocalizedValue = string | number | boolean;

let primitiveLocalizedValueCache: Map<PrimitiveLocalizedValue, string> =
  new Map<PrimitiveLocalizedValue, string>();
let objectLocalizedValueCache: WeakMap<object, string> = new WeakMap<object, string>();
let stringListCache: WeakMap<readonly unknown[], string[]> =
  new WeakMap<readonly unknown[], string[]>();

watch(
  localeKey,
  () => {
    primitiveLocalizedValueCache = new Map<PrimitiveLocalizedValue, string>();
    objectLocalizedValueCache = new WeakMap<object, string>();
    stringListCache = new WeakMap<readonly unknown[], string[]>();
  },
  { immediate: true },
);

useHead(() => {
  const title = t("seo.performance.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const performanceBadge = computed(() => t("pages.performance.badge"));
const performanceTitle = computed(() => t("pages.performance.title"));
const performanceSubtitle = computed(() => t("pages.performance.subtitle"));
const performanceUpdated = computed(() => t("pages.performance.updated"));

function parseToNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const performanceScore = computed(() => parseToNumber(t("pages.performance.hero.score"), 72));
const performanceMaxScore = computed(() => parseToNumber(t("pages.performance.hero.maxScore"), 100));

interface MetricConfig {
  label: string;
  value: string;
  unit?: string;
  description: string;
  trend: string;
  status: "good" | "average" | "poor";
}

function renderLocalizedValue(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const primitive = value as PrimitiveLocalizedValue;
    if (primitiveLocalizedValueCache.has(primitive)) {
      return primitiveLocalizedValueCache.get(primitive)!;
    }

    const renderedPrimitive = String(primitive);
    primitiveLocalizedValueCache.set(primitive, renderedPrimitive);
    return renderedPrimitive;
  }

  const valueAsObject = value as object;
  if (objectLocalizedValueCache.has(valueAsObject)) {
    return objectLocalizedValueCache.get(valueAsObject)!;
  }

  let renderedValue = fallback;
  let shouldCache = false;

  try {
    const rendered = rt(value as never);
    if (typeof rendered === "string") {
      renderedValue = rendered;
      shouldCache = true;
    } else if (typeof rendered === "number" || typeof rendered === "boolean") {
      renderedValue = String(rendered);
      shouldCache = true;
    }
  } catch {
    // Ignore conversion failures and fall back to the provided default.
  }

  if (shouldCache) {
    objectLocalizedValueCache.set(valueAsObject, renderedValue);
  }

  return renderedValue;
}

function renderOptionalLocalizedValue(value: unknown): string | undefined {
  const rendered = renderLocalizedValue(value, "");
  return rendered !== "" ? rendered : undefined;
}

function normalizeMetricStatus(
  value: unknown,
  fallback: MetricConfig["status"] = "average",
): MetricConfig["status"] {
  const normalized = renderLocalizedValue(value, fallback).toLowerCase();
  if (normalized === "good" || normalized === "average" || normalized === "poor") {
    return normalized as MetricConfig["status"];
  }

  return fallback;
}

function renderStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  if (stringListCache.has(value)) {
    return stringListCache.get(value)!;
  }

  const renderedList = value
    .map((item) => renderLocalizedValue(item, ""))
    .filter((item): item is string => item !== "");

  stringListCache.set(value, renderedList);
  return renderedList;
}

const metricsDefinition = computed(
  () =>
    (tm("pages.performance.metrics.items") as Record<
      string,
      Partial<Record<keyof MetricConfig, unknown>> | undefined
    > | undefined) ?? {},
);

const metricCards = computed(() => {
  return Object.entries(metricsDefinition.value).map(([key, value]) => {
    const details = value ?? {};
    const icon = METRIC_ICON_MAP[key] ?? "mdi:chart-timeline-variant";

    return {
      key,
      icon,
      label: renderLocalizedValue(details.label, key),
      value: renderLocalizedValue(details.value, "--"),
      unit: renderOptionalLocalizedValue(details.unit),
      description: renderLocalizedValue(details.description, ""),
      status: normalizeMetricStatus(details.status),
      trend: renderLocalizedValue(details.trend, ""),
    } satisfies MetricConfig & { key: string; icon: string };
  });
});

const metricsTitle = computed(() => t("pages.performance.metrics.title"));
const metricsSubtitle = computed(() => t("pages.performance.metrics.subtitle"));

interface OpportunityItem {
  key: string;
  title: string;
  description: string;
  impact: string;
  action: string;
  icon: string;
  color: string;
}

const opportunitiesDefinition = computed(
  () =>
    (tm("pages.performance.opportunities.items") as Record<
      string,
      Partial<Record<keyof Omit<OpportunityItem, "key" | "icon" | "color">, unknown>> | undefined
    > | undefined) ?? {},
);

const opportunities = computed<OpportunityItem[]>(() => {
  return Object.entries(opportunitiesDefinition.value).map(([key, value]) => {
    const details = value ?? {};
    const iconDefinition = OPPORTUNITY_ICON_MAP[key] ?? {
      icon: "mdi:alert-decagram-outline",
      color: "warning",
    };

    return {
      key,
      title: renderLocalizedValue(details.title, key),
      description: renderLocalizedValue(details.description, ""),
      impact: renderLocalizedValue(details.impact, ""),
      action: renderLocalizedValue(details.action, ""),
      icon: iconDefinition.icon,
      color: iconDefinition.color,
    } satisfies OpportunityItem;
  });
});

const opportunitiesTitle = computed(() => t("pages.performance.opportunities.title"));
const opportunitiesSubtitle = computed(() => t("pages.performance.opportunities.subtitle"));

interface TimelineMilestone {
  key: string;
  date: string;
  title: string;
  description: string;
  actions: string[];
}

const timelineDefinition = computed(
  () =>
    (tm("pages.performance.timeline.items") as Record<
      string,
      Partial<Record<keyof Omit<TimelineMilestone, "key">, unknown>> | undefined
    > | undefined) ?? {},
);

const timelineMilestones = computed<TimelineMilestone[]>(() => {
  return Object.entries(timelineDefinition.value).map(([key, value]) => {
    const details = value ?? {};

    return {
      key,
      date: renderLocalizedValue(details.date, ""),
      title: renderLocalizedValue(details.title, key),
      description: renderLocalizedValue(details.description, ""),
      actions: renderStringList(details.actions),
    } satisfies TimelineMilestone;
  });
});

const timelineTitle = computed(() => t("pages.performance.timeline.title"));
const timelineSubtitle = computed(() => t("pages.performance.timeline.subtitle"));
</script>

<style scoped>
.performance-page__container {
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vw, 4rem);
}
</style>
