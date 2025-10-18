<template>
  <section class="course-header py-6">
    <div class="d-flex flex-column flex-md-row gap-6">
      <v-img
        :src="course.cover"
        :alt="course.title"
        class="rounded-xl"
        width="320"
        height="200"
        cover
      />
      <div class="flex-grow-1">
        <div class="d-flex flex-wrap align-center gap-2 mb-3">
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ t(`education.levels.${course.level}`) }}
          </v-chip>
          <v-chip
            size="small"
            variant="tonal"
          >
            {{ formatDuration(course.durationMin) }}
          </v-chip>
          <v-chip
            size="small"
            color="success"
            variant="tonal"
          >
            {{
              t("education.course.completedLessons", {
                count: completedLessons,
                total: totalLessons,
              })
            }}
          </v-chip>
        </div>
        <h1 class="text-h4 text-wrap mb-3">
          {{ course.title }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ course.description }}
        </p>
        <div class="d-flex flex-wrap gap-3">
          <v-btn
            color="primary"
            size="large"
            :to="ctaTo"
            :disabled="!ctaTo"
            :aria-label="t('education.course.startAria', { title: course.title })"
          >
            {{ ctaLabel }}
          </v-btn>
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";
import type { Course } from "~/types/education";

const props = defineProps<{
  course: Course;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  ctaLabel: string;
  ctaTo?: RouteLocationRaw | null;
}>();

const { t } = useI18n();

const completedLessons = computed(() => props.completedLessons ?? 0);
const totalLessons = computed(() => props.totalLessons ?? props.course.lessons.length);

function formatDuration(duration: number) {
  if (duration < 60) {
    return t("education.course.durationMinutes", { value: duration });
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (!minutes) {
    return t("education.course.durationHours", { value: hours });
  }
  return t("education.course.durationMixed", { hours, minutes });
}

const ctaTo = computed(() => props.ctaTo ?? null);
const ctaLabel = computed(() => props.ctaLabel);
</script>

<style scoped>
.course-header {
  background: linear-gradient(135deg, rgba(90, 103, 216, 0.08), rgba(59, 130, 246, 0.05));
  border-radius: 24px;
  padding-inline: clamp(1.5rem, 3vw, 3rem);
}
</style>
