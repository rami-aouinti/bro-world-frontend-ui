<template>
  <main
    class="py-12"
    aria-labelledby="job-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="job-subtitle"
      >
        <h1
          id="job-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ t("pages.job.title") }}
        </h1>
        <p
          id="job-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ t("pages.job.subtitle") }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-features-title"
      >
        <h2
          id="job-features-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.job.featuresTitle") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="feature in featureCards"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100"
            >
              <div class="d-flex align-start mb-4">
                <v-avatar
                  color="primary"
                  size="48"
                  class="mr-4"
                >
                  <v-icon
                    :icon="feature.icon"
                    size="28"
                    color="white"
                    aria-hidden="true"
                  />
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
              <ul class="pl-6 text-body-2 text-medium-emphasis mb-0">
                <li
                  v-for="point in feature.points"
                  :key="point"
                  class="mb-1"
                >
                  {{ point }}
                </li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-workflow-title"
      >
        <h2
          id="job-workflow-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.job.workflowTitle") }}
        </h2>
        <ol class="d-flex flex-column gap-4 list-none pa-0">
          <li
            v-for="(step, index) in workflowSteps"
            :key="step.title"
          >
            <v-sheet
              class="pa-6 rounded-lg d-flex align-start"
              color="surface-variant"
              variant="tonal"
            >
              <div
                class="d-flex align-center justify-center rounded-circle mr-4"
                style="width: 40px; height: 40px"
                :aria-label="t('pages.job.stepLabel', { number: index + 1 })"
              >
                <span class="text-subtitle-1 font-weight-semibold">{{ index + 1 }}</span>
              </div>
              <div>
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ step.description }}
                </p>
              </div>
            </v-sheet>
          </li>
        </ol>
      </section>

      <section aria-labelledby="job-resources-title">
        <v-card
          class="pa-8"
          color="primary"
          variant="flat"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
              <h2
                id="job-resources-title"
                class="text-h4 font-weight-semibold text-white mb-2"
              >
                {{ t("pages.job.cta.title") }}
              </h2>
              <p
                class="text-body-1 text-white text-opacity-80 mb-0"
                style="max-width: 520px"
              >
                {{ t("pages.job.cta.description") }}
              </p>
            </div>
            <v-btn
              :to="contactLink"
              color="white"
              variant="flat"
              size="large"
              class="text-primary"
              :aria-label="t('pages.job.cta.buttonAria')"
            >
              {{ t("pages.job.cta.button") }}
            </v-btn>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const localePath = useLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.job.title");
  const description = t("seo.job.description");
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

const featureCards = computed(() => [
  {
    icon: "mdi-briefcase-search-outline",
    title: t("pages.job.features.matching.title"),
    description: t("pages.job.features.matching.description"),
    points: [
      t("pages.job.features.matching.points.0"),
      t("pages.job.features.matching.points.1"),
      t("pages.job.features.matching.points.2"),
    ],
  },
  {
    icon: "mdi-robot-happy-outline",
    title: t("pages.job.features.automation.title"),
    description: t("pages.job.features.automation.description"),
    points: [
      t("pages.job.features.automation.points.0"),
      t("pages.job.features.automation.points.1"),
      t("pages.job.features.automation.points.2"),
    ],
  },
  {
    icon: "mdi-chart-line-variant",
    title: t("pages.job.features.insights.title"),
    description: t("pages.job.features.insights.description"),
    points: [
      t("pages.job.features.insights.points.0"),
      t("pages.job.features.insights.points.1"),
      t("pages.job.features.insights.points.2"),
    ],
  },
]);

const workflowSteps = computed(() => [
  {
    title: t("pages.job.workflow.steps.publish.title"),
    description: t("pages.job.workflow.steps.publish.description"),
  },
  {
    title: t("pages.job.workflow.steps.review.title"),
    description: t("pages.job.workflow.steps.review.description"),
  },
  {
    title: t("pages.job.workflow.steps.hire.title"),
    description: t("pages.job.workflow.steps.hire.description"),
  },
]);

const contactLink = computed(() => localePath("/contact"));
</script>
