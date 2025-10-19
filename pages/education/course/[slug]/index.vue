<template>
  <v-container
    v-if="course"
    class="py-10"
  >
    <CourseHeader
      :course="course"
      :completed-lessons="completedLessons"
      :total-lessons="lessons.length"
      :cta-label="ctaLabel"
      :cta-to="ctaTo"
    >
      <template #actions>
        <v-btn
          v-if="certificateLink"
          :to="certificateLink"
          color="secondary"
          variant="tonal"
          prepend-icon="mdi:certificate-outline"
        >
          {{ t("pages.education.course.viewCertificate") }}
        </v-btn>
      </template>
    </CourseHeader>

    <section class="mt-10">
      <header class="d-flex flex-column flex-md-row justify-space-between align-center mb-4">
        <h2 class="text-h5 mb-3 mb-md-0">
          {{ t("pages.education.course.lessonList") }}
        </h2>
        <ProgressBar
          :value="courseProgress"
          :label="t('pages.education.course.lessonProgressLabel')"
        />
      </header>
      <v-card
        rounded="xl"
        elevation="1"
      >
        <v-list
          lines="two"
          rounded="xl"
        >
          <v-list-item
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            :to="lessonLink(lesson.id)"
            :title="lesson.title"
            :subtitle="t('pages.education.course.lessonDuration', { value: lesson.durationMin })"
          >
            <template #prepend>
              <v-avatar
                color="primary"
                size="40"
                variant="tonal"
                class="font-weight-medium"
              >
                {{ index + 1 }}
              </v-avatar>
            </template>
            <template #append>
              <v-icon
                :color="isLessonCompleted(lesson.id) ? 'success' : 'grey'"
                :icon="
                  isLessonCompleted(lesson.id) ? 'mdi:check-circle' : 'mdi:play-circle-outline'
                "
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </section>

    <section class="mt-10">
      <v-card
        rounded="xl"
        elevation="1"
        class="pa-6 d-flex flex-column flex-md-row align-center gap-6"
      >
        <div class="flex-grow-1">
          <h3 class="text-h6 mb-2">{{ t("pages.education.course.quizTitle") }}</h3>
          <p class="text-body-2 text-medium-emphasis">
            {{ t("pages.education.course.quizDescription") }}
          </p>
        </div>
        <v-btn
          color="primary"
          size="large"
          :disabled="!lessonsCompleted"
          :to="quizLink"
        >
          <v-icon
            icon="mdi:clipboard-check-outline"
            start
          />
          {{ t("pages.education.course.startQuiz") }}
        </v-btn>
      </v-card>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createError } from "h3";
import { useRoute } from "vue-router";
import CourseHeader from "~/components/education/CourseHeader.vue";
import ProgressBar from "~/components/education/ProgressBar.vue";
import { useEducationStore } from "~/stores/education";

const { t } = useI18n();
const route = useRoute();
const store = useEducationStore();

const localePath = useLocalePath();

const slug = computed(() => String(route.params.slug));

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
const progress = computed(() => store.getProgressForCourse(course.value?.id ?? ""));

if (!course.value) {
  throw createError({ statusCode: 404, statusMessage: "Course not found" });
}

const completedLessons = computed(
  () => Object.values(progress.value?.lessonDone ?? {}).filter(Boolean).length,
);

const lessonsCompleted = computed(
  () => lessons.value.length > 0 && completedLessons.value >= lessons.value.length,
);

const courseProgress = computed(() => {
  if (!lessons.value.length) {
    return progress.value?.quizScore?.passed ? 100 : 0;
  }
  return Math.min(100, (completedLessons.value / lessons.value.length) * 100);
});

const nextLessonId = computed(() => {
  if (!lessons.value.length) {
    return null;
  }
  const lesson = lessons.value.find((entry) => !progress.value?.lessonDone?.[entry.id]);
  return lesson?.id ?? lessons.value[0]?.id ?? null;
});

const quizLink = computed(() =>
  localePath({
    name: "education-course-slug-quiz",
    params: { slug: course.value?.slug ?? slug.value },
  }),
);

const ctaTo = computed(() => {
  if (!course.value) {
    return null;
  }
  if (!lessons.value.length) {
    return null;
  }
  if (lessonsCompleted.value) {
    return localePath({ name: "education-course-slug-quiz", params: { slug: course.value.slug } });
  }
  const target = nextLessonId.value ?? lessons.value[0]?.id;
  return target
    ? localePath({
        name: "education-course-slug-lesson-id",
        params: { slug: course.value.slug, id: target },
      })
    : null;
});

const ctaLabel = computed(() => {
  if (!progress.value?.lessonDone || !Object.keys(progress.value.lessonDone).length) {
    return t("pages.education.course.ctaStart");
  }
  if (lessonsCompleted.value) {
    return t("pages.education.course.ctaQuiz");
  }
  return t("pages.education.course.ctaContinue");
});

const certificateLink = computed(() => {
  if (!course.value?.id) {
    return null;
  }
  const certificateId = progress.value?.certificateId;
  return certificateId
    ? localePath({ name: "education-certificate-id", params: { id: certificateId } })
    : null;
});

function isLessonCompleted(id: string) {
  return Boolean(progress.value?.lessonDone?.[id]);
}

function lessonLink(id: string) {
  return localePath({
    name: "education-course-slug-lesson-id",
    params: { slug: course.value?.slug ?? slug.value, id },
  });
}

definePageMeta({
  alias: ["/academy/course/:slug"],
  requiresPlugin: "education",
});
</script>
