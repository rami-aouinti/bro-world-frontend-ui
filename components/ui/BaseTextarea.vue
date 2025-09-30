<template>
  <v-textarea
    :id="controlId"
    v-bind="inputAttrs"
    :class="classes"
    :model-value="props.modelValue"
    :rows="props.rows"
    :auto-grow="props.autoGrow"
    :hint="internalHint"
    :persistent-hint="persistentHint"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder"
    :autocomplete="props.autocomplete"
    :error="hasError"
    :error-messages="internalErrors"
    :success="props.success"
    :aria-labelledby="fieldContext?.ariaLabelledby.value"
    :aria-describedby="describedBy"
    :density="density"
    :hide-details="hideDetails"
    variant="outlined"
    @update:model-value="onUpdate"
    @blur="onBlur"
    @focus="onFocus"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { useFormField } from "./useFormField";

type ControlSize = "sm" | "md" | "lg";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: undefined,
  },
  rows: {
    type: Number,
    default: 4,
  },
  autoGrow: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: undefined,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessages: {
    type: [String, Array] as () => string | string[],
    default: () => [],
  },
  success: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as () => ControlSize,
    default: "md",
  },
});

const emit = defineEmits<{
  "update:modelValue": [string];
  blur: [FocusEvent];
  focus: [FocusEvent];
  change: [Event];
  input: [string];
}>();

const fieldContext = useFormField();
const uid = useId();

const controlId = computed(() => props.id ?? fieldContext?.id.value ?? `textarea-${uid}`);
const hasError = computed(() => props.error || fieldContext?.error.value);
const describedBy = computed(() => fieldContext?.ariaDescribedby.value);

const normalizedErrors = computed(() => {
  const value = props.errorMessages;
  if (!value) return [] as string[];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
});

const hideDetails = computed(() => Boolean(fieldContext));
const internalHint = computed(() => (fieldContext ? undefined : props.hint));
const internalErrors = computed(() => (fieldContext ? [] : normalizedErrors.value));
const persistentHint = computed(() => Boolean(internalHint.value));

const densityMap: Record<ControlSize, "comfortable" | "default" | "compact"> = {
  sm: "compact",
  md: "comfortable",
  lg: "default",
};

const density = computed(() => densityMap[props.size]);
const classes = computed(() => ["ui-textarea", `ui-textarea--${props.size}`]);

const inputAttrs = computed(() => ({
  required: props.required,
}));

function onUpdate(value: string) {
  emit("update:modelValue", value);
  emit("input", value);
}

function onBlur(event: FocusEvent) {
  emit("blur", event);
}

function onFocus(event: FocusEvent) {
  emit("focus", event);
}

function onChange(event: Event) {
  emit("change", event);
}
</script>

<style scoped>
.ui-textarea {
  --v-input-control-height: auto;
}

:deep(.v-field) {
  border-radius: var(--ui-radius);
}
</style>
