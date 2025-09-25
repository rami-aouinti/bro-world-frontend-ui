<template>
  <v-dialog
    v-model="model"
    :width="width"
    :aria-labelledby="titleId"
    aria-modal="true"
    class="ui-modal"
    @keydown.esc.prevent="handleEsc"
  >
    <v-card :elevation="0" class="ui-modal__card">
      <header v-if="hasTitle" :id="titleId" class="ui-modal__header">
        <slot name="title">
          <h2 class="ui-modal__title">
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
</template>

<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
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
const uniqueId = useId()
const hasTitleSlot = computed(() => Boolean(slots.title))
const hasTitle = computed(() => Boolean(props.title || hasTitleSlot.value))
const titleId = computed(() => (hasTitle.value ? `${uniqueId}-modal-title` : undefined))

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

function handleEsc() {
  close()
}
</script>

<style scoped>
.ui-modal__card {
  border-radius: var(--ui-radius, var(--v-border-radius-lg));
  overflow: hidden;
}

.ui-modal__header {
  padding: 24px 24px 0;
}

.ui-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ui-modal__body {
  padding: 24px;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.ui-modal__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px 24px;
}
</style>
