<template>
  <section class="lesson-player pa-4 pa-md-6 rounded-xl">
    <header class="d-flex flex-column flex-md-row justify-space-between align-start gap-4 mb-4">
      <div>
        <p class="text-caption text-medium-emphasis mb-1">
          {{ t("pages.education.lesson.position", { index: lessonIndex + 1, total: totalLessons }) }}
        </p>
        <h2 class="text-h5 mb-2">{{ lesson.title }}</h2>
        <p class="text-body-2 text-medium-emphasis">
          {{ t("pages.education.lesson.duration", { value: lesson.durationMin }) }}
        </p>
      </div>
      <div class="d-flex flex-column align-end gap-2">
        <ProgressBar
          :value="progress"
          :label="t('pages.education.lesson.progressLabel')"
        />
        <v-btn
          color="success"
          variant="tonal"
          :disabled="isCompleted"
          @click="$emit('complete')"
        >
          <v-icon
            icon="mdi:check-circle-outline"
            start
          />
          {{ isCompleted ? t("pages.education.lesson.completed") : t("pages.education.lesson.markDone") }}
        </v-btn>
      </div>
    </header>

    <article
      class="lesson-content mb-6"
      v-html="lesson.content"
    />

    <section
      v-if="$slots.exercises"
      class="mb-8"
    >
      <h3 class="text-h6 mb-3">{{ t("pages.education.lesson.exercises") }}</h3>
      <slot name="exercises" />
    </section>

    <footer class="d-flex flex-column flex-md-row justify-space-between gap-3">
      <v-btn
        v-if="prevTo"
        :to="prevTo"
        variant="outlined"
        color="primary"
        prepend-icon="mdi:arrow-left"
      >
        {{ t("pages.education.lesson.previous") }}
      </v-btn>
      <div class="flex-grow-1" />
      <v-btn
        v-if="nextTo"
        :to="nextTo"
        color="primary"
        append-icon="mdi:arrow-right"
      >
        {{ nextLabel }}
      </v-btn>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";
import ProgressBar from "~/components/education/ProgressBar.vue";
import type { Lesson } from "~/types/education";

const props = defineProps<{
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  progress: number;
  prevTo?: RouteLocationRaw | null;
  nextTo?: RouteLocationRaw | null;
  isCompleted: boolean;
  isLast: boolean;
}>();

defineEmits<{ (event: "complete"): void }>();

const { t } = useI18n();

const nextLabel = computed(() =>
  props.isLast ? t("pages.education.lesson.goToQuiz") : t("pages.education.lesson.next"),
);

const prevTo = computed(() => props.prevTo ?? null);
const nextTo = computed(() => props.nextTo ?? null);
</script>

<style scoped>
.lesson-player {
  background: rgba(15, 23, 42, 0.03);
  backdrop-filter: blur(6px);
}

.lesson-content :deep(p) {
  margin-bottom: 1rem;
  font-size: 1rem;
  line-height: 1.6;
}

.lesson-content :deep(code) {
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.12);
  font-family:
    "Fira Code", "SFMono-Regular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
