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
          @click="openDialog()"
      >
        {{ placeholder }}
      </v-btn>
    </div>

    <v-divider class="my-2" />

    <!-- Actions rapides (non obligatoires) -->
    <div class="d-flex ga-4 flex-wrap justify-center">
      <v-btn variant="text" color="primary" prepend-icon="mdi-video" @click="openDialog()">
        <Icon name="mdi:video" class="mr-2" />
        Live-Video
      </v-btn>
      <v-btn variant="text" color="secondary" prepend-icon="mdi-image-multiple" @click="openDialog()">
        <Icon name="mdi:image-multiple" class="mr-2" />
        Foto/Video</v-btn>
      <v-btn variant="text" color="default" prepend-icon="mdi-emoticon-happy-outline" @click="openDialog()">
        <Icon name="mdi:emoticon-happy-outline" class="mr-2" />
        Gefühl/Aktivität
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
        <span class="text-h6 font-weight-semibold">Beitrag erstellen</span>
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
            :placeholder="placeholder"
        />

        <div class="d-flex justify-end text-caption text-medium-emphasis">
          {{ message.length }}/{{ maxLength }}
        </div>
        <v-card
            variant="outlined"
            class="rounded-xl my-2"
        >
          <div class="d-flex align-center justify-space-between px-3 py-2">
            <div class="text-medium-emphasis text-body-2">Füge noch etwas zu deinem Beitrag hinzu</div>
            <div class="d-flex ga-1">
              <v-btn icon variant="text" :title="'Foto/Video'" @click="onAttach('media')">
                <Icon name="mdi-image-multiple" />
              </v-btn>
              <v-btn icon variant="text" :title="'Person markieren'" @click="onAttach('tag')">
                <Icon name="mdi-account-plus-outline" />
              </v-btn>
              <v-btn icon variant="text" :title="'Gefühl/Aktivität'" @click="onAttach('feeling')">
                <Icon name="mdi-emoticon-happy-outline" />
              </v-btn>
              <v-btn icon variant="text" :title="'Standort'" @click="onAttach('location')">
                <Icon name="mdi-map-marker" />
              </v-btn>
              <v-btn icon variant="text" :title="'GIF'" @click="onAttach('gif')">
                <Icon name="mdi-gif" />
              </v-btn>
              <v-menu>
                <template #activator="{ props: p }">
                  <v-btn icon variant="text" v-bind="p"><v-icon icon="mdi-dots-horizontal" /></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item title="Umfrage hinzufügen" @click="onAttach('poll')" />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-2 pb-2">
        <v-btn block color="primary" :disabled="!canPost" @click="submitPost">
          Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  userName?: string
  avatar?: string
  placeholder?: string
  maxLength?: number
}
const props = withDefaults(defineProps<Props>(), {
  userName: 'Rami Aouinti',
  avatar: '/avatar.png', // remplace par ton URL
  placeholder: 'Was machst du gerade, Rami?',
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

const audienceOptions = [
  { value: 'public', label: 'Öffentlich', icon: 'mdi-earth' },
  { value: 'friends', label: 'Freunde', icon: 'mdi-account-multiple' },
  { value: 'private', label: 'Nur ich', icon: 'mdi-lock' },
]
const audienceLabel = computed(() => audienceOptions.find(a => a.value === audience.value)?.label ?? 'Freunde')
const maxLength = computed(() => props.maxLength)
const canPost = computed(() => message.value.trim().length > 0 && message.value.length <= maxLength.value)

function openDialog() {
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
