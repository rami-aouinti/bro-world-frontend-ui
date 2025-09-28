<template>
  <div
    :id="controlId"
    class="ui-radio-group"
    :class="[`ui-radio-group--${props.size}`, directionClass, { 'ui-radio-group--disabled': disabledState }]"
    role="radiogroup"
    :aria-labelledby="field?.ariaLabelledby.value"
    :aria-describedby="describedBy"
  >
    <template v-for="(option, index) in options" :key="option.value">
      <slot
        v-if="slots.option"
        name="option"
        :option="option"
        :checked="isChecked(option)"
        :select="() => selectOption(option)"
      />
      <button
        v-else
        :ref="(el) => setOptionRef(el, index)"
        type="button"
        class="ui-radio-group__option"
        :class="{ 'ui-radio-group__option--checked': isChecked(option), 'ui-radio-group__option--disabled': option.disabled }"
        role="radio"
        :aria-checked="isChecked(option)"
        :aria-disabled="option.disabled || undefined"
        :disabled="option.disabled || disabledState"
        :tabindex="getTabIndex(option, index)"
        :data-index="index"
        @click="() => selectOption(option)"
        @keydown="(event) => onKeydown(event, index)"
      >
        <span class="ui-radio-group__control" aria-hidden="true">
          <span class="ui-radio-group__dot" />
        </span>
        <span class="ui-radio-group__texts">
          <span class="ui-radio-group__label">{{ option.label }}</span>
          <span v-if="option.hint" class="ui-radio-group__option-hint">{{ option.hint }}</span>
        </span>
      </button>
    </template>
    <p v-if="showLocalHint" :id="hintId" class="ui-radio-group__hint">
      <slot name="hint">
        <span v-if="hint">{{ hint }}</span>
      </slot>
    </p>
    <ul v-if="showLocalErrors" :id="errorId" class="ui-radio-group__errors" role="list">
      <li v-for="message in normalizedErrors" :key="message" class="ui-radio-group__error-item">
        <span aria-hidden="true">!</span>
        <span>{{ message }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, useSlots } from 'vue'
import type { ComponentPublicInstance, VNodeChild } from 'vue'
import { useFormField } from './useFormField'

type OptionValue = string | number

interface RadioOption {
  label: string | VNodeChild
  value: OptionValue
  hint?: string
  disabled?: boolean
}

type Direction = 'horizontal' | 'vertical'
type ControlSize = 'sm' | 'md' | 'lg'

const props = defineProps({
  modelValue: {
    type: [String, Number] as () => OptionValue,
    default: undefined,
  },
  id: {
    type: String,
    default: undefined,
  },
  options: {
    type: Array as () => RadioOption[],
    default: () => [],
  },
  direction: {
    type: String as () => Direction,
    default: 'vertical',
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
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as () => ControlSize,
    default: 'md',
  },
})

const emit = defineEmits<{
  'update:modelValue': [OptionValue]
  change: [OptionValue]
}>()

const field = useFormField()
const slots = useSlots()
const uid = useId()

const optionRefs = ref<(HTMLElement | null)[]>([])

const controlId = computed(() => props.id ?? field?.id.value ?? `radio-group-${uid}`)
const directionClass = computed(() => `ui-radio-group--${props.direction}`)
const disabledState = computed(() => props.disabled)
const normalizedErrors = computed(() => {
  const value = props.errorMessages
  if (!value) return [] as string[]
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
})
const showErrors = computed(() => props.error || normalizedErrors.value.length > 0)
const showLocalHint = computed(() => !field && Boolean(slots.hint || props.hint))
const showLocalErrors = computed(() => !field && showErrors.value)
const hintId = computed(() => (showLocalHint.value ? `${controlId.value}-hint` : undefined))
const errorId = computed(() => (showLocalErrors.value ? `${controlId.value}-error` : undefined))
const describedBy = computed(() => {
  const ids = [field?.ariaDescribedby.value, hintId.value, errorId.value].filter(Boolean) as string[]
  return ids.length ? ids.join(' ') : undefined
})
const hint = computed(() => props.hint)
const currentIndex = computed(() => props.options.findIndex((option) => option.value === props.modelValue))
const firstEnabledIndex = computed(() => props.options.findIndex((option) => !option.disabled && !disabledState.value))

function setOptionRef(el: Element | ComponentPublicInstance | null, index: number) {
  optionRefs.value[index] = (el as HTMLElement | null) ?? null
}

function isChecked(option: RadioOption) {
  return option.value === props.modelValue
}

function getTabIndex(option: RadioOption, index: number) {
  if (option.disabled || disabledState.value) return -1
  if (isChecked(option)) return 0
  if (currentIndex.value === -1 && firstEnabledIndex.value === index) {
    return 0
  }
  return -1
}

function focusOption(index: number) {
  const el = optionRefs.value[index]
  el?.focus()
}

function findEnabledIndex(start: number, direction: 1 | -1) {
  const length = props.options.length
  let idx = start
  for (let i = 0; i < length; i++) {
    idx = (idx + direction + length) % length
    const option = props.options[idx]
    if (!option.disabled && !disabledState.value) {
      return idx
    }
  }
  return start
}

function selectOption(option: RadioOption) {
  if (option.disabled || disabledState.value) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

function onKeydown(event: KeyboardEvent, index: number) {
  const key = event.key
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    event.preventDefault()
    const nextIndex = findEnabledIndex(index, 1)
    const option = props.options[nextIndex]
    selectOption(option)
    focusOption(nextIndex)
  } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
    event.preventDefault()
    const prevIndex = findEnabledIndex(index, -1)
    const option = props.options[prevIndex]
    selectOption(option)
    focusOption(prevIndex)
  } else if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
    event.preventDefault()
    const option = props.options[index]
    selectOption(option)
  }
}
</script>

<style scoped>
.ui-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-2);
}

.ui-radio-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.ui-radio-group__option {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-spacing-2);
  padding: var(--ui-spacing-2) var(--ui-spacing-3);
  border: 1px solid rgba(var(--v-theme-outline), 0.4);
  border-radius: var(--ui-radius);
  background-color: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  text-align: start;
}

.ui-radio-group__option--checked {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.ui-radio-group__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-radio-group__control {
  width: var(--ui-spacing-4);
  height: var(--ui-spacing-4);
  border-radius: 9999px;
  border: 2px solid rgba(var(--v-theme-outline), 0.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ui-radio-group__option--checked .ui-radio-group__control {
  border-color: rgb(var(--v-theme-primary));
}

.ui-radio-group__dot {
  width: var(--ui-spacing-2);
  height: var(--ui-spacing-2);
  border-radius: 9999px;
  background-color: rgb(var(--v-theme-primary));
  transform: scale(0);
  transition: transform 0.15s ease;
}

.ui-radio-group__option--checked .ui-radio-group__dot {
  transform: scale(1);
}

.ui-radio-group__texts {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--ui-spacing-1) / 2);
}

.ui-radio-group__option-hint {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.ui-radio-group__hint {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.ui-radio-group__errors {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-1);
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
}
</style>
