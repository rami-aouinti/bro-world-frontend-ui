<template>
  <main
    class="py-12"
    aria-labelledby="quiz-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="quiz-subtitle"
      >
        <h1
          id="quiz-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ hero.title }}
        </h1>
        <p
          id="quiz-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ hero.subtitle }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="quiz-overview-title"
      >
        <div class="text-center mb-8">
          <h2
            id="quiz-overview-title"
            class="text-h4 font-weight-semibold mb-2"
          >
            {{ t("pages.quiz.overview.title") }}
          </h2>
          <p
            class="text-body-1 text-medium-emphasis mx-auto"
            style="max-width: 560px"
          >
            {{ t("pages.quiz.overview.description") }}
          </p>
        </div>
        <v-row dense>
          <v-col
            v-for="card in overviewCards"
            :key="card.title"
            cols="12"
            md="4"
          >
            <v-card class="pa-6 h-100" variant="tonal">
              <div class="d-flex align-center justify-space-between mb-2">
                <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                  {{ card.title }}
                </h3>
                <v-chip
                  v-if="card.trend"
                  color="primary"
                  size="small"
                  variant="flat"
                  class="text-caption"
                  :aria-label="getTrendLabel(card.trend)"
                >
                  {{ card.trend }}
                </v-chip>
              </div>
              <p class="text-h5 font-weight-bold mb-1">
                {{ card.value }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ card.caption }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="quiz-features-title"
      >
        <h2
          id="quiz-features-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.quiz.featuresTitle") }}
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
        aria-labelledby="quiz-process-title"
      >
        <h2
          id="quiz-process-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.quiz.process.title") }}
        </h2>
        <ol class="d-flex flex-column gap-4 list-none pa-0">
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
                :aria-label="t('pages.quiz.process.stepLabel', { number: index + 1 })"
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

      <section
        class="mb-12"
        aria-labelledby="quiz-question-banks-title"
      >
        <div class="mb-6">
          <h2
            id="quiz-question-banks-title"
            class="text-h4 font-weight-semibold mb-2"
          >
            {{ t("pages.quiz.questionBanks.title") }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ t("pages.quiz.questionBanks.description") }}
          </p>
        </div>
        <v-row dense>
          <v-col
            v-for="bank in questionBanks"
            :key="bank.title"
            cols="12"
            md="4"
          >
            <v-card class="pa-6 h-100" variant="tonal">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                  {{ bank.title }}
                </h3>
                <v-chip
                  size="small"
                  color="primary"
                  variant="flat"
                  class="text-caption"
                >
                  {{ bank.difficulty }}
                </v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ bank.description }}
              </p>
              <v-list class="py-0">
                <v-list-item>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ t("pages.quiz.questionBanks.countLabel") }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
                    {{ bank.count }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ t("pages.quiz.questionBanks.focusLabel") }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
                    {{ bank.focus }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="quiz-leaderboard-title"
      >
        <div class="mb-6 d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">
          <div>
            <h2
              id="quiz-leaderboard-title"
              class="text-h4 font-weight-semibold mb-2"
            >
              {{ t("pages.quiz.leaderboard.title") }}
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t("pages.quiz.leaderboard.description") }}
            </p>
          </div>
          <v-chip
            color="primary"
            variant="flat"
            class="text-caption"
          >
            {{ t("pages.quiz.leaderboard.updateLabel") }}
          </v-chip>
        </div>
        <v-table density="comfortable" class="rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th scope="col" class="text-left">
                {{ t("pages.quiz.leaderboard.columns.rank") }}
              </th>
              <th scope="col" class="text-left">
                {{ t("pages.quiz.leaderboard.columns.player") }}
              </th>
              <th scope="col" class="text-left">
                {{ t("pages.quiz.leaderboard.columns.score") }}
              </th>
              <th scope="col" class="text-left">
                {{ t("pages.quiz.leaderboard.columns.completed") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in leaderboard"
              :key="entry.rank"
            >
              <td>{{ entry.rank }}</td>
              <td>{{ entry.player }}</td>
              <td>{{ entry.score }}</td>
              <td>{{ entry.completed }}</td>
            </tr>
          </tbody>
        </v-table>
      </section>

      <section aria-labelledby="quiz-cta-title">
        <v-card
          class="pa-8"
          color="primary"
          variant="flat"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
            <h2
              id="quiz-cta-title"
              class="text-h4 font-weight-semibold text-white mb-2"
            >
              {{ cta.title }}
            </h2>
            <p
              class="text-body-1 text-white text-opacity-80 mb-0"
              style="max-width: 520px"
            >
              {{ cta.description }}
            </p>
          </div>
          <v-btn
            :to="contactLink"
            color="white"
            variant="flat"
            size="large"
            class="text-primary"
            :aria-label="cta.buttonAria"
          >
            {{ cta.button }}
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
import type { QuizLandingData } from "~/server/utils/quiz";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const localePath = useResolvedLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.quiz.description"));

definePageMeta({
  documentDriven: false,
});

const { data: quizData } = await useAsyncData<QuizLandingData>("quiz-landing", () => $fetch("/api/quiz"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.quiz.title");
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

const fallbackHero = computed(() => ({
  title: t("pages.quiz.title"),
  subtitle: t("pages.quiz.subtitle"),
}));

const hero = computed(() => quizData.value?.hero ?? fallbackHero.value);

const fallbackOverviewCards = computed(() => [
  {
    title: t("pages.quiz.overview.cards.participants.title"),
    value: t("pages.quiz.overview.cards.participants.value"),
    trend: t("pages.quiz.overview.cards.participants.trend"),
    caption: t("pages.quiz.overview.cards.participants.caption"),
  },
  {
    title: t("pages.quiz.overview.cards.completion.title"),
    value: t("pages.quiz.overview.cards.completion.value"),
    trend: t("pages.quiz.overview.cards.completion.trend"),
    caption: t("pages.quiz.overview.cards.completion.caption"),
  },
  {
    title: t("pages.quiz.overview.cards.satisfaction.title"),
    value: t("pages.quiz.overview.cards.satisfaction.value"),
    trend: t("pages.quiz.overview.cards.satisfaction.trend"),
    caption: t("pages.quiz.overview.cards.satisfaction.caption"),
  },
]);

const overviewCards = computed(() =>
  quizData.value?.overview?.length ? quizData.value.overview : fallbackOverviewCards.value,
);

const fallbackFeatureCards = computed(() => [
  {
    icon: "mdi:clipboard-text-clock-outline",
    title: t("pages.quiz.features.authoring.title"),
    description: t("pages.quiz.features.authoring.description"),
    points: [
      t("pages.quiz.features.authoring.points.0"),
      t("pages.quiz.features.authoring.points.1"),
      t("pages.quiz.features.authoring.points.2"),
    ],
  },
  {
    icon: "mdi:account-voice",
    title: t("pages.quiz.features.engagement.title"),
    description: t("pages.quiz.features.engagement.description"),
    points: [
      t("pages.quiz.features.engagement.points.0"),
      t("pages.quiz.features.engagement.points.1"),
      t("pages.quiz.features.engagement.points.2"),
    ],
  },
  {
    icon: "mdi:chart-box-outline",
    title: t("pages.quiz.features.analytics.title"),
    description: t("pages.quiz.features.analytics.description"),
    points: [
      t("pages.quiz.features.analytics.points.0"),
      t("pages.quiz.features.analytics.points.1"),
      t("pages.quiz.features.analytics.points.2"),
    ],
  },
]);

const featureCards = computed(() =>
  quizData.value?.features?.length ? quizData.value.features : fallbackFeatureCards.value,
);

const fallbackProcessSteps = computed(() => [
  {
    title: t("pages.quiz.process.steps.plan.title"),
    description: t("pages.quiz.process.steps.plan.description"),
  },
  {
    title: t("pages.quiz.process.steps.launch.title"),
    description: t("pages.quiz.process.steps.launch.description"),
  },
  {
    title: t("pages.quiz.process.steps.iterate.title"),
    description: t("pages.quiz.process.steps.iterate.description"),
  },
]);

const processSteps = computed(() =>
  quizData.value?.process?.length ? quizData.value.process : fallbackProcessSteps.value,
);

const fallbackQuestionBanks = computed(() => [
  {
    title: t("pages.quiz.questionBanks.banks.general.title"),
    description: t("pages.quiz.questionBanks.banks.general.description"),
    count: t("pages.quiz.questionBanks.banks.general.count"),
    focus: t("pages.quiz.questionBanks.banks.general.focus"),
    difficulty: t("pages.quiz.questionBanks.banks.general.difficulty"),
  },
  {
    title: t("pages.quiz.questionBanks.banks.product.title"),
    description: t("pages.quiz.questionBanks.banks.product.description"),
    count: t("pages.quiz.questionBanks.banks.product.count"),
    focus: t("pages.quiz.questionBanks.banks.product.focus"),
    difficulty: t("pages.quiz.questionBanks.banks.product.difficulty"),
  },
  {
    title: t("pages.quiz.questionBanks.banks.community.title"),
    description: t("pages.quiz.questionBanks.banks.community.description"),
    count: t("pages.quiz.questionBanks.banks.community.count"),
    focus: t("pages.quiz.questionBanks.banks.community.focus"),
    difficulty: t("pages.quiz.questionBanks.banks.community.difficulty"),
  },
]);

const questionBanks = computed(() =>
  quizData.value?.questionBanks?.length ? quizData.value.questionBanks : fallbackQuestionBanks.value,
);

const fallbackLeaderboard = computed(() => [
  {
    rank: t("pages.quiz.leaderboard.rows.0.rank"),
    player: t("pages.quiz.leaderboard.rows.0.player"),
    score: t("pages.quiz.leaderboard.rows.0.score"),
    completed: t("pages.quiz.leaderboard.rows.0.completed"),
  },
  {
    rank: t("pages.quiz.leaderboard.rows.1.rank"),
    player: t("pages.quiz.leaderboard.rows.1.player"),
    score: t("pages.quiz.leaderboard.rows.1.score"),
    completed: t("pages.quiz.leaderboard.rows.1.completed"),
  },
  {
    rank: t("pages.quiz.leaderboard.rows.2.rank"),
    player: t("pages.quiz.leaderboard.rows.2.player"),
    score: t("pages.quiz.leaderboard.rows.2.score"),
    completed: t("pages.quiz.leaderboard.rows.2.completed"),
  },
  {
    rank: t("pages.quiz.leaderboard.rows.3.rank"),
    player: t("pages.quiz.leaderboard.rows.3.player"),
    score: t("pages.quiz.leaderboard.rows.3.score"),
    completed: t("pages.quiz.leaderboard.rows.3.completed"),
  },
]);

const leaderboard = computed(() =>
  quizData.value?.leaderboard?.length ? quizData.value.leaderboard : fallbackLeaderboard.value,
);

const fallbackCta = computed(() => ({
  title: t("pages.quiz.cta.title"),
  description: t("pages.quiz.cta.description"),
  button: t("pages.quiz.cta.button"),
  buttonAria: t("pages.quiz.cta.buttonAria"),
  link: "/contact",
}));

const cta = computed(() => {
  const fallback = fallbackCta.value;
  const data = quizData.value?.cta;
  if (!data) {
    return fallback;
  }

  return {
    ...fallback,
    ...data,
    link: data.link || fallback.link,
  };
});

const contactLink = computed(() => {
  const link = cta.value.link || "/contact";
  return localePath(link);
});

function getTrendLabel(change?: string) {
  if (!change) {
    return undefined;
  }

  return t("pages.quiz.overview.trendLabel", { change });
}
</script>
