<template>
  <form class="mx-auto max-w-xl" @submit.prevent="handleSubmit">
    <div class="card-padding">
      <v-text-field
        v-model="username"
        density="compact"
        rounded="xl"
        :label="t('auth.usernameOrEmail')"
        required
        class="font-size-input input-style"
        append-inner-icon="mdi-account"
        :disabled="loading"
        :error="Boolean(error)"
        :class="fieldAlignment"
      />
      <v-text-field
        v-model="password"
        density="compact"
        rounded="xl"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.password')"
        required
        class="font-size-input input-style"
        :class="fieldAlignment"
        :disabled="loading"
        :error="Boolean(error)"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="togglePassword"
      />

      <p v-if="error" class="mt-1 text-red text-caption d-flex justify-center">
        {{ error }}
      </p>

      <div class="mt-2 mb-4" :class="isRtl ? 'text-start' : 'text-end'">
        <NuxtLink
          :to="localePath('/forgot-password')"
          class="text-primary text-decoration-none text-sm"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <button
        :disabled="loading"
        type="submit"
        class="btn btn-outline-primary bg-primary rounded-xl text-decoration-none font-weight-bold text-uppercase py-2 px-6 me-2 mb-2 w-100"
      >
        <v-progress-circular v-if="loading" indeterminate size="20" />
        <span v-else :class="fieldAlignment">{{ t('auth.signIn') }}</span>
      </button>

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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#i18n'

import { toast } from '~/components/content/common/toast'

const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const isRtl = computed(() => ['ar', 'he', 'fa', 'ur'].includes(locale.value))
const fieldAlignment = computed(() => (isRtl.value ? 'text-end' : 'text-start'))

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleSubmit() {
  if (loading.value) return

  loading.value = true
  error.value = ''

  if (!username.value || !password.value) {
    error.value = t('auth.requiredError')
    loading.value = false
    return
  }

  try {
    const { data, error: fetchError } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
      },
    })

    if (fetchError.value) {
      error.value = fetchError.value.data?.message ?? t('auth.invalidError')
      return
    }

    if (data.value) {
      toast({
        title: t('auth.successTitle'),
        description: t('auth.success'),
      })
      const homePath = localePath('/')
      await router.push(homePath)
    }
  } catch (exception) {
    console.error('Login failed', exception)
    error.value = t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>
