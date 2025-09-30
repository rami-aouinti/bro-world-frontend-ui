<template>
  <v-select
    :id="controlId"
    v-bind="selectAttrs"
    :class="classes"
    :model-value="props.modelValue"
    :items="computedItems"
    :multiple="multiple"
    :clearable="clearable"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="props.placeholder"
    :error="hasError"
    :error-messages="internalErrors"
    :hint="internalHint"
    :persistent-hint="persistentHint"
    :hide-details="hideDetails"
    :aria-labelledby="field?.ariaLabelledby.value"
    :aria-describedby="describedBy"
    :density="density"
    variant="outlined"
    @update:model-value="onUpdate"
    @change="onChange"
    @blur="onBlur"
    @focus="onFocus"
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
  </v-select>
</template>

<script setup lang="ts">
import { computed, useId, useSlots } from "vue";
import type { VNodeChild } from "vue";
import { useFormField } from "./useFormField";

type OptionValue = string | number;

type ControlSize = "sm" | "md" | "lg";

interface SelectItem {
  label: string | VNodeChild;
  value: OptionValue;
  disabled?: boolean;
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, null] as () => OptionValue | OptionValue[] | null,
    default: undefined,
  },
  id: {
    type: String,
    default: undefined,
  },
  items: {
    type: Array as () => SelectItem[],
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
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
  "update:modelValue": [OptionValue | OptionValue[] | null];
  change: [OptionValue | OptionValue[] | null];
  blur: [FocusEvent];
  focus: [FocusEvent];
  clear: [];
}>();

const slots = useSlots();
const field = useFormField();
const uid = useId();

const controlId = computed(() => props.id ?? field?.id.value ?? `select-${uid}`);
const hasError = computed(() => props.error || field?.error.value);
const describedBy = computed(() => field?.ariaDescribedby.value);

const normalizedErrors = computed(() => {
  const value = props.errorMessages;
  if (!value) return [] as string[];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
});

const hideDetails = computed(() => Boolean(field));
const internalHint = computed(() => (field ? undefined : props.hint));
const internalErrors = computed(() => (field ? [] : normalizedErrors.value));
const persistentHint = computed(() => Boolean(internalHint.value));

const computedItems = computed(() =>
  props.items.map((item) => ({
    value: item.value,
    title: item.label,
    disabled: item.disabled,
  })),
);

const densityMap: Record<ControlSize, "comfortable" | "default" | "compact"> = {
  sm: "compact",
  md: "comfortable",
  lg: "default",
};

const density = computed(() => densityMap[props.size]);
const classes = computed(() => ["ui-select", `ui-select--${props.size}`]);
const multiple = computed(() => props.multiple);
const clearable = computed(() => props.clearable);
const disabled = computed(() => props.disabled);
const readonly = computed(() => props.readonly);

const selectAttrs = computed(() => ({
  required: props.required,
}));

function onUpdate(value: OptionValue | OptionValue[] | null) {
  emit("update:modelValue", value);
}

function onChange(value: OptionValue | OptionValue[] | null) {
  emit("change", value);
}

function onBlur(event: FocusEvent) {
  emit("blur", event);
}

function onFocus(event: FocusEvent) {
  emit("focus", event);
}

function onClear() {
  emit("clear");
  if (props.multiple) {
    emit("update:modelValue", []);
  } else {
    emit("update:modelValue", null);
  }
}
</script>

<style scoped>
.ui-select {
  --v-input-control-height: auto;
}

:deep(.v-field) {
  border-radius: var(--ui-radius);
}
</style>
