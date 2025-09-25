<template>
  <BaseModal
    v-model="model"
    :title="title"
    @primary="handleConfirm"
    @close="handleModalClose"
  >
    <p class="delete-modal__message">
      {{ messageText }}
    </p>

    <template #footer>
      <v-spacer />
      <BaseButton variant="text" @click="handleCancel">
        Cancel
      </BaseButton>
      <BaseButton color="error" @click="handleConfirm">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Delete item',
  },
  message: {
    type: String,
    default: undefined,
  },
  confirmLabel: {
    type: String,
    default: 'Delete',
  },
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: []
  cancel: []
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const messageText = computed(() => props.message ?? 'This action cannot be undone.')

function handleConfirm() {
  emit('confirm')
}

function handleCancel(shouldUpdate = true) {
  if (shouldUpdate && model.value) {
    emit('update:modelValue', false)
  }
  emit('cancel')
}

function handleModalClose() {
  handleCancel(false)
}
</script>

<style scoped>
.delete-modal__message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}
</style>
