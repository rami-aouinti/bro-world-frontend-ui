<template>
  <v-container
    v-if="course && lesson"
    class="py-8"
  >
    <v-breadcrumbs
      :items="breadcrumbs"
      class="mb-4"
    />
    <LessonPlayer
      :lesson="lesson"
      :lesson-index="lessonIndex"
      :total-lessons="lessons.length"
      :progress="lessonProgress"
      :prev-to="prevLessonLink"
      :next-to="nextLessonLink"
      :is-completed="isLessonCompleted"
      :is-last="isLastLesson"
      @complete="markCompleted"
    >
      <template #exercises>
        <ExerciseCard
          v-for="exercise in lessonExercises"
          :key="exercise.id"
          v-model="answers[exercise.id]"
          :exercise="exercise"
          :answered="progress.exerciseScore?.[exercise.id]?.answered"
          :is-correct="progress.exerciseScore?.[exercise.id]?.correct"
          :disabled="Boolean(progress.exerciseScore?.[exercise.id]?.answered)"
          @submit="(value) => evaluateExercise(exercise, value)"
        />
      </template>
    </LessonPlayer>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createError } from "h3";
import { useRoute } from "vue-router";
import ExerciseCard from "~/components/education/ExerciseCard.vue";
import LessonPlayer from "~/components/education/LessonPlayer.vue";
import { useEducationStore } from "~/stores/education";
import type { Exercise, Lesson } from "~/types/education";

const { t } = useI18n();
const route = useRoute();
const store = useEducationStore();

const localePath = useLocalePath();

const slug = computed(() => String(route.params.slug));
const lessonId = computed(() => String(route.params.id));

const fetchTasks: Promise<unknown>[] = [];
const shouldFetchCourse = !store.getCourseBySlug(slug.value);

if (shouldFetchCourse) {
  fetchTasks.push(store.fetchCourseDetails(slug.value));
}

if (!store.getCourseLessons(slug.value)?.length && !shouldFetchCourse) {
  fetchTasks.push(store.fetchLessons(slug.value));
}

if (!store.getCourseExercises(slug.value)?.length) {
  fetchTasks.push(store.fetchExercises(slug.value));
}

if (fetchTasks.length) {
  await Promise.all(fetchTasks);
}

const course = computed(() => store.getCourseBySlug(slug.value));
const lessons = computed(() => {
  const list = store.getCourseLessons(slug.value);
  return Array.isArray(list) ? list : [];
});
const progress = computed(
  () => store.getProgressForCourse(course.value?.id ?? "") ?? { lessonDone: {}, exerciseScore: {} },
);

const lessonIndex = computed(() => lessons.value.findIndex((entry) => entry.id === lessonId.value));
const lesson = computed<Lesson | undefined>(() => lessons.value[lessonIndex.value]);

const lessonExercises = computed<Exercise[]>(() =>
  store.getCourseExercises(slug.value).filter((exercise) => exercise.lessonId === lessonId.value),
);

if (!course.value || !lesson.value) {
  throw createError({ statusCode: 404, statusMessage: "Lesson not found" });
}

const answers = reactive<Record<string, string | undefined>>({});

watch(
  lessonExercises,
  () => {
    for (const key of Object.keys(answers)) {
      delete answers[key];
    }
  },
  { immediate: true },
);

const isLessonCompleted = computed(() => Boolean(progress.value.lessonDone?.[lessonId.value]));
const lessonProgress = computed(() => {
  if (!lessonExercises.value.length) {
    return isLessonCompleted.value ? 100 : 0;
  }
  const answeredCount = lessonExercises.value.filter(
    (exercise) => progress.value.exerciseScore?.[exercise.id]?.answered,
  ).length;
  return Math.min(100, (answeredCount / lessonExercises.value.length) * 100);
});

const isLastLesson = computed(() => lessonIndex.value === lessons.value.length - 1);

const prevLessonLink = computed(() => {
  if (lessonIndex.value > 0) {
    return localePath({
      name: "education-course-slug-lesson-id",
      params: { slug: slug.value, id: lessons.value[lessonIndex.value - 1]!.id },
    });
  }
  return localePath({ name: "education-course-slug", params: { slug: slug.value } });
});

const nextLessonLink = computed(() => {
  if (lessonIndex.value < lessons.value.length - 1) {
    return localePath({
      name: "education-course-slug-lesson-id",
      params: { slug: slug.value, id: lessons.value[lessonIndex.value + 1]!.id },
    });
  }
  return localePath({
    name: "education-course-slug-quiz",
    params: { slug: slug.value },
  });
});

const breadcrumbs = computed(() => [
  { title: t("education.breadcrumb.home"), to: localePath("/education") },
  {
    title: course.value?.title ?? "",
    to: localePath({ name: "education-course-slug", params: { slug: slug.value } }),
  },
  { title: lesson.value?.title ?? "", disabled: true },
]);

function evaluateExercise(exercise: Exercise, value: string | undefined) {
  if (!course.value || !value) {
    return;
  }
  const correctAnswer = Array.isArray(exercise.correct) ? exercise.correct : [exercise.correct];
  const isCorrect = correctAnswer?.includes(value);
  store.setExerciseResult(course.value.id, exercise.id, Boolean(isCorrect));
  answers[exercise.id] = value;

  if (
    lessonExercises.value.length &&
    lessonExercises.value.every((entry) => progress.value.exerciseScore?.[entry.id]?.answered)
  ) {
    markCompleted();
  }
}

function markCompleted() {
  if (!course.value || !lesson.value) {
    return;
  }
  store.markLessonDone(course.value.id, lesson.value.id);
}

definePageMeta({
  alias: ["/academy/course/:slug/lesson/:id"],
});
</script>
