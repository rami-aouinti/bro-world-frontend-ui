<template>
  <section class="quiz-runner pa-4 pa-md-6 rounded-xl">
    <header class="d-flex flex-column flex-md-row justify-space-between align-start gap-4 mb-6">
      <div>
        <p class="text-caption text-medium-emphasis mb-1">
          {{
            t("education.quiz.progress", { index: currentQuestionIndex + 1, total: totalQuestions })
          }}
        </p>
        <h2 class="text-h5 mb-2">{{ currentQuestion.question }}</h2>
      </div>
      <v-chip
        color="primary"
        variant="tonal"
      >
        {{ Math.round(progress) }}%
      </v-chip>
    </header>

    <v-progress-linear
      :model-value="progress"
      height="10"
      color="primary"
      rounded
      class="mb-6"
    />

    <v-card
      elevation="1"
      rounded="xl"
    >
      <v-card-text>
        <v-radio-group
          v-model="selectedAnswer"
          :disabled="!!result"
          class="d-flex flex-column gap-3"
        >
          <v-radio
            v-for="option in currentQuestion.options"
            :key="option.key"
            :label="option.label"
            :value="option.key"
            color="primary"
          />
        </v-radio-group>
      </v-card-text>
    </v-card>

    <footer class="d-flex flex-column flex-md-row justify-space-between align-center gap-3 mt-6">
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi:arrow-left"
        :disabled="currentQuestionIndex === 0 || !!result"
        @click="prev"
      >
        {{ t("education.quiz.previous") }}
      </v-btn>
      <div class="flex-grow-1" />
      <v-btn
        v-if="currentQuestionIndex < totalQuestions - 1 && !result"
        color="primary"
        append-icon="mdi:arrow-right"
        :disabled="!selectedAnswer"
        @click="next"
      >
        {{ t("education.quiz.next") }}
      </v-btn>
      <v-btn
        v-else-if="!result"
        color="success"
        :disabled="!selectedAnswer || !isCompleted"
        :loading="loading"
        @click="submit"
      >
        <v-icon
          icon="mdi:check-circle-outline"
          start
        />
        {{ t("education.quiz.submit") }}
      </v-btn>
    </footer>

    <v-alert
      v-if="result"
      :type="result.passed ? 'success' : 'warning'"
      variant="tonal"
      border="start"
      class="mt-6"
    >
      <div class="d-flex flex-column gap-1">
        <span class="font-weight-medium">
          {{
            result.passed
              ? t("education.quiz.passed", { score: result.correct, total: result.total })
              : t("education.quiz.failed", { score: result.correct, total: result.total })
          }}
        </span>
        <span class="text-caption text-medium-emphasis">
          {{ t("education.quiz.threshold", { value: Math.round(threshold * 100) }) }}
        </span>
      </div>
    </v-alert>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { QuizQuestion, SubmitQuizResult } from "~/types/education";

const props = defineProps<{
  questions: QuizQuestion[];
  initialAnswers?: Record<string, string>;
  result?: SubmitQuizResult | null;
  loading?: boolean;
  threshold: number;
}>();

const emit = defineEmits<{ (event: "submit", answers: Record<string, string>): void }>();

const { t } = useI18n();

const state = reactive({
  index: 0,
  answers: { ...(props.initialAnswers ?? {}) } as Record<string, string>,
});

const totalQuestions = computed(() => props.questions.length);
const currentQuestion = computed(() => props.questions[state.index] ?? props.questions[0]);

const selectedAnswer = computed({
  get: () => state.answers[currentQuestion.value?.id ?? ""],
  set: (value: string | undefined) => {
    const key = currentQuestion.value?.id;
    if (!key) return;
    if (value) {
      state.answers[key] = value;
    } else {
      delete state.answers[key];
    }
  },
});

const currentQuestionIndex = computed(() => state.index);

const progress = computed(() => {
  if (!totalQuestions.value) {
    return 0;
  }
  const answered = Object.keys(state.answers).length;
  return (answered / totalQuestions.value) * 100;
});

const isCompleted = computed(() => Object.keys(state.answers).length === totalQuestions.value);

watch(
  () => props.result,
  () => {
    if (props.result) {
      state.index = 0;
    }
  },
);

function next() {
  if (state.index < props.questions.length - 1) {
    state.index += 1;
  }
}

function prev() {
  if (state.index > 0) {
    state.index -= 1;
  }
}

function submit() {
  emit("submit", { ...state.answers });
}

const loading = computed(() => props.loading ?? false);
const result = computed(() => props.result ?? null);
const threshold = computed(() => props.threshold);
</script>
