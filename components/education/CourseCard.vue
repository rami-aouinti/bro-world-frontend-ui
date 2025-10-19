<template>
  <v-card
    class="d-flex flex-column h-100"
    elevation="2"
    rounded="xl"
  >
    <div class="rounded-t-xl overflow-hidden">
      <NuxtImg
        :src="course.cover"
        :alt="course.title"
        :width="courseCoverWidth"
        :height="courseCoverHeight"
        :sizes="courseCoverSizes"
        format="webp"
        preset="lcp"
        loading="lazy"
        decoding="async"
        class="course-card__cover"
      />
    </div>
    <v-card-item>
      <v-card-title class="text-h6 mb-2">
        {{ course.title }}
      </v-card-title>
      <div class="d-flex flex-wrap gap-2 align-center mb-3">
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ t(`pages.education.levels.${course.level}`) }}
        </v-chip>
        <v-chip
          size="small"
          variant="tonal"
        >
          {{ formatDuration(course.durationMin) }}
        </v-chip>
        <v-chip
          v-if="progress >= 0"
          size="small"
          color="success"
          variant="tonal"
        >
          {{ t("pages.education.course.progress", { value: Math.round(progress) }) }}
        </v-chip>
      </div>
      <p class="text-body-2 text-medium-emphasis">
        {{ course.description }}
      </p>
    </v-card-item>
    <v-spacer />
    <v-card-actions class="pt-0">
      <v-btn
        block
        color="primary"
        :to="courseLink"
        :aria-label="t('pages.education.course.openAria', { title: course.title })"
      >
        {{ actionLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Course } from "~/types/education";

const props = defineProps<{
  course: Course;
  progress?: number;
  action?: string;
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const actionLabel = computed(() => props.action ?? t("pages.education.course.continue"));

const courseLink = computed(() =>
  localePath({ name: "education-course-slug", params: { slug: props.course.slug } }),
);

const courseCoverWidth = 480;
const courseCoverHeight = 270;
const courseCoverSizes = "(max-width: 600px) 100vw, 320px";

function formatDuration(duration: number) {
  if (duration < 60) {
    return t("pages.education.course.durationMinutes", { value: duration });
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (!minutes) {
    return t("pages.education.course.durationHours", { value: hours });
  }

  return t("pages.education.course.durationMixed", { hours, minutes });
}

const progress = computed(() => props.progress ?? -1);
</script>

<style scoped>
.course-card__cover {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
}
</style>
