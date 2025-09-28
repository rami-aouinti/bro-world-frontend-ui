<template>
  <div class="ui-modal-container" :aria-labelledby="titleId" aria-modal="true">
    <v-dialog
      v-model="model"
      :width="width"
      :aria-labelledby="titleId"
      aria-modal="true"
      class="ui-modal"
      :data-modal-instance="instanceId"
      @keydown="handleDialogKeydown"
    >
    <v-card :elevation="0" class="ui-modal__card">
      <header v-if="hasTitle" class="ui-modal__header">
        <slot name="title" :title-id="titleId">
          <h2 :id="titleId" class="ui-modal__title">
            {{ title }}
          </h2>
        </slot>
      </header>

      <section class="ui-modal__body">
        <slot />
      </section>

      <footer class="ui-modal__footer">
        <slot name="footer">
          <v-spacer />
          <BaseButton variant="text" @click="close">
            Close
          </BaseButton>
          <BaseButton
            v-if="!hidePrimary"
            :loading="loading"
            :disabled="disabled"
            @click="emitPrimary"
          >
            {{ primaryText }}
          </BaseButton>
        </slot>
      </footer>
    </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useSlots, watch } from 'vue'
import BaseButton from './BaseButton.vue'

type PrimaryLabel = 'Save' | 'Update'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  primaryLabel: {
    type: String as () => PrimaryLabel,
    default: 'Save',
  },
  hidePrimary: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [Number, String],
    default: 520,
  },
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  primary: []
  close: []
}>()

const slots = useSlots()
const instanceId = `base-modal-${Math.random().toString(36).slice(2, 10)}`
let dialogElement: HTMLElement | null = null

const hasTitleSlot = computed(() => Boolean(slots.title))
const hasTitle = computed(() => Boolean(props.title || hasTitleSlot.value))
const titleId = computed(() => (hasTitle.value ? `${instanceId}-title` : undefined))

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  },
})

const primaryText = computed(() => props.primaryLabel ?? 'Save')

function emitPrimary() {
  emit('primary')
}

function close() {
  if (!props.modelValue) return
  emit('update:modelValue', false)
  emit('close')
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

function detachDialogListeners() {
  if (dialogElement) {
    dialogElement.removeEventListener('keydown', handleDialogKeydown)
    dialogElement = null
  }
}

function updateAriaLabelledby(value: string | undefined) {
  if (!dialogElement) {
    return
  }

  if (value) {
    dialogElement.setAttribute('aria-labelledby', value)
  } else {
    dialogElement.removeAttribute('aria-labelledby')
  }
}

function resolveDialogElement() {
  if (typeof document === 'undefined') {
    return null
  }

  return document.querySelector<HTMLElement>(`[data-modal-instance="${instanceId}"]`)
}

function attachDialogListeners() {
  const element = resolveDialogElement()

  if (!element || element === dialogElement) {
    return
  }

  detachDialogListeners()
  dialogElement = element
  dialogElement.addEventListener('keydown', handleDialogKeydown)
  updateAriaLabelledby(titleId.value)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalKeydown)
  }

  if (props.modelValue) {
    nextTick(() => {
      attachDialogListeners()
    })
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }

  detachDialogListeners()
})

watch(
  () => titleId.value,
  (value) => {
    updateAriaLabelledby(value)
  },
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      detachDialogListeners()
      return
    }

    nextTick(() => {
      attachDialogListeners()
    })
  },
  { immediate: true },
)
</script>

<style scoped>
.ui-modal__card {
  border-radius: var(--ui-radius-lg);
  overflow: hidden;
}

.ui-modal__header {
  padding: var(--ui-spacing-6) var(--ui-spacing-6) 0;
}

.ui-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ui-modal__body {
  padding: var(--ui-spacing-6);
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.ui-modal__footer {
  display: flex;
  align-items: center;
  gap: var(--ui-spacing-3);
  padding: var(--ui-spacing-4) var(--ui-spacing-6) var(--ui-spacing-6);
}
</style>
