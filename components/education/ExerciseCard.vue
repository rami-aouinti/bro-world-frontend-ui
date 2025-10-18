<template>
  <v-card class="mb-4" elevation="1" rounded="xl">
    <v-card-item>
      <v-card-title class="text-subtitle-1">
        {{ exercise.question }}
      </v-card-title>
    </v-card-item>
    <v-divider class="mx-4" />
    <v-card-text>
      <v-radio-group
        v-model="localValue"
        :disabled="disabled || answered"
        class="d-flex flex-column gap-2"
        :aria-label="exercise.question"
      >
        <v-radio
          v-for="option in normalizedOptions"
          :key="option.key"
          :label="option.label"
          :value="option.key"
          color="primary"
        />
      </v-radio-group>
      <v-alert
        v-if="answered"
        :type="isCorrect ? 'success' : 'error'"
        variant="tonal"
        border="start"
        class="mt-4"
      >
        {{ isCorrect ? t("education.exercise.correct") : t("education.exercise.incorrect") }}
      </v-alert>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn
        color="primary"
        :disabled="!localValue || disabled || answered"
        :loading="loading"
        @click="submit"
      >
        {{ t("education.exercise.submit") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Exercise, ExerciseOption } from "~/types/education";

const props = defineProps<{
  exercise: Exercise;
  modelValue?: string;
  disabled?: boolean;
  loading?: boolean;
  answered?: boolean;
  isCorrect?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string | undefined): void;
  (event: "submit", value: string | undefined): void;
}>();

const localValue = ref<string | undefined>(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = value;
  },
);

const { t } = useI18n();

const normalizedOptions = computed<ExerciseOption[]>(() => {
  if (props.exercise.options?.length) {
    return props.exercise.options;
  }
  if (props.exercise.type === "truefalse") {
    return [
      { key: "true", label: t("education.exercise.true") },
      { key: "false", label: t("education.exercise.false") },
    ];
  }
  return [];
});

const answered = computed(() => props.answered ?? false);
const isCorrect = computed(() => props.isCorrect ?? false);
const disabled = computed(() => props.disabled ?? false);
const loading = computed(() => props.loading ?? false);

function submit() {
  emit("submit", localValue.value);
}

watch(localValue, (value) => emit("update:modelValue", value));
</script>
