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

  <!-- Modal: Créer un post -->
  <v-dialog v-model="dialog" max-width="680" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-semibold">{{ dialogTitle }}</span>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog()">
          <Icon name="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Entête auteur + audience -->
        <div class="d-flex align-start ga-3 mb-2">
          <v-avatar size="40">
            <v-img :src="avatar" alt="Avatar" />
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="text-subtitle-2 font-weight-medium">{{ userName }}</div>

            <v-menu>
              <template #activator="{ props: p }">
                <v-btn
                    v-bind="p"
                    size="small"
                    variant="tonal"
                    rounded="pill"
                    prepend-icon="mdi-account-multiple"
                    class="text-capitalize"
                >
                  <Icon name="mdi-account-multiple" class="me-2" />
                  {{ audienceLabel }}
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item v-for="opt in audienceOptions" :key="opt.value" @click="audience = opt.value">
                  <template #prepend><Icon :name="opt.icon" class="mr-2" /></template>
                  <v-list-item-title>{{ opt.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- Zone de saisie -->
        <v-textarea
            v-model="message"
            variant="plain"
            auto-grow
            :rows="5"
            class="text-body-1"
            :placeholder="placeholderText"
        />

        <div class="d-flex justify-end text-caption text-medium-emphasis">
          {{ message.length }}/{{ maxLength }}
        </div>
        <v-card
            variant="outlined"
            class="rounded-xl my-2"
        >
          <div class="d-flex align-center justify-space-between px-3 py-2">
            <div class="text-medium-emphasis text-body-2">{{ addToPostLabel }}</div>
            <div class="d-flex ga-1">
              <v-btn icon variant="text" :title="attachmentLabels.media" @click="onAttach('media')">
                <Icon name="mdi-image-multiple" />
              </v-btn>
              <v-btn icon variant="text" :title="attachmentLabels.tag" @click="onAttach('tag')">
                <Icon name="mdi-account-plus-outline" />
              </v-btn>
              <v-btn icon variant="text" :title="attachmentLabels.feeling" @click="onAttach('feeling')">
                <Icon name="mdi-emoticon-happy-outline" />
              </v-btn>
              <v-btn icon variant="text" :title="attachmentLabels.location" @click="onAttach('location')">
                <Icon name="mdi-map-marker" />
              </v-btn>
              <v-btn icon variant="text" :title="attachmentLabels.gif" @click="onAttach('gif')">
                <Icon name="mdi-gif" />
              </v-btn>
              <v-menu>
                <template #activator="{ props: p }">
                  <v-btn icon variant="text" v-bind="p"><v-icon icon="mdi-dots-horizontal" /></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item :title="attachmentLabels.poll" @click="onAttach('poll')" />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-2 pb-2">
        <v-btn block color="primary" :disabled="!canPost" @click="submitPost">
          {{ postButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n, useNuxtApp } from '#imports'
import { useAuthStore } from '~/composables/useAuthStore'

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
const message = ref('')
const audience = ref<'friends' | 'public' | 'private'>('friends')

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
const audienceOptions = computed(() => [
  { value: 'public', label: t('blog.newPost.audience.public'), icon: 'mdi-earth' },
  { value: 'friends', label: t('blog.newPost.audience.friends'), icon: 'mdi-account-multiple' },
  { value: 'private', label: t('blog.newPost.audience.private'), icon: 'mdi-lock' },
])
const attachmentLabels = computed(() => ({
  media: t('blog.newPost.attachments.media'),
  tag: t('blog.newPost.attachments.tag'),
  feeling: t('blog.newPost.attachments.feeling'),
  location: t('blog.newPost.attachments.location'),
  gif: t('blog.newPost.attachments.gif'),
  poll: t('blog.newPost.attachments.poll'),
}))
const dialogTitle = computed(() => t('blog.newPost.dialog.title'))
const addToPostLabel = computed(() => t('blog.newPost.dialog.addToPost'))
const postButtonLabel = computed(() => t('blog.newPost.dialog.postButton'))
const loginToPostMessage = computed(() => t('blog.auth.postRequired'))

const audienceLabel = computed(() => audienceOptions.value.find(a => a.value === audience.value)?.label ?? audienceOptions.value[0]?.label ?? '')
const maxLength = computed(() => props.maxLength)
const canPost = computed(() => isAuthenticated.value && message.value.trim().length > 0 && message.value.length <= maxLength.value)

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
function closeDialog() {
  dialog.value = false
  emit('close')
}
function onAttach(type: string) {
  emit('attach', type)
}
function submitPost() {
  if (!isAuthenticated.value) {
    $notify({
      type: 'info',
      title: t('blog.newPost.dialog.title'),
      message: loginToPostMessage.value,
    })
    return
  }

  if (!canPost.value) return
  emit('submit', { text: message.value.trim(), audience: audience.value })
  // ici tu peux réinitialiser/fermer
  message.value = ''
  closeDialog()
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
