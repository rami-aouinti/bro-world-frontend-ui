<template>
  <div :class="classes">
    <v-checkbox
      :id="controlId"
      :model-value="props.modelValue"
      :disabled="props.disabled"
      :error="hasError"
      :indeterminate="indeterminate"
      :aria-describedby="describedBy"
      :aria-labelledby="labelId"
      :hide-details="true"
      color="primary"
      @update:model-value="onUpdate"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    >
      <template #label>
        <label :id="labelId" class="ui-checkbox__label" :for="controlId">
          <slot name="label">
            <span v-if="props.label">{{ props.label }}</span>
          </slot>
          <span v-if="isRequired" class="ui-checkbox__required" aria-hidden="true">*</span>
        </label>
      </template>
    </v-checkbox>
    <p v-if="hasHint" :id="hintId" class="ui-checkbox__hint">
      <slot name="hint">
        <span v-if="props.hint">{{ props.hint }}</span>
      </slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import type { VNodeChild } from 'vue'
import { useFormField } from './useFormField'

type CheckboxValue = boolean

const props = defineProps({
  modelValue: {
    type: Boolean as () => CheckboxValue,
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  },
  label: {
    type: [String, Object] as () => string | VNodeChild,
    default: undefined,
  },
  hint: {
    type: [String, Object] as () => string | VNodeChild,
    default: undefined,
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  'update:modelValue': [CheckboxValue]
  change: [CheckboxValue]
  focus: [FocusEvent]
  blur: [FocusEvent]
}>()

const slots = useSlots()
const field = useFormField()
const uid = useId()

const controlId = computed(() => props.id ?? field?.id.value ?? `checkbox-${uid}`)
const labelId = computed(() => `${controlId.value}-label`)
const hasHint = computed(() => Boolean(slots.hint || props.hint))
const hintId = computed(() => (hasHint.value ? `${controlId.value}-hint` : undefined))
const hasError = computed(() => props.error || field?.error.value)
const isRequired = computed(() => props.required || field?.required.value)
const describedBy = computed(() => {
  const ids = [field?.ariaDescribedby.value, hintId.value].filter(Boolean) as string[]
  return ids.length ? ids.join(' ') : undefined
})
const indeterminate = computed(() => props.indeterminate)

const classes = computed(() => [
  'ui-checkbox',
  {
    'ui-checkbox--error': hasError.value,
    'ui-checkbox--disabled': props.disabled,
  },
])

function onUpdate(value: CheckboxValue) {
  emit('update:modelValue', value)
}

function onChange(value: CheckboxValue) {
  emit('change', value)
}

function onFocus(event: FocusEvent) {
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<style scoped>
.ui-checkbox {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ui-checkbox__label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.ui-checkbox__hint {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.ui-checkbox__required {
  color: rgb(var(--v-theme-error));
}
</style>
