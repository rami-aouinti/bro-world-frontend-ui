<template>
  <main
    class="py-12"
    aria-labelledby="academy-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="academy-subtitle"
      >
        <h1
          id="academy-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ t("pages.academy.title") }}
        </h1>
        <p
          id="academy-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ t("pages.academy.subtitle") }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="academy-courses-title"
      >
        <h2
          id="academy-courses-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.academy.courses.title") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="course in courses"
            :key="course.title"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100 d-flex flex-column"
            >
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ course.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ course.description }}
                </p>
              </div>
              <v-chip-group
                class="mb-4"
                column
                :aria-label="t('pages.academy.courses.badgesLabel')"
              >
                <v-chip
                  v-for="badge in course.badges"
                  :key="badge"
                  color="primary"
                  size="small"
                  variant="tonal"
                  class="mr-2 mb-2"
                >
                  {{ badge }}
                </v-chip>
              </v-chip-group>
              <div class="mt-auto">
                <p class="text-body-2 text-medium-emphasis mb-1">
                  <strong>{{ t("pages.academy.courses.duration") }}:</strong>
                  {{ course.duration }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  <strong>{{ t("pages.academy.courses.level") }}:</strong>
                  {{ course.level }}
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="academy-exercises-title"
      >
        <h2
          id="academy-exercises-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.academy.exercises.title") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="track in exerciseTracks"
            :key="track.title"
            cols="12"
            md="4"
          >
            <v-card
              variant="outlined"
              class="pa-6 h-100 d-flex flex-column"
            >
              <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                {{ track.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-2">
                <strong>{{ t("pages.academy.exercises.duration") }}:</strong>
                {{ track.duration }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-2">
                <strong>{{ t("pages.academy.exercises.deliverables") }}:</strong>
                {{ track.deliverables }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                <strong>{{ t("pages.academy.exercises.resources") }}:</strong>
                {{ track.resources }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="academy-certifications-title"
      >
        <h2
          id="academy-certifications-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.academy.certifications.title") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="certification in certifications"
            :key="certification.name"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100 d-flex flex-column"
            >
              <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                {{ certification.name }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-2">
                <strong>{{ t("pages.academy.certifications.provider") }}:</strong>
                {{ certification.provider }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-2">
                <strong>{{ t("pages.academy.certifications.requirements") }}:</strong>
                {{ certification.requirements }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                <strong>{{ t("pages.academy.certifications.validity") }}:</strong>
                {{ certification.validity }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="academy-process-title"
      >
        <h2
          id="academy-process-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.academy.process.title") }}
        </h2>
        <ol
          class="d-flex flex-column gap-4 list-none pa-0"
          aria-describedby="academy-process-description"
        >
          <li
            v-for="(step, index) in processSteps"
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
                :aria-label="t('pages.academy.process.stepLabel', { number: index + 1 })"
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
        <p
          id="academy-process-description"
          class="sr-only"
        >
          {{ t("pages.academy.process.description") }}
        </p>
      </section>

      <section aria-labelledby="academy-cta-title">
        <v-card
          class="pa-8"
          color="primary"
          variant="flat"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
              <h2
                id="academy-cta-title"
                class="text-h4 font-weight-semibold text-white mb-2"
              >
                {{ t("pages.academy.cta.title") }}
              </h2>
              <p
                class="text-body-1 text-white text-opacity-80 mb-0"
                style="max-width: 520px"
              >
                {{ t("pages.academy.cta.description") }}
              </p>
            </div>
            <v-btn
              :to="contactLink"
              color="white"
              variant="flat"
              size="large"
              class="text-primary"
              :aria-label="t('pages.academy.cta.buttonAria')"
            >
              {{ t("pages.academy.cta.button") }}
            </v-btn>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const localePath = useResolvedLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const pageDescription = computed(() => t("seo.academy.description"));

definePageMeta({
  documentDriven: false,
});

useSeoMeta(() => ({
  description: pageDescription.value,
}));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.academy.title");
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

const courses = computed(() => [
  {
    title: t("pages.academy.courses.items.strategy.title"),
    description: t("pages.academy.courses.items.strategy.description"),
    duration: t("pages.academy.courses.items.strategy.duration"),
    level: t("pages.academy.courses.items.strategy.level"),
    badges: [
      t("pages.academy.courses.items.strategy.badges.0"),
      t("pages.academy.courses.items.strategy.badges.1"),
      t("pages.academy.courses.items.strategy.badges.2"),
    ],
  },
  {
    title: t("pages.academy.courses.items.production.title"),
    description: t("pages.academy.courses.items.production.description"),
    duration: t("pages.academy.courses.items.production.duration"),
    level: t("pages.academy.courses.items.production.level"),
    badges: [
      t("pages.academy.courses.items.production.badges.0"),
      t("pages.academy.courses.items.production.badges.1"),
      t("pages.academy.courses.items.production.badges.2"),
    ],
  },
  {
    title: t("pages.academy.courses.items.leadership.title"),
    description: t("pages.academy.courses.items.leadership.description"),
    duration: t("pages.academy.courses.items.leadership.duration"),
    level: t("pages.academy.courses.items.leadership.level"),
    badges: [
      t("pages.academy.courses.items.leadership.badges.0"),
      t("pages.academy.courses.items.leadership.badges.1"),
      t("pages.academy.courses.items.leadership.badges.2"),
    ],
  },
]);

const exerciseTracks = computed(() => [
  {
    title: t("pages.academy.exercises.items.simulation.title"),
    duration: t("pages.academy.exercises.items.simulation.duration"),
    deliverables: t("pages.academy.exercises.items.simulation.deliverables"),
    resources: t("pages.academy.exercises.items.simulation.resources"),
  },
  {
    title: t("pages.academy.exercises.items.sprint.title"),
    duration: t("pages.academy.exercises.items.sprint.duration"),
    deliverables: t("pages.academy.exercises.items.sprint.deliverables"),
    resources: t("pages.academy.exercises.items.sprint.resources"),
  },
  {
    title: t("pages.academy.exercises.items.capstone.title"),
    duration: t("pages.academy.exercises.items.capstone.duration"),
    deliverables: t("pages.academy.exercises.items.capstone.deliverables"),
    resources: t("pages.academy.exercises.items.capstone.resources"),
  },
]);

const certifications = computed(() => [
  {
    name: t("pages.academy.certifications.items.coaching.name"),
    provider: t("pages.academy.certifications.items.coaching.provider"),
    requirements: t("pages.academy.certifications.items.coaching.requirements"),
    validity: t("pages.academy.certifications.items.coaching.validity"),
  },
  {
    name: t("pages.academy.certifications.items.facilitation.name"),
    provider: t("pages.academy.certifications.items.facilitation.provider"),
    requirements: t("pages.academy.certifications.items.facilitation.requirements"),
    validity: t("pages.academy.certifications.items.facilitation.validity"),
  },
  {
    name: t("pages.academy.certifications.items.strategy.name"),
    provider: t("pages.academy.certifications.items.strategy.provider"),
    requirements: t("pages.academy.certifications.items.strategy.requirements"),
    validity: t("pages.academy.certifications.items.strategy.validity"),
  },
]);

const processSteps = computed(() => [
  {
    title: t("pages.academy.process.steps.intake.title"),
    description: t("pages.academy.process.steps.intake.description"),
  },
  {
    title: t("pages.academy.process.steps.immersion.title"),
    description: t("pages.academy.process.steps.immersion.description"),
  },
  {
    title: t("pages.academy.process.steps.practice.title"),
    description: t("pages.academy.process.steps.practice.description"),
  },
  {
    title: t("pages.academy.process.steps.assessment.title"),
    description: t("pages.academy.process.steps.assessment.description"),
  },
]);

const contactLink = computed(() => localePath("/contact"));
</script>
