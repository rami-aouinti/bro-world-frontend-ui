<template>
  <div :class="classes">
    <v-switch
      :id="controlId"
      :model-value="props.modelValue"
      :disabled="props.disabled"
      :error="hasError"
      :aria-describedby="describedBy"
      :aria-labelledby="labelId"
      :hide-details="true"
      color="primary"
      role="switch"
      @update:model-value="onUpdate"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    >
      <template #label>
        <label :id="labelId" class="ui-switch__label" :for="controlId">
          <slot name="label">
            <span v-if="props.label">{{ props.label }}</span>
          </slot>
          <span v-if="isRequired" class="ui-switch__required" aria-hidden="true">*</span>
        </label>
      </template>
    </v-switch>
    <p v-if="hasHint" :id="hintId" class="ui-switch__hint">
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

type SwitchValue = boolean

const props = defineProps({
  modelValue: {
    type: Boolean as () => SwitchValue,
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
  'update:modelValue': [SwitchValue]
  change: [SwitchValue]
  focus: [FocusEvent]
  blur: [FocusEvent]
}>()

const slots = useSlots()
const field = useFormField()
const uid = useId()

const controlId = computed(() => props.id ?? field?.id.value ?? `switch-${uid}`)
const labelId = computed(() => `${controlId.value}-label`)
const hasHint = computed(() => Boolean(slots.hint || props.hint))
const hintId = computed(() => (hasHint.value ? `${controlId.value}-hint` : undefined))
const hasError = computed(() => props.error || field?.error.value)
const isRequired = computed(() => props.required || field?.required.value)
const describedBy = computed(() => {
  const ids = [field?.ariaDescribedby.value, hintId.value].filter(Boolean) as string[]
  return ids.length ? ids.join(' ') : undefined
})

const classes = computed(() => [
  'ui-switch',
  {
    'ui-switch--error': hasError.value,
    'ui-switch--disabled': props.disabled,
  },
])

function onUpdate(value: SwitchValue) {
  emit('update:modelValue', value)
}

function onChange(value: SwitchValue) {
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
.ui-switch {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ui-switch__label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.ui-switch__hint {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.ui-switch__required {
  color: rgb(var(--v-theme-error));
}
</style>
