<template>
  <v-container class="py-10">
    <VBreadcrumbs
      :items="breadcrumbs"
      class="mb-6"
    />
    <header class="mb-10">
      <v-chip
        color="primary"
        variant="tonal"
        class="mb-3"
      >
        {{ t("pages.education.catalog.badge") }}
      </v-chip>
      <h1 class="text-h4 text-md-h3 mb-2">
        {{ category?.title }}
      </h1>
      <p
        class="text-body-1 text-medium-emphasis"
        style="max-width: 640px"
      >
        {{ category?.description }}
      </p>
    </header>

    <v-row dense>
      <v-col
        v-for="course in courses"
        :key="course.id"
        cols="12"
        md="6"
      >
        <CourseCard
          :course="course"
          :progress="courseProgress(course)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createError } from "h3";
import { useRoute } from "vue-router";
import CourseCard from "~/components/education/CourseCard.vue";
import { useEducationStore } from "~/stores/education";
import type { Course } from "~/types/education";

const { t } = useI18n();
const route = useRoute();
const store = useEducationStore();

const localePath = useLocalePath();

const slug = computed(() => String(route.params.slug));

if (!store.categories.length) {
  await store.fetchCategories();
}

await store.fetchCoursesByCategory(slug.value);

const category = computed(() => store.categories.value.find((entry) => entry.slug === slug.value));
const courses = computed(() =>
  store.courses.value.filter((course) => course.categorySlug === slug.value),
);

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: "Category not found" });
}

const breadcrumbs = computed(() => [
  { title: t("pages.education.breadcrumb.home"), to: localePath("/education") },
  { title: category.value?.title ?? "", disabled: true },
]);

function courseProgress(course: Course) {
  const progress = store.progress[course.id];
  if (!progress) {
    return 0;
  }
  const totalLessons = store.lessons[course.slug]?.length || course.lessons.length;
  if (!totalLessons) {
    return progress.quizScore?.passed ? 100 : 0;
  }
  const done = Object.values(progress.lessonDone).filter(Boolean).length;
  return Math.min(100, (done / totalLessons) * 100);
}

definePageMeta({
  alias: ["/academy/category/:slug"],
  requiresPlugin: "education",
});
</script>
