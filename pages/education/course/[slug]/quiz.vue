<template>
  <v-container
    v-if="course"
    class="py-8"
  >
    <v-breadcrumbs
      :items="breadcrumbs"
      class="mb-4"
    />

    <section class="mb-8">
      <h1 class="text-h4 mb-2">{{ t("pages.education.quiz.title", { course: course.title }) }}</h1>
      <p class="text-body-1 text-medium-emphasis">
        {{ t("pages.education.quiz.subtitle") }}
      </p>
    </section>

    <QuizRunner
      :questions="quiz"
      :threshold="threshold"
      :result="result"
      :loading="submitting"
      @submit="submitQuiz"
    />

    <v-card
      v-if="result"
      class="mt-8 pa-6"
      rounded="xl"
      elevation="1"
    >
      <div class="d-flex flex-column gap-4">
        <div
          v-if="result.passed"
          class="d-flex flex-column gap-2"
        >
          <h2 class="text-h6">{{ t("pages.education.quiz.certificateReady") }}</h2>
          <p class="text-body-2 text-medium-emphasis">
            {{ t("pages.education.quiz.certificateDescription") }}
          </p>
          <v-form
            class="d-flex flex-column flex-md-row gap-4"
            @submit.prevent="createCertificate"
          >
            <v-text-field
              v-model="userName"
              :label="t('pages.education.quiz.nameLabel')"
              :placeholder="t('pages.education.quiz.namePlaceholder')"
              :disabled="certificatePending || Boolean(certificateLink)"
              required
              class="flex-grow-1"
            />
            <v-btn
              type="submit"
              color="primary"
              size="large"
              :loading="certificatePending"
              :disabled="!userName || Boolean(certificateLink)"
            >
              <v-icon
                icon="mdi:certificate-outline"
                start
              />
              {{
                certificateLink
                  ? t("pages.education.quiz.certificateReadyButton")
                  : t("pages.education.quiz.generateCertificate")
              }}
            </v-btn>
          </v-form>
          <div
            v-if="certificateLink"
            class="d-flex gap-3"
          >
            <v-btn
              :to="certificateLink"
              color="secondary"
              variant="tonal"
              prepend-icon="mdi:eye"
            >
              {{ t("pages.education.quiz.viewCertificate") }}
            </v-btn>
          </div>
        </div>
        <div
          v-else
          class="d-flex flex-column gap-2"
        >
          <h2 class="text-h6">{{ t("pages.education.quiz.retryTitle") }}</h2>
          <p class="text-body-2 text-medium-emphasis">
            {{ t("pages.education.quiz.retryDescription") }}
          </p>
          <v-btn
            color="primary"
            variant="tonal"
            @click="resetQuiz"
          >
            <v-icon
              icon="mdi:reload"
              start
            />
            {{ t("pages.education.quiz.retryButton") }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { createError } from "h3";
import { useRoute } from "vue-router";
import QuizRunner from "~/components/education/QuizRunner.vue";
import { useEducationStore } from "~/stores/education";
import type { SubmitQuizResult } from "~/types/education";

const { t, locale } = useI18n();
const route = useRoute();
const store = useEducationStore();

const localePath = useLocalePath();

const slug = computed(() => String(route.params.slug));

const fetchTasks: Promise<unknown>[] = [];
const shouldFetchCourse = !store.getCourseBySlug(slug.value);

if (shouldFetchCourse) {
  fetchTasks.push(store.fetchCourseDetails(slug.value));
}

if (!store.getCourseQuiz(slug.value)?.length && !shouldFetchCourse) {
  fetchTasks.push(store.fetchQuiz(slug.value));
}

if (fetchTasks.length) {
  await Promise.all(fetchTasks);
}

const course = computed(() => store.getCourseBySlug(slug.value));
const quiz = computed(() => store.getCourseQuiz(slug.value));
const threshold = ref(0.7);

const progress = computed(() => store.getProgressForCourse(course.value?.id ?? ""));
const result = ref<SubmitQuizResult | null>(progress.value?.quizScore ?? null);
const submitting = ref(false);
const certificatePending = ref(false);
const userName = ref("");

const certificateLink = computed(() => {
  if (!course.value?.id) {
    return null;
  }
  const certificateId = store.progress[course.value.id]?.certificateId;
  return certificateId
    ? localePath({ name: "education-certificate-id", params: { id: certificateId } })
    : null;
});

const certificateRecord = computed(() => {
  if (!course.value?.id) {
    return null;
  }
  const certificateId = store.progress[course.value.id]?.certificateId;
  return certificateId
    ? (store.certificates.value.find((entry) => entry.id === certificateId) ?? null)
    : null;
});

if (!course.value) {
  throw createError({ statusCode: 404, statusMessage: "Course not found" });
}

watch(
  certificateRecord,
  (value) => {
    if (value) {
      userName.value = value.userName;
    }
  },
  { immediate: true },
);

const breadcrumbs = computed(() => [
  { title: t("pages.education.breadcrumb.home"), to: localePath("/education") },
  {
    title: course.value?.title ?? "",
    to: localePath({ name: "education-course-slug", params: { slug: slug.value } }),
  },
  { title: t("pages.education.quiz.breadcrumb"), disabled: true },
]);

async function submitQuiz(answers: Record<string, string>) {
  if (!course.value) {
    return;
  }

  submitting.value = true;
  try {
    const res = await $fetch<{
      correct: number;
      total: number;
      passed: boolean;
      threshold: number;
    }>("/api/education/submit", {
      method: "POST",
      query: { locale: locale.value },
      body: {
        courseId: course.value.id,
        answers,
      },
    });

    store.setQuizScore(course.value.id, res.correct, res.total, res.passed);
    result.value = { correct: res.correct, total: res.total, passed: res.passed };
    threshold.value = res.threshold ?? threshold.value;
  } finally {
    submitting.value = false;
  }
}

async function createCertificate() {
  if (!course.value || !result.value?.passed || !userName.value.trim()) {
    return;
  }

  certificatePending.value = true;
  try {
    const certificate = await $fetch("/api/education/certificates", {
      method: "POST",
      query: { locale: locale.value },
      body: {
        courseId: course.value.id,
        userName: userName.value.trim(),
        score: Math.round((result.value.correct / result.value.total) * 100),
      },
    });

    store.addCertificate(certificate);
    userName.value = certificate.userName;
  } finally {
    certificatePending.value = false;
  }
}

function resetQuiz() {
  if (!course.value) {
    return;
  }
  store.clearQuizScore(course.value.id);
  result.value = null;
}

definePageMeta({
  alias: ["/academy/course/:slug/quiz"],
  requiresPlugin: "education",
});
</script>
