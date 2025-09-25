<template>
  <div class="ui-form-field" :class="classes">
    <div v-if="hasLabel" class="ui-form-field__label-wrapper">
      <label :id="labelId" class="ui-form-field__label" :for="controlId">
        <slot name="label">
          <span>{{ label }}</span>
        </slot>
        <span v-if="required" class="ui-form-field__required" aria-hidden="true">*</span>
      </label>
    </div>

    <div class="ui-form-field__control">
      <slot />
    </div>

    <p v-if="hasHint" :id="hintId" class="ui-form-field__hint">
      <slot name="hint">{{ hintContent }}</slot>
    </p>

    <ul v-if="showErrors" :id="errorId" class="ui-form-field__errors" role="list">
      <slot name="error" :messages="normalizedErrors">
        <li v-for="message in normalizedErrors" :key="message" class="ui-form-field__error-item">
          <span class="ui-form-field__error-icon" aria-hidden="true">!</span>
          <span>{{ message }}</span>
        </li>
      </slot>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import type { VNodeChild } from 'vue'
import { provideFormField } from './useFormField'

const props = defineProps({
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
})

const slots = useSlots()
const uid = useId()

const normalizedErrors = computed(() => {
  const value = props.errorMessages
  if (!value) return [] as string[]
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
})

const showErrors = computed(() => props.error || normalizedErrors.value.length > 0)
const hintContent = computed(() => (slots.hint ? undefined : props.hint))
const controlId = computed(() => props.id ?? `field-${uid}`)
const labelId = computed(() => `${controlId.value}-label`)
const hasHint = computed(() => Boolean(slots.hint || props.hint))
const hintId = computed(() => (hasHint.value ? `${controlId.value}-hint` : undefined))
const errorId = computed(() => (showErrors.value ? `${controlId.value}-error` : undefined))
const hasLabel = computed(() => Boolean(slots.label || props.label))

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (showErrors.value && errorId.value) ids.push(errorId.value)
  if (hasHint.value && hintId.value) ids.push(hintId.value)
  return ids.length ? ids.join(' ') : undefined
})

provideFormField({
  id: controlId,
  ariaLabelledby: computed(() => (hasLabel.value ? labelId.value : undefined)),
  ariaDescribedby,
  required: computed(() => props.required),
  error: computed(() => showErrors.value),
})

const classes = computed(() => ({
  'ui-form-field--error': showErrors.value,
  'ui-form-field--required': props.required,
}))
</script>

<style scoped>
.ui-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  color: rgb(var(--v-theme-on-surface));
}

.ui-form-field__label-wrapper {
  display: flex;
}

.ui-form-field__label {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  color: rgb(var(--v-theme-on-surface));
}

.ui-form-field__required {
  margin-inline-start: 0.125rem;
  color: rgb(var(--v-theme-error));
}

.ui-form-field__hint {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.ui-form-field__errors {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}

.ui-form-field__error-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.ui-form-field__error-icon {
  font-weight: 700;
}
</style>
