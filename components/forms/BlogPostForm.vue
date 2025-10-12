<template>
  <v-form
    ref="formRef"
    @submit.prevent="handleSubmit"
  >
    <v-text-field
      v-model="localValue.title"
      :label="labels.title"
      variant="outlined"
      hide-details="auto"
      :disabled="disabled"
      class="mb-4"
      :rules="titleRules"
      data-test="blog-post-title"
    />

    <v-text-field
      v-model="localValue.summary"
      :label="labels.summary"
      variant="outlined"
      hide-details="auto"
      :disabled="disabled"
      class="mb-4"
      :rules="summaryRules"
      data-test="blog-post-summary"
    />

    <v-textarea
      v-model="localValue.content"
      :label="labels.content"
      variant="outlined"
      hide-details="auto"
      auto-grow
      :disabled="disabled"
      :rules="contentRules"
      data-test="blog-post-content"
    />

    <slot />
  </v-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";

interface BlogPostFormValue {
  title: string;
  summary: string;
  content: string;
}

interface Props {
  modelValue: BlogPostFormValue;
  labels: {
    title: string;
    summary: string;
    content: string;
  };
  disabled?: boolean;
  titleRules?: ((value: string) => true | string)[];
  summaryRules?: ((value: string) => true | string)[];
  contentRules?: ((value: string) => true | string)[];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  titleRules: () => [],
  summaryRules: () => [],
  contentRules: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: BlogPostFormValue): void;
  (e: "submit"): void;
}>();

const localValue = reactive({ ...props.modelValue });

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(localValue, value);
  },
  { deep: true },
);

watch(
  localValue,
  (value) => {
    emit("update:modelValue", { ...value });
  },
  { deep: true },
);

const formRef = ref();

function handleSubmit() {
  emit("submit");
}

defineExpose({
  validate: () => formRef.value?.validate?.(),
  resetValidation: () => formRef.value?.resetValidation?.(),
});
</script>
