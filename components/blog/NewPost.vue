<template>
  <!-- Barre compacte -->
  <v-card class="px-4 py-3 my-4 rounded-xl" elevation="0" border style="background: transparent;">
    <div class="d-flex align-center ga-3">
      <v-avatar size="44">
        <v-img :src="avatar" alt="Avatar" />
      </v-avatar>

      <!-- Champ pilule qui ouvre le modal -->
      <v-btn
          class="flex-1 justify-start text-body-2 text-medium-emphasis composer-pill"
          variant="flat"
          height="44"
          rounded="pill"
          :ripple="false"
          :disabled="!isAuthenticated"
          data-test="new-post-trigger"
          @click="openDialog()"
      >
        {{ placeholderText }}
      </v-btn>
    </div>

    <v-alert
        v-if="!isAuthenticated"
        class="mt-3"
        type="info"
        density="compact"
        border="start"
        variant="tonal"
    >
      {{ loginToPostMessage }}
    </v-alert>

    <v-divider class="my-2" />

    <!-- Actions rapides (non obligatoires) -->
    <div class="d-flex ga-4 flex-wrap justify-center">
      <v-btn
          v-for="action in quickActions"
          :key="action.key"
          variant="text"
          :color="action.color"
          :disabled="!isAuthenticated"
          @click="openDialog()"
      >
        <Icon :name="action.icon" class="mr-2" />
        {{ action.label }}
      </v-btn>
    </div>
    <BorderBeam
        :size="150"
        :duration="8"
        :delay="10"
        :border-width="2"
    />
  </v-card>

  <Suspense v-if="dialog && isAuthenticated">
    <template #default>
      <NewPostDialog
          v-model:open="dialog"
          :avatar="avatar"
          :user-name="userName"
          :placeholder="placeholderText"
          :max-length="maxLength"
          @submit="handleDialogSubmit"
          @close="handleDialogClose"
          @attach="handleAttach"
      />
    </template>
    <template #fallback>
      <div class="d-flex align-center justify-center py-8" data-test="new-post-dialog-loading">
        <v-progress-circular indeterminate color="primary" />
      </div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n, useNuxtApp } from '#imports'
import { useAuthStore } from '~/composables/useAuthStore'
import { defineAsyncComponentWithVendorStyles } from '~/lib/material-dashboard-vendors'

const NewPostDialog = defineAsyncComponentWithVendorStyles(() => import('./NewPostDialog.vue'))

interface Props {
  userName?: string
  avatar?: string
  placeholder?: string
  maxLength?: number
}
const props = withDefaults(defineProps<Props>(), {
  userName: 'Rami Aouinti',
  avatar: '/avatar.png', // remplace par ton URL
  placeholder: undefined,
  maxLength: 5000,
})

const emit = defineEmits<{
  (e: 'submit', payload: { text: string; audience: string }): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'attach', type: string): void
}>()

const dialog = ref(false)
const { t } = useI18n()
const { $notify } = useNuxtApp()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated.value)

const placeholderText = computed(() => props.placeholder ?? t('blog.newPost.placeholder', { name: props.userName }))
const quickActions = computed(() => [
  { key: 'liveVideo', label: t('blog.newPost.quickActions.liveVideo'), icon: 'mdi:video', color: 'primary' },
  { key: 'photoVideo', label: t('blog.newPost.quickActions.photoVideo'), icon: 'mdi:image-multiple', color: 'secondary' },
  { key: 'feelingActivity', label: t('blog.newPost.quickActions.feelingActivity'), icon: 'mdi:emoticon-happy-outline', color: 'default' },
])
const loginToPostMessage = computed(() => t('blog.auth.postRequired'))

const maxLength = computed(() => props.maxLength)

function openDialog() {
  if (!isAuthenticated.value) {
    $notify({
      type: 'info',
      title: t('blog.newPost.dialog.title'),
      message: loginToPostMessage.value,
    })
    return
  }

  dialog.value = true
  emit('open')
}
function handleDialogSubmit(payload: { text: string; audience: string }) {
  emit('submit', payload)
}
function handleDialogClose() {
  emit('close')
}
function handleAttach(type: string) {
  emit('attach', type)
}
</script>

<style scoped>
.composer-pill {
  background: rgb(var(--v-theme-surface-variant), 0.6);
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 9999px;
  padding-inline: 16px;
}
.v-theme--dark .composer-pill {
  background: rgba(255,255,255,.06);
  border-color: rgba(255,255,255,.12);
}
</style>
