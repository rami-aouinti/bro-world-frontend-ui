<template>
  <main
    class="py-8"
    aria-labelledby="game-heading"
  >
    <client-only>
      <teleport
        v-if="canTeleport"
        to="#menu-bar-world"
      >
        <div class="px-4 pt-4 pb-3">
          <v-card
            class="border-radius-xl"
            elevation="12"
          >
            <v-card-text class="d-flex flex-column gap-4">
              <div class="d-flex flex-column flex-md-row justify-space-between gap-4">
                <div class="d-flex align-center gap-4">
                  <UserAvatar
                    :src="currentUserAvatar"
                    :name="currentUserName"
                    :alt="currentUserName"
                    :size="64"
                  />
                  <div>
                    <p class="text-body-2 text-medium-emphasis mb-1">
                      {{
                        isAuthenticated ? t("pages.game.menu.player") : t("pages.game.menu.guest")
                      }}
                    </p>
                    <h2 class="text-subtitle-1 font-weight-bold mb-0">
                      {{ selectedCategory?.title ?? t("pages.game.menu.categoryPlaceholder") }}
                    </h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ selectedLevel?.title ?? t("pages.game.menu.levelPlaceholder") }}
                    </p>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-4">
                  <div class="game-menu-stat">
                    <p class="game-menu-stat__label">
                      {{ t("pages.game.menu.timer") }}
                    </p>
                    <p class="game-menu-stat__value">
                      {{ formattedTimer }}
                    </p>
                  </div>
                  <div class="game-menu-stat">
                    <p class="game-menu-stat__label">
                      {{ t("pages.game.menu.score") }}
                    </p>
                    <p class="game-menu-stat__value">
                      {{ scoreLabel }}
                    </p>
                  </div>
                  <div class="game-menu-stat">
                    <p class="game-menu-stat__label">
                      {{ t("pages.game.menu.progress") }}
                    </p>
                    <p class="game-menu-stat__value">{{ answeredCount }} / {{ totalQuestions }}</p>
                  </div>
                </div>
              </div>

              <v-progress-linear
                :model-value="progressValue"
                color="primary"
                height="6"
                rounded
              />

              <div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-subtitle-2 font-weight-semibold mb-0">
                    {{ t("pages.game.leaderboard.title") }}
                  </h3>
                  <span
                    v-if="leaderboardLoading"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ t("pages.game.leaderboard.loading") }}
                  </span>
                </div>
                <div v-if="leaderboardLoading">
                  <v-skeleton-loader
                    v-for="index in 3"
                    :key="`leaderboard-skeleton-${index}`"
                    type="list-item"
                    class="mb-2 border-radius-lg"
                  />
                </div>
                <v-alert
                  v-else-if="!leaderboardEntries.length"
                  type="info"
                  variant="tonal"
                  class="mb-0"
                  density="compact"
                >
                  {{ t("pages.game.leaderboard.empty") }}
                </v-alert>
                <v-list
                  v-else
                  class="bg-transparent px-0"
                  density="compact"
                >
                  <v-list-item
                    v-for="entry in leaderboardEntries"
                    :key="entry.id"
                    class="px-0"
                  >
                    <template #prepend>
                      <span class="game-menu-rank">{{ entry.rankLabel }}</span>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">
                      {{ entry.player }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text-medium-emphasis">
                      {{ entry.scoreText }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </teleport>
    </client-only>

    <v-container>
      <header class="text-center mb-10">
        <h1
          id="game-heading"
          class="text-h3 text-lg-h2 font-weight-bold mb-3"
        >
          {{ t("pages.game.title") }}
        </h1>
        <p
          class="text-body-1 text-medium-emphasis mx-auto mb-0"
          style="max-width: 640px"
        >
          {{ t("pages.game.subtitle") }}
        </p>
      </header>

      <v-row
        dense
        class="game-layout"
      >
        <v-col
          cols="12"
          md="8"
          class="d-flex flex-column gap-6"
        >
          <section aria-labelledby="game-categories-title">
            <v-card
              class="border-radius-xl"
              elevation="10"
            >
              <v-card-title
                class="d-flex flex-column flex-sm-row flex-wrap align-sm-center justify-space-between gap-2"
              >
                <div>
                  <h2
                    id="game-categories-title"
                    class="text-h5 font-weight-semibold mb-1"
                  >
                    {{ t("pages.game.categories.title") }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t("pages.game.categories.subtitle") }}
                  </p>
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  :loading="categoriesLoading"
                  :disabled="categoriesLoading"
                  @click="reloadCategories"
                >
                  {{ t("pages.game.categories.reload") }}
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div v-if="categoriesLoading">
                  <v-skeleton-loader
                    v-for="index in 3"
                    :key="`category-skeleton-${index}`"
                    type="card"
                    class="mb-4 border-radius-xl"
                  />
                </div>
                <v-alert
                  v-else-if="categoriesError"
                  type="error"
                  variant="tonal"
                  border="start"
                  class="mb-0"
                >
                  {{ categoriesError }}
                </v-alert>
                <p
                  v-else-if="!categories.length"
                  class="text-body-2 text-medium-emphasis mb-0"
                >
                  {{ t("pages.game.categories.empty") }}
                </p>
                <v-row
                  v-else
                  dense
                  class="game-categories"
                >
                  <v-col
                    v-for="category in categories"
                    :key="category.id"
                    cols="12"
                    sm="6"
                    lg="4"
                  >
                    <v-card
                      :elevation="selectedCategoryId === category.id ? 14 : 4"
                      :variant="selectedCategoryId === category.id ? 'flat' : 'tonal'"
                      class="game-category-card h-100"
                      rounded="xl"
                      @click="selectCategory(category.id)"
                    >
                      <v-card-text>
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="game-category-icon">
                            <v-icon
                              v-if="category.icon"
                              :icon="category.icon"
                              size="28"
                              color="primary"
                            />
                            <span
                              v-else
                              class="text-h5"
                              >🎮</span
                            >
                          </div>
                          <v-chip
                            v-if="category.stats?.levels"
                            color="primary"
                            size="small"
                            variant="tonal"
                          >
                            {{
                              t("pages.game.categories.levels", { count: category.stats.levels })
                            }}
                          </v-chip>
                        </div>
                        <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                          {{ category.title }}
                        </h3>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          {{ category.description }}
                        </p>
                        <div class="d-flex gap-4 mt-4 text-caption text-medium-emphasis">
                          <span v-if="category.stats?.questions">
                            {{
                              t("pages.game.categories.questions", {
                                count: category.stats.questions,
                              })
                            }}
                          </span>
                          <span v-if="category.stats?.players">
                            {{
                              t("pages.game.categories.players", { count: category.stats.players })
                            }}
                          </span>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </section>

          <section aria-labelledby="game-levels-title">
            <v-card
              class="border-radius-xl"
              elevation="10"
            >
              <v-card-title
                class="d-flex flex-column flex-sm-row flex-wrap align-sm-center justify-space-between gap-2"
              >
                <div>
                  <h2
                    id="game-levels-title"
                    class="text-h5 font-weight-semibold mb-1"
                  >
                    {{ t("pages.game.levels.title") }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t("pages.game.levels.subtitle") }}
                  </p>
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div v-if="levelsLoading">
                  <v-skeleton-loader
                    v-for="index in 2"
                    :key="`level-skeleton-${index}`"
                    type="heading, paragraph"
                    class="mb-4 border-radius-xl"
                  />
                </div>
                <v-alert
                  v-else-if="levelsError"
                  type="error"
                  variant="tonal"
                  border="start"
                  class="mb-0"
                >
                  {{ levelsError }}
                </v-alert>
                <p
                  v-else-if="!selectedCategoryId"
                  class="text-body-2 text-medium-emphasis mb-0"
                >
                  {{ t("pages.game.levels.locked") }}
                </p>
                <p
                  v-else-if="!levels.length"
                  class="text-body-2 text-medium-emphasis mb-0"
                >
                  {{ t("pages.game.levels.empty") }}
                </p>
                <div
                  v-else
                  class="d-flex flex-column gap-3"
                >
                  <v-sheet
                    v-for="level in levels"
                    :key="level.id"
                    :color="selectedLevelId === level.id ? 'primary' : undefined"
                    :variant="selectedLevelId === level.id ? 'tonal' : 'text'"
                    class="game-level-card border-radius-xl"
                    role="button"
                    tabindex="0"
                    @click="selectLevel(level.id)"
                    @keyup.enter.space="selectLevel(level.id)"
                  >
                    <div class="d-flex flex-column flex-sm-row justify-space-between gap-3">
                      <div>
                        <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                          {{ level.title }}
                        </h3>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          {{ level.description }}
                        </p>
                      </div>
                      <div
                        class="d-flex flex-wrap align-center gap-3 text-caption text-medium-emphasis"
                      >
                        <v-chip
                          v-if="level.difficulty"
                          size="small"
                          color="primary"
                          variant="flat"
                        >
                          {{ level.difficulty }}
                        </v-chip>
                        <span v-if="level.questionCount">
                          {{ t("pages.game.levels.questions", { count: level.questionCount }) }}
                        </span>
                        <span v-if="level.timeLimit">
                          {{ t("pages.game.levels.time", { minutes: level.timeLimit }) }}
                        </span>
                      </div>
                    </div>
                  </v-sheet>
                </div>
              </v-card-text>
            </v-card>
          </section>

          <section aria-labelledby="game-questions-title">
            <v-card
              class="border-radius-xl"
              elevation="12"
            >
              <template v-if="questionsLoading">
                <v-card-text>
                  <v-skeleton-loader
                    type="heading, paragraph@3"
                    class="mb-4 border-radius-xl"
                  />
                  <v-skeleton-loader
                    type="list-item-two-line@4"
                    class="border-radius-xl"
                  />
                </v-card-text>
              </template>
              <template v-else>
                <v-alert
                  v-if="questionsError"
                  type="error"
                  variant="tonal"
                  border="start"
                  class="mb-0"
                >
                  {{ questionsError }}
                </v-alert>
                <v-card-text v-else>
                  <div v-if="!selectedLevelId">
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.game.questions.empty") }}
                    </p>
                  </div>
                  <div v-else-if="!questions.length">
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.game.questions.empty") }}
                    </p>
                  </div>
                  <div v-else>
                    <div
                      class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3 mb-4"
                    >
                      <div>
                        <h2
                          id="game-questions-title"
                          class="text-h5 font-weight-semibold mb-1"
                        >
                          {{
                            t("pages.game.questions.title", {
                              index: currentQuestionIndex + 1,
                              total: totalQuestions,
                            })
                          }}
                        </h2>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          {{
                            t("pages.game.questions.progress", {
                              answered: answeredCount,
                              total: totalQuestions,
                            })
                          }}
                        </p>
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ t("pages.game.questions.timer") }}:
                        <strong>{{ formattedTimer }}</strong>
                      </div>
                    </div>

                    <p class="text-h6 font-weight-semibold mb-6">
                      {{ currentQuestionText }}
                    </p>

                    <v-radio-group
                      v-model="currentAnswer"
                      class="d-flex flex-column gap-3"
                    >
                      <v-radio
                        v-for="option in currentQuestion?.options ?? []"
                        :key="`${currentQuestion?.id ?? 'q'}-${option.key}`"
                        :label="option.label"
                        :value="option.key"
                        color="primary"
                        density="comfortable"
                        class="game-question-option"
                      />
                    </v-radio-group>

                    <v-alert
                      v-if="showAnswerWarning"
                      type="warning"
                      variant="tonal"
                      border="start"
                      class="mt-4"
                    >
                      {{ t("pages.game.questions.warning") }}
                    </v-alert>

                    <v-alert
                      v-if="validationState === 'pending'"
                      type="info"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ t("pages.game.questions.checking") }}
                    </v-alert>

                    <v-alert
                      v-if="validationState === 'error' && validationError"
                      type="error"
                      variant="tonal"
                      border="start"
                      class="mt-4"
                    >
                      {{ validationError }}
                    </v-alert>
                  </div>
                </v-card-text>
                <v-divider v-if="questions.length" />
                <v-card-actions
                  v-if="questions.length"
                  class="justify-space-between"
                >
                  <v-btn
                    variant="text"
                    color="primary"
                    :disabled="currentQuestionIndex === 0"
                    @click="goToPreviousQuestion"
                  >
                    {{ t("pages.game.questions.actions.previous") }}
                  </v-btn>
                  <div class="d-flex gap-3">
                    <v-btn
                      variant="text"
                      color="primary"
                      :disabled="currentQuestionIndex >= totalQuestions - 1"
                      @click="goToNextQuestion"
                    >
                      {{ t("pages.game.questions.actions.next") }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="flat"
                      :loading="validationState === 'pending'"
                      :disabled="!canSubmit"
                      @click="submitAnswers"
                    >
                      {{ t("pages.game.questions.actions.submit") }}
                    </v-btn>
                  </div>
                </v-card-actions>
              </template>
            </v-card>
          </section>

          <section
            v-if="isResultAvailable"
            aria-labelledby="game-results-title"
          >
            <v-card
              class="border-radius-xl"
              elevation="12"
            >
              <v-card-title>
                <h2
                  id="game-results-title"
                  class="text-h5 font-weight-semibold mb-0"
                >
                  {{ t("pages.game.results.title") }}
                </h2>
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex flex-column gap-5">
                <div class="d-flex flex-wrap gap-4">
                  <div class="game-result-stat">
                    <p class="game-result-stat__label">
                      {{ t("pages.game.results.score") }}
                    </p>
                    <p class="game-result-stat__value">
                      {{ scoreLabel }}
                    </p>
                  </div>
                  <div class="game-result-stat">
                    <p class="game-result-stat__label">
                      {{
                        t("pages.game.results.summary", {
                          correct: validationResult?.correct ?? 0,
                          total: validationResult?.total ?? 0,
                        })
                      }}
                    </p>
                    <p class="game-result-stat__value">
                      {{
                        t("pages.game.questions.progress", {
                          answered: validationResult?.correct ?? 0,
                          total: validationResult?.total ?? 0,
                        })
                      }}
                    </p>
                  </div>
                  <div class="game-result-stat">
                    <p class="game-result-stat__label">
                      {{ t("pages.game.results.time") }}
                    </p>
                    <p class="game-result-stat__value">
                      {{ formattedTimer }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="validationResult?.breakdown?.length"
                  class="d-flex flex-column gap-3"
                >
                  <v-alert
                    v-for="entry in validationResult.breakdown"
                    :key="entry.questionId"
                    :type="entry.isCorrect ? 'success' : 'error'"
                    variant="tonal"
                    border="start"
                  >
                    <div class="d-flex flex-column gap-1">
                      <div class="d-flex justify-space-between align-center">
                        <strong>{{ findQuestionPrompt(entry.questionId) }}</strong>
                        <span class="text-caption text-medium-emphasis">
                          {{
                            entry.isCorrect
                              ? t("pages.game.results.breakdown.correct")
                              : t("pages.game.results.breakdown.incorrect")
                          }}
                        </span>
                      </div>
                      <span class="text-body-2">
                        <strong>{{ t("pages.game.results.breakdown.yourAnswer") }}:</strong>
                        <span>
                          {{
                            resolveOptionLabel(entry.questionId, entry.answer) ??
                            t("pages.game.results.breakdown.noAnswer")
                          }}
                        </span>
                      </span>
                      <span
                        v-if="entry.correctAnswer"
                        class="text-body-2"
                      >
                        <strong>{{ t("pages.game.results.breakdown.correctAnswer") }}:</strong>
                        <span>{{
                          resolveOptionLabel(entry.questionId, entry.correctAnswer) ??
                          entry.correctAnswer
                        }}</span>
                      </span>
                      <span
                        v-if="entry.explanation"
                        class="text-body-2 text-medium-emphasis"
                      >
                        {{ entry.explanation }}
                      </span>
                    </div>
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>
          </section>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column gap-6"
        >
          <section aria-labelledby="game-session-title">
            <v-card
              class="border-radius-xl"
              elevation="10"
            >
              <v-card-text>
                <div v-if="isAuthenticated">
                  <div class="d-flex align-center gap-4 mb-4">
                    <UserAvatar
                      :src="currentUserAvatar"
                      :name="currentUserName"
                      :alt="currentUserName"
                      :size="72"
                    />
                    <div>
                      <h2
                        id="game-session-title"
                        class="text-h6 font-weight-semibold mb-1"
                      >
                        {{ currentUserName }}
                      </h2>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        {{ t("pages.game.menu.player") }}
                      </p>
                    </div>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t("pages.game.menu.helper") }}
                  </p>
                </div>
                <div v-else>
                  <h2
                    id="game-session-title"
                    class="text-h5 font-weight-semibold mb-2"
                  >
                    {{ t("pages.game.auth.title") }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ t("pages.game.auth.subtitle") }}
                  </p>
                  <div class="d-flex justify-center mb-4">
                    <AuthSocial
                      :loading="isRedirecting"
                      size="compact"
                      @redirect="handleSocialRedirect"
                    />
                  </div>
                  <AuthLoginForm :disabled="isRedirecting" />
                </div>
              </v-card-text>
            </v-card>
          </section>

          <section
            v-if="selectedLevel"
            aria-labelledby="game-level-details-title"
          >
            <v-card
              class="border-radius-xl"
              elevation="10"
            >
              <v-card-title>
                <h2
                  id="game-level-details-title"
                  class="text-h6 font-weight-semibold mb-0"
                >
                  {{ selectedLevel.title }}
                </h2>
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex flex-column gap-3">
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ selectedLevel.description }}
                </p>
                <div class="d-flex flex-wrap gap-3 text-caption text-medium-emphasis">
                  <span v-if="selectedLevel.difficulty">
                    {{ selectedLevel.difficulty }}
                  </span>
                  <span v-if="selectedLevel.questionCount">
                    {{ t("pages.game.levels.questions", { count: selectedLevel.questionCount }) }}
                  </span>
                  <span v-if="selectedLevel.timeLimit">
                    {{ t("pages.game.levels.time", { minutes: selectedLevel.timeLimit }) }}
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </section>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UserAvatar from "~/components/UserAvatar.vue";
import { useUserSession } from "~/composables/useUserSession";
import { resolveSocialRedirect, type SocialProvider } from "~/lib/auth/social";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const AuthLoginForm = defineAsyncComponent({
  loader: () => import("~/components/auth/LoginForm.vue"),
  suspensible: false,
});

const AuthSocial = defineAsyncComponent({
  loader: () => import("~/components/auth/Social.vue"),
  suspensible: false,
});

type MaybeNumber = number | null | undefined;

interface QuizCategory {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  stats?: {
    levels?: number | null;
    questions?: number | null;
    players?: number | null;
  };
}

interface QuizLevel {
  id: string;
  title: string;
  description?: string | null;
  difficulty?: string | null;
  questionCount?: number | null;
  timeLimit?: number | null;
}

interface QuizQuestionOption {
  key: string;
  label: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizQuestionOption[];
  correct?: string | null;
  explanation?: string | null;
}

interface QuizValidationBreakdownEntry {
  questionId: string;
  isCorrect: boolean;
  answer: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
}

interface QuizValidationResult {
  correct: number;
  total: number;
  score?: number | null;
  accuracy?: number | null;
  breakdown?: QuizValidationBreakdownEntry[];
}

interface QuizLeaderboardEntry {
  id: string;
  rank: number | string;
  player: string;
  score: number;
  completed?: number | null;
}

const { t, locale, localeProperties } = useI18n();
await useLocaleNamespaces(["pages"]);
const runtimeConfig = useRuntimeConfig();
const router = useRouter();

const currentRoute = computed(() => router.currentRoute.value);
const pageDescription = computed(() => t("seo.game.description"));

definePageMeta({
  documentDriven: false,
  alias: ["/quiz"],
  requiresPlugin: "game",
});

useSeoMeta(() => ({
  description: pageDescription.value,
}));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.game.title");
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

const session = useUserSession();
const currentUser = computed(() => session.currentUser.value ?? null);
const isAuthenticated = computed(() => session.isAuthenticated.value);

const currentUserName = computed(() => {
  const user = currentUser.value;

  if (!user) {
    return t("pages.game.menu.guestName");
  }

  const parts = [user.firstName, user.lastName].filter((value): value is string =>
    Boolean(value?.trim()),
  );

  if (parts.length) {
    return parts.join(" ");
  }

  if (user.username) {
    return user.username;
  }

  return user.email ?? t("pages.game.menu.guestName");
});

const currentUserAvatar = computed(() => currentUser.value?.photo ?? null);

const categories = ref<QuizCategory[]>([]);
const categoriesLoading = ref(false);
const categoriesError = ref<string | null>(null);
const levels = ref<QuizLevel[]>([]);
const levelsLoading = ref(false);
const levelsError = ref<string | null>(null);
const questions = ref<QuizQuestion[]>([]);
const questionsLoading = ref(false);
const questionsError = ref<string | null>(null);
const leaderboard = ref<QuizLeaderboardEntry[]>([]);
const leaderboardLoading = ref(false);

const selectedCategoryId = ref<string | null>(null);
const selectedLevelId = ref<string | null>(null);
const currentQuestionIndex = ref(0);
const answers = ref<Record<string, string>>({});
const hasAttemptedSubmit = ref(false);
const validationState = ref<"idle" | "pending" | "success" | "error">("idle");
const validationError = ref<string | null>(null);
const validationResult = ref<QuizValidationResult | null>(null);
const elapsedSeconds = ref(0);
const canTeleport = ref(false);
const isRedirecting = ref(false);

let timerHandle: ReturnType<typeof setInterval> | null = null;

const selectedCategory = computed(
  () => categories.value.find((category) => category.id === selectedCategoryId.value) ?? null,
);

const selectedLevel = computed(
  () => levels.value.find((level) => level.id === selectedLevelId.value) ?? null,
);

const totalQuestions = computed(() => questions.value.length);
const answeredCount = computed(
  () =>
    Object.values(answers.value).filter((value) => typeof value === "string" && value.trim())
      .length,
);
const progressValue = computed(() => {
  if (!totalQuestions.value) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((answeredCount.value / totalQuestions.value) * 100)));
});

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] ?? null);
const currentQuestionText = computed(
  () => currentQuestion.value?.prompt ?? t("pages.game.questions.empty"),
);

const currentAnswer = computed({
  get(): string | null {
    const question = currentQuestion.value;

    if (!question) {
      return null;
    }

    return answers.value[question.id] ?? null;
  },
  set(value: string | null) {
    const question = currentQuestion.value;

    if (!question) {
      return;
    }

    answers.value = {
      ...answers.value,
      [question.id]: value ?? "",
    };
  },
});

const allAnswered = computed(
  () => totalQuestions.value > 0 && answeredCount.value === totalQuestions.value,
);

const canSubmit = computed(
  () => allAnswered.value && validationState.value !== "pending" && Boolean(selectedLevelId.value),
);

const scorePercentage = computed(() => {
  if (!validationResult.value) {
    return null;
  }

  if (typeof validationResult.value.score === "number") {
    return Math.round(validationResult.value.score);
  }

  if (typeof validationResult.value.accuracy === "number") {
    return Math.round(validationResult.value.accuracy * 100);
  }

  if (validationResult.value.total > 0) {
    return Math.round((validationResult.value.correct / validationResult.value.total) * 100);
  }

  return null;
});

const scoreLabel = computed(() => {
  if (scorePercentage.value != null && Number.isFinite(scorePercentage.value)) {
    return `${scorePercentage.value}%`;
  }

  if (validationResult.value) {
    return `${validationResult.value.correct}/${validationResult.value.total}`;
  }

  if (validationState.value === "pending") {
    return t("pages.game.menu.pendingScore");
  }

  return t("pages.game.menu.pendingScore");
});

const formattedTimer = computed(() => formatDuration(elapsedSeconds.value));
const showAnswerWarning = computed(() => hasAttemptedSubmit.value && !allAnswered.value);
const isResultAvailable = computed(
  () => validationState.value === "success" && Boolean(validationResult.value),
);

const leaderboardEntries = computed(() =>
  leaderboard.value.map((entry, index) => ({
    id: entry.id ?? `${index}`,
    player: entry.player,
    scoreText: formatLeaderboardScore(entry.score),
    rankLabel: typeof entry.rank === "number" ? `#${entry.rank}` : entry.rank,
  })),
);

function formatDuration(totalSeconds: number): string {
  const safeValue = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatLeaderboardScore(score: MaybeNumber): string {
  if (score == null || Number.isNaN(score)) {
    return "–";
  }

  if (score <= 1) {
    return `${Math.round(score * 100)}%`;
  }

  if (score > 1000) {
    return `${Math.round(score)}`;
  }

  return `${Math.round(score)}%`;
}

function getString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeCategory(raw: unknown, index: number): QuizCategory | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id =
    getString(data.id) ?? getString(data.slug) ?? getString(data.code) ?? `category-${index}`;
  const title = getString(data.title) ?? getString(data.name) ?? getString(data.label) ?? id;
  const description =
    getString(data.description) ?? getString(data.summary) ?? getString(data.subtitle) ?? null;
  const icon = getString(data.icon) ?? getString(data.emoji) ?? null;

  const statsSource =
    (typeof data.stats === "object" && data.stats) ||
    (typeof data.meta === "object" && data.meta) ||
    null;

  const statsRecord = statsSource as Record<string, unknown> | null;

  const levelsCount = getNumber(data.levels ?? statsRecord?.levels ?? statsRecord?.levelCount);
  const questionCount = getNumber(
    data.questionCount ?? data.questions ?? statsRecord?.questions ?? statsRecord?.questionCount,
  );
  const playersCount = getNumber(
    data.players ?? data.participants ?? statsRecord?.players ?? statsRecord?.participants,
  );

  return {
    id,
    title,
    description,
    icon,
    stats: {
      levels: levelsCount,
      questions: questionCount,
      players: playersCount,
    },
  };
}

function normalizeLevel(raw: unknown, index: number): QuizLevel | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = getString(data.id) ?? getString(data.slug) ?? `level-${index}`;
  const title = getString(data.title) ?? getString(data.name) ?? id;
  const description =
    getString(data.description) ?? getString(data.summary) ?? getString(data.subtitle) ?? null;
  const difficulty = getString(data.difficulty) ?? getString(data.tier) ?? null;
  const questionCount = getNumber(
    data.questionCount ?? data.questions ?? data.totalQuestions ?? data.length,
  );
  const timeLimit = getNumber(data.timeLimit ?? data.duration ?? data.timer ?? data.minutes);

  return {
    id,
    title,
    description,
    difficulty,
    questionCount,
    timeLimit,
  };
}

function normalizeQuestion(raw: unknown, index: number): QuizQuestion | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = getString(data.id) ?? getString(data.questionId) ?? `question-${index}`;
  const prompt =
    getString(data.prompt) ??
    getString(data.question) ??
    getString(data.title) ??
    getString(data.text);

  const rawOptions =
    (Array.isArray(data.options) && data.options) ||
    (Array.isArray(data.choices) && data.choices) ||
    (Array.isArray(data.answers) && data.answers) ||
    [];

  const options: QuizQuestionOption[] = [];

  rawOptions.forEach((optionRaw, optionIndex) => {
    if (!optionRaw || typeof optionRaw !== "object") {
      return;
    }

    const optionData = optionRaw as Record<string, unknown>;
    const key =
      getString(optionData.key) ??
      getString(optionData.id) ??
      getString(optionData.value) ??
      `option-${optionIndex}`;
    const label =
      getString(optionData.label) ??
      getString(optionData.title) ??
      getString(optionData.text) ??
      getString(optionData.value);

    if (!key || !label) {
      return;
    }

    options.push({ key, label });
  });

  if (!id || !prompt || !options.length) {
    return null;
  }

  const correct =
    getString(data.correct) ??
    getString(data.answer) ??
    getString(data.correctAnswer) ??
    getString((data.solution as Record<string, unknown> | undefined)?.key);

  const explanation = getString(data.explanation) ?? getString(data.feedback) ?? null;

  return {
    id,
    prompt,
    options,
    correct,
    explanation,
  };
}

function normalizeValidationResponse(input: unknown): QuizValidationResult | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const data = input as Record<string, unknown>;
  const summary =
    (typeof data.summary === "object" && data.summary) ||
    (typeof data.result === "object" && data.result) ||
    null;
  const summaryRecord = summary as Record<string, unknown> | null;

  const correct =
    getNumber(data.correct ?? summaryRecord?.correct ?? data.scoreCorrect) ?? undefined;
  const total = getNumber(data.total ?? summaryRecord?.total ?? data.scoreTotal) ?? undefined;

  const percentageRaw = getNumber(
    data.scorePercentage ?? data.percentage ?? summaryRecord?.percentage ?? null,
  );
  const accuracyRaw = getNumber(
    data.accuracy ??
      summaryRecord?.accuracy ??
      data.ratio ??
      summaryRecord?.ratio ??
      summaryRecord?.accuracyRatio,
  );

  const normalizedAccuracy =
    accuracyRaw != null
      ? accuracyRaw > 1
        ? accuracyRaw / 100
        : accuracyRaw
      : correct != null && total
        ? total > 0
          ? correct / total
          : null
        : null;

  const normalizedScore =
    percentageRaw != null
      ? percentageRaw <= 1
        ? percentageRaw * 100
        : percentageRaw
      : normalizedAccuracy != null
        ? normalizedAccuracy * 100
        : null;

  const breakdownSource =
    (Array.isArray(data.breakdown) && data.breakdown) ||
    (Array.isArray(data.details) && data.details) ||
    (Array.isArray(data.questions) && data.questions) ||
    (Array.isArray(summaryRecord?.breakdown) && (summaryRecord?.breakdown as unknown[])) ||
    [];

  const breakdown: QuizValidationBreakdownEntry[] = [];

  if (Array.isArray(breakdownSource)) {
    for (const entry of breakdownSource) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const record = entry as Record<string, unknown>;
      const questionId =
        getString(record.questionId) ?? getString(record.id) ?? getString(record.question);

      if (!questionId) {
        continue;
      }

      const statusValue = getString(record.status);
      const isCorrect = Boolean(
        record.isCorrect ??
          record.correct ??
          record.success ??
          record.passed ??
          (statusValue ? statusValue === "correct" : false),
      );

      const answer =
        getString(record.answer) ??
        getString(record.choice) ??
        getString(record.selected) ??
        getString(record.response);

      const correctAnswer =
        getString(record.correctAnswer) ?? getString(record.expected) ?? getString(record.solution);

      const explanation = getString(record.explanation) ?? getString(record.feedback) ?? null;

      breakdown.push({
        questionId,
        isCorrect,
        answer: answer ?? null,
        correctAnswer: correctAnswer ?? null,
        explanation,
      });
    }
  }

  if (correct == null || total == null) {
    if (breakdown.length) {
      const computedCorrect = breakdown.filter((entry) => entry.isCorrect).length;
      return {
        correct: computedCorrect,
        total: breakdown.length,
        accuracy:
          normalizedAccuracy ?? (breakdown.length ? computedCorrect / breakdown.length : null),
        score: normalizedScore,
        breakdown,
      };
    }

    return null;
  }

  return {
    correct,
    total,
    accuracy: normalizedAccuracy,
    score: normalizedScore,
    breakdown,
  };
}

function normalizeLeaderboard(input: unknown): QuizLeaderboardEntry[] {
  const source =
    (Array.isArray(input) && input) ||
    (Array.isArray((input as { entries?: unknown[] })?.entries) &&
      (input as { entries?: unknown[] }).entries) ||
    (Array.isArray((input as { data?: unknown[] })?.data) &&
      (input as { data?: unknown[] }).data) ||
    [];

  const entries: QuizLeaderboardEntry[] = [];

  source.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      return;
    }

    const data = raw as Record<string, unknown>;
    const player =
      getString(data.player) ??
      getString(data.user) ??
      getString(data.name) ??
      `Player ${index + 1}`;
    const score = getNumber(data.score ?? data.percentage ?? data.points ?? data.value);

    if (score == null) {
      return;
    }

    const rank =
      getNumber(data.rank ?? data.position ?? data.place) ??
      getString(data.rank ?? data.position ?? data.place) ??
      index + 1;

    entries.push({
      id: getString(data.id) ?? `${index}`,
      player,
      score,
      rank,
      completed: getNumber(data.completed ?? data.total ?? data.quizzes ?? data.runs) ?? null,
    });
  });

  return entries;
}

function createErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message && error.message !== "invalid-response") {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function resetQuizState() {
  questions.value = [];
  answers.value = {};
  currentQuestionIndex.value = 0;
  validationState.value = "idle";
  validationError.value = null;
  validationResult.value = null;
  hasAttemptedSubmit.value = false;
  stopTimer();
  elapsedSeconds.value = 0;
}

async function loadCategories() {
  categoriesLoading.value = true;
  categoriesError.value = null;

  try {
    const response = await $fetch("/api/game/quiz/categories", {
      params: { locale: locale.value },
    });
    const list =
      (Array.isArray(response) && response) ||
      (Array.isArray((response as { data?: unknown[] })?.data) &&
        (response as { data?: unknown[] }).data) ||
      (Array.isArray((response as { categories?: unknown[] })?.categories) &&
        (response as { categories?: unknown[] }).categories) ||
      [];

    categories.value = list
      .map((item, index) => normalizeCategory(item, index))
      .filter((item): item is QuizCategory => Boolean(item));
  } catch (error) {
    categoriesError.value = createErrorMessage(error, t("pages.game.errors.categories"));
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
}

async function loadLevels(categoryId: string) {
  levelsLoading.value = true;
  levelsError.value = null;
  levels.value = [];
  selectedLevelId.value = null;
  leaderboard.value = [];
  resetQuizState();

  try {
    const response = await $fetch("/api/game/quiz/levels", {
      params: { category: categoryId, locale: locale.value },
    });

    const list =
      (Array.isArray(response) && response) ||
      (Array.isArray((response as { data?: unknown[] })?.data) &&
        (response as { data?: unknown[] }).data) ||
      [];

    levels.value = list
      .map((item, index) => normalizeLevel(item, index))
      .filter((item): item is QuizLevel => Boolean(item));
  } catch (error) {
    levelsError.value = createErrorMessage(error, t("pages.game.errors.levels"));
    levels.value = [];
  } finally {
    levelsLoading.value = false;
  }
}

async function loadQuestions(categoryId: string, levelId: string) {
  questionsLoading.value = true;
  questionsError.value = null;
  resetQuizState();

  try {
    const response = await $fetch("/api/game/quiz/questions", {
      params: { category: categoryId, level: levelId, locale: locale.value },
    });

    const list =
      (Array.isArray(response) && response) ||
      (Array.isArray((response as { data?: unknown[] })?.data) &&
        (response as { data?: unknown[] }).data) ||
      [];

    questions.value = list
      .map((item, index) => normalizeQuestion(item, index))
      .filter((item): item is QuizQuestion => Boolean(item));

    if (questions.value.length && import.meta.client) {
      startTimer();
    }
  } catch (error) {
    questionsError.value = createErrorMessage(error, t("pages.game.errors.questions"));
    questions.value = [];
  } finally {
    questionsLoading.value = false;
  }

  await loadLeaderboard(categoryId, levelId);
}

async function loadLeaderboard(categoryId?: string | null, levelId?: string | null) {
  if (!categoryId || !levelId) {
    leaderboard.value = [];
    return;
  }

  leaderboardLoading.value = true;

  try {
    const response = await $fetch("/api/game/quiz/leaderboard", {
      params: { category: categoryId, level: levelId },
    });

    leaderboard.value = normalizeLeaderboard(response);
  } catch {
    leaderboard.value = [];
  } finally {
    leaderboardLoading.value = false;
  }
}

function startTimer() {
  if (!import.meta.client) {
    return;
  }

  stopTimer();
  timerHandle = window.setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);
}

function stopTimer() {
  if (timerHandle != null) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function selectCategory(id: string) {
  if (selectedCategoryId.value === id) {
    return;
  }

  selectedCategoryId.value = id;
}

function selectLevel(id: string) {
  if (selectedLevelId.value === id) {
    return;
  }

  selectedLevelId.value = id;
}

function goToNextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value += 1;
  }
}

function goToPreviousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

function computeLocalScore(): QuizValidationResult | null {
  if (!questions.value.length) {
    return null;
  }

  const breakdown: QuizValidationBreakdownEntry[] = [];
  let correct = 0;

  for (const question of questions.value) {
    if (!question.correct) {
      return null;
    }

    const answer = answers.value[question.id] ?? null;
    const isCorrect = answer != null && answer === question.correct;

    breakdown.push({
      questionId: question.id,
      isCorrect,
      answer,
      correctAnswer: question.correct ?? null,
      explanation: question.explanation ?? null,
    });

    if (isCorrect) {
      correct += 1;
    }
  }

  const total = breakdown.length;

  if (!total) {
    return null;
  }

  return {
    correct,
    total,
    accuracy: correct / total,
    score: (correct / total) * 100,
    breakdown,
  };
}

async function submitAnswers() {
  hasAttemptedSubmit.value = true;

  if (!canSubmit.value || !selectedCategoryId.value || !selectedLevelId.value) {
    return;
  }

  validationState.value = "pending";
  validationError.value = null;

  try {
    const response = await $fetch("/api/game/quiz/validate", {
      method: "POST",
      body: {
        categoryId: selectedCategoryId.value,
        levelId: selectedLevelId.value,
        answers: answers.value,
        duration: elapsedSeconds.value,
      },
    });

    const normalized = normalizeValidationResponse(response);

    if (!normalized) {
      throw new Error("invalid-response");
    }

    validationResult.value = normalized;
    validationState.value = "success";
    stopTimer();
    await loadLeaderboard(selectedCategoryId.value, selectedLevelId.value);
  } catch (error) {
    const fallback = computeLocalScore();

    if (fallback) {
      validationResult.value = fallback;
      validationState.value = "success";
      stopTimer();
      await loadLeaderboard(selectedCategoryId.value, selectedLevelId.value);
      return;
    }

    validationError.value = createErrorMessage(error, t("pages.game.errors.validation"));
    validationState.value = "error";
  }
}

function findQuestionPrompt(questionId: string): string {
  return (
    questions.value.find((question) => question.id === questionId)?.prompt ??
    t("pages.game.questions.title", { index: 1, total: 1 })
  );
}

function resolveOptionLabel(
  questionId: string,
  optionKey: string | null | undefined,
): string | null {
  if (!optionKey) {
    return null;
  }

  const question = questions.value.find((item) => item.id === questionId);

  if (!question) {
    return null;
  }

  return question.options.find((option) => option.key === optionKey)?.label ?? optionKey;
}

function reloadCategories() {
  loadCategories();
}

function handleSocialRedirect(provider: SocialProvider) {
  if (isRedirecting.value) {
    return;
  }

  const target = resolveSocialRedirect(provider);

  if (!target) {
    return;
  }

  isRedirecting.value = true;

  if (import.meta.client) {
    window.location.href = target;
  }
}

watch(locale, () => {
  loadCategories();
});

watch(
  () => categories.value,
  (list) => {
    if (!list.length) {
      selectedCategoryId.value = null;
      return;
    }

    if (
      selectedCategoryId.value &&
      list.some((category) => category.id === selectedCategoryId.value)
    ) {
      return;
    }

    selectedCategoryId.value = list[0].id;
  },
  { immediate: true },
);

watch(
  () => selectedCategoryId.value,
  async (categoryId, previous) => {
    if (categoryId === previous) {
      return;
    }

    if (!categoryId) {
      levels.value = [];
      selectedLevelId.value = null;
      leaderboard.value = [];
      resetQuizState();
      return;
    }

    await loadLevels(categoryId);
  },
);

watch(
  () => selectedLevelId.value,
  async (levelId, previous) => {
    if (levelId === previous) {
      return;
    }

    if (!levelId || !selectedCategoryId.value) {
      resetQuizState();
      leaderboard.value = [];
      return;
    }

    await loadQuestions(selectedCategoryId.value, levelId);
  },
);

watch(
  () => currentQuestion.value,
  () => {
    hasAttemptedSubmit.value = false;
  },
);

onMounted(() => {
  canTeleport.value = Boolean(document.getElementById("menu-bar-world"));
});

onBeforeUnmount(() => {
  stopTimer();
});

await loadCategories();
</script>

<style scoped>
.game-menu-stat {
  min-width: 110px;
}

.game-menu-stat__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 0.25rem;
}

.game-menu-stat__value {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.game-menu-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.game-category-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.game-category-card:hover {
  transform: translateY(-4px);
}

.game-category-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
}

.game-level-card {
  padding: 20px;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.game-level-card:hover {
  transform: translateY(-2px);
}

.game-question-option :deep(.v-selection-control__input) {
  border-radius: 16px;
}

.game-result-stat {
  min-width: 160px;
}

.game-result-stat__label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 0.25rem;
}

.game-result-stat__value {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 600px) {
  .game-menu-stat {
    min-width: 90px;
  }
}
</style>
