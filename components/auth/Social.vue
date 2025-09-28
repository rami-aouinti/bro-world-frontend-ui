<template>
  <div class="auth-social text-center text-white px-6 pb-6">
    <p class="text-subtitle-1 font-weight-medium mb-2">
      {{ t('auth.socialTitle') }}
    </p>
    <p class="text-body-2 text-white text-opacity-80 mb-5">
      {{ t('auth.socialSubtitle') }}
    </p>

    <v-row class="justify-center align-center" dense>
      <v-col
          v-for="button in buttons"
          :key="button.provider"
          cols="auto"
          class="d-flex"
      >
        <v-btn
            variant="flat"
            class="font-weight-bold rounded-xl text-body-2"
            :loading="props.loading"
            :disabled="props.loading"
            @click="handleRedirect(button.provider)"
        >
          <Icon :name="button.icon" />
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SocialProvider } from '~/lib/auth/social'

const props = withDefaults(defineProps<{ loading?: boolean }>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'redirect', provider: SocialProvider): void
}>()

const { t } = useI18n()

const buttons = computed(() => [
  { provider: 'google', icon: 'mdi-google' },
  { provider: 'github', icon: 'mdi-github' },
  { provider: 'microsoft', icon: 'mdi-microsoft' },
] as const satisfies ReadonlyArray<{ provider: SocialProvider; icon: string }>)

function handleRedirect(provider: SocialProvider) {
  emit('redirect', provider)
}
</script>

<style scoped>
.auth-social {
  position: relative;
  z-index: 1;
}

.text-opacity-80 {
  opacity: 0.8;
}
</style>
