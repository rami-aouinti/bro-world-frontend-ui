<template>
  <v-card class="d-flex flex-column h-100" elevation="2" rounded="xl">
    <v-img :src="course.cover" :alt="course.title" height="160" cover class="rounded-t-xl" />
    <v-card-item>
      <v-card-title class="text-h6 mb-2">
        {{ course.title }}
      </v-card-title>
      <div class="d-flex flex-wrap gap-2 align-center mb-3">
        <v-chip size="small" color="primary" variant="tonal">
          {{ t(`education.levels.${course.level}`) }}
        </v-chip>
        <v-chip size="small" variant="tonal">
          {{ formatDuration(course.durationMin) }}
        </v-chip>
        <v-chip v-if="progress >= 0" size="small" color="success" variant="tonal">
          {{ t("education.course.progress", { value: Math.round(progress) }) }}
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
        :to="{ name: 'education-course-slug', params: { slug: course.slug } }"
        :aria-label="t('education.course.openAria', { title: course.title })"
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

const actionLabel = computed(() => props.action ?? t("education.course.continue"));

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

const progress = computed(() => props.progress ?? -1);
</script>
