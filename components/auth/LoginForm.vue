<template>
  <form class="mx-auto max-w-xl" @submit.prevent="handleSubmit">
    <div class="card-padding">
      <v-alert
        v-if="sessionMessage"
        type="warning"
        variant="tonal"
        density="comfortable"
        border="start"
        class="mb-4"
        closable
        prominent
        role="status"
        @click:close="dismissSessionMessage"
      >
        {{ sessionMessage }}
      </v-alert>

      <IInput
        v-model="username"
        density="compact"
        rounded="xl"
        :label="t('auth.usernameOrEmail')"
        required
        class="font-size-input input-style"
        append-inner-icon="mdi-account"
        :disabled="loading"
        :error="Boolean(formError)"
        :class="fieldAlignment"
        @update:model-value="handleFieldInput"
      />
      <IInput
        v-model="password"
        density="compact"
        rounded="xl"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.password')"
        required
        class="font-size-input input-style"
        :class="fieldAlignment"
        :disabled="loading"
        :error="Boolean(formError)"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="togglePassword"
        @update:model-value="handleFieldInput"
      />

      <p v-if="formError" class="mt-1 text-red text-caption d-flex justify-center" role="alert">
        {{ formError }}
      </p>

      <div class="mt-2 mb-4" :class="isRtl ? 'text-start' : 'text-end'">
        <NuxtLink
          :to="localePath('/forgot-password')"
          class="text-primary text-decoration-none text-sm"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>
      <GradientButton
          :disabled="loading"
        type="submit"
        class="btn btn-outline-primary bg-primary rounded-xl text-decoration-none font-weight-bold text-uppercase py-2 px-6 me-2 mb-2 w-100"
      >
        <v-progress-circular v-if="loading" indeterminate size="20" />
        <span v-else :class="fieldAlignment">{{ t('auth.signIn') }}</span>
      </GradientButton >

      <p class="text-sm text-body mt-3 mb-0 d-flex justify-center" :class="fieldAlignment">
        {{ t('auth.signUpPrompt') }}
        <NuxtLink
          :to="localePath('/register')"
          class="text-primary text-decoration-none font-weight-bolder px-1"
          :class="fieldAlignment"
        >
          {{ t('auth.signUp') }}
        </NuxtLink>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#i18n'
import { useAuthSession } from '~/stores/auth-session'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const { $notify } = useNuxtApp()
const auth = useAuthSession()

const isRtl = computed(() => ['ar', 'he', 'fa', 'ur'].includes(locale.value))
const fieldAlignment = computed(() => (isRtl.value ? 'text-end' : 'text-start'))

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

const loading = computed(() => auth.isLoggingIn.value)
const sessionMessage = computed(() => auth.sessionMessage.value ?? '')

watch(
  () => auth.loginError.value,
  (message) => {
    if (message) {
      formError.value = message
    }
  },
)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function handleFieldInput() {
  if (formError.value) {
    formError.value = ''
  }

  auth.clearLoginError()
}

function dismissSessionMessage() {
  auth.setSessionMessage(null)
}

async function handleSubmit() {
  if (loading.value) {
    return
  }

  const identifier = username.value.trim()
  const secret = password.value

  formError.value = ''
  auth.clearLoginError()

  if (!identifier || !secret) {
    formError.value = t('auth.requiredError')
    return
  }

  try {
    const success = await auth.login({
      identifier,
      password: secret,
    })

    if (!success) {
      const message = auth.loginError.value ?? t('auth.invalidError')
      formError.value = message
      $notify({
        type: 'error',
        title: t('auth.errorTitle'),
        message,
        timeout: null,
      })

      return
    }

    auth.setSessionMessage(null)

    const redirectFromQuery = typeof route.query.redirect === 'string' ? route.query.redirect : null
    const redirectTarget = redirectFromQuery || auth.consumeRedirect() || localePath('/')

    $notify({
      type: 'success',
      title: t('auth.successTitle'),
      message: t('auth.success'),
    })

    await router.push(redirectTarget)
  } catch (exception: unknown) {
    const message = t('auth.errorGeneric')
    formError.value = message
    $notify({
      type: 'error',
      title: t('auth.errorTitle'),
      message,
      timeout: null,
    })
  }
}
</script>
