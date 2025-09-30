<template>
  <v-text-field
    :id="controlId"
    v-bind="inputAttrs"
    :class="classes"
    :model-value="props.modelValue"
    :type="type"
    :hint="internalHint"
    :persistent-hint="persistentHint"
    :prefix="prefix"
    :suffix="suffix"
    :clearable="clearable"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :autofocus="autofocus"
    :error="hasError"
    :error-messages="internalErrors"
    :success="success"
    :aria-labelledby="fieldContext?.ariaLabelledby.value"
    :aria-describedby="describedBy"
    :density="density"
    :hide-details="hideDetails"
    variant="outlined"
    @update:model-value="onUpdate"
    @blur="onBlur"
    @focus="onFocus"
    @change="onChange"
    @click:clear="onClear"
  >
    <template
      v-if="slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>
    <template
      v-if="slots.append"
      #append
    >
      <slot name="append" />
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { computed, useSlots, useId } from "vue";
import { useFormField } from "./useFormField";

type InputType = "text" | "password" | "email" | "number" | "search" | "url";
type ControlSize = "sm" | "md" | "lg";

const props = defineProps({
  modelValue: {
    type: [String, Number, null] as () => string | number | null,
    default: "",
  },
  id: {
    type: String,
    default: undefined,
  },
  type: {
    type: String as () => InputType,
    default: "text",
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: undefined,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  prefix: {
    type: String,
    default: undefined,
  },
  suffix: {
    type: String,
    default: undefined,
  },
  clearable: {
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
  "update:modelValue": [string | number | null];
  blur: [FocusEvent];
  focus: [FocusEvent];
  change: [Event];
  input: [string | number | null];
  clear: [];
}>();

const slots = useSlots();
const fieldContext = useFormField();
const uid = useId();

const hasError = computed(() => props.error || fieldContext?.error.value);
const controlId = computed(() => props.id ?? fieldContext?.id.value ?? `input-${uid}`);
const describedBy = computed(() => fieldContext?.ariaDescribedby.value);

const densityMap: Record<ControlSize, "comfortable" | "default" | "compact"> = {
  sm: "compact",
  md: "comfortable",
  lg: "default",
};

const density = computed(() => densityMap[props.size]);
const classes = computed(() => ["ui-input", `ui-input--${props.size}`]);

const normalizedErrors = computed(() => {
  const value = props.errorMessages;
  if (!value) return [] as string[];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
});

const hideDetails = computed(() => Boolean(fieldContext));
const internalHint = computed(() => (fieldContext ? undefined : props.hint));
const internalErrors = computed(() => (fieldContext ? [] : normalizedErrors.value));
const persistentHint = computed(() => Boolean(internalHint.value));

const inputAttrs = computed(() => ({
  required: props.required,
}));

function onUpdate(value: string | number | null) {
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

function onClear() {
  emit("clear");
  emit("update:modelValue", null);
}
</script>

<style scoped>
.ui-input {
  --v-input-control-height: auto;
}

.ui-input--sm {
  font-size: 0.8125rem;
}

.ui-input--md {
  font-size: 0.875rem;
}

.ui-input--lg {
  font-size: 1rem;
}

:deep(.v-field) {
  border-radius: var(--ui-radius);
}

:deep(.v-field__outline) {
  --v-field-border-width: 1px;
}

:deep(.v-field--focused) {
  box-shadow: var(--ui-focus);
}
</style>
