<template>
  <div class="login-page">
    <div class="login-card" :class="{ 'login-card--loading': isRedirecting }">
      <span class="login-card__glow" />
      <div class="login-card__header">
        <h1 class="login-card__title">Bro World</h1>
        <p class="login-card__subtitle">{{ t('auth.socialSubtitle') }}</p>
        <AuthSocial
          class="login-card__socials"
          :loading="isRedirecting"
          @redirect="handleSocialRedirect"
        />
      </div>

      <div class="login-card__form">
        <AuthLoginForm :disabled="isRedirecting" />
      </div>

      <transition name="login-card__overlay-fade">
        <div v-if="isRedirecting" class="login-card__overlay">
          <v-progress-circular indeterminate color="primary" size="64" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AuthLoginForm from '~/components/auth/LoginForm.vue'
import AuthSocial from '~/components/auth/Social.vue'
import { resolveSocialRedirect, type SocialProvider } from '~/lib/auth/social'

definePageMeta({
  title: 'login',
  layout: 'auth',
  breadcrumb: 'disabled',
})

const { t } = useI18n()
const isRedirecting = ref(false)

function handleSocialRedirect(provider: SocialProvider) {
  const target = resolveSocialRedirect(provider)

  if (!target) return

  isRedirecting.value = true

  if (import.meta.client) {
    window.location.href = target
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: clamp(1.5rem, 3vw, 3rem);
}

.login-card {
  position: relative;
  width: min(100%, 420px);
  border-radius: 28px;
  padding: clamp(2.25rem, 4vw, 2.75rem) clamp(1.75rem, 4vw, 2.5rem) clamp(2.5rem, 4vw, 3rem);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.96));
  box-shadow: 0 28px 60px rgba(236, 72, 153, 0.25), 0 18px 40px rgba(30, 41, 59, 0.12);
  overflow: hidden;
}

.login-card--loading {
  pointer-events: none;
}

.login-card__glow {
  position: absolute;
  inset: -35% auto auto -35%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle at center, rgba(236, 72, 153, 0.35), transparent 70%);
  filter: blur(0);
  z-index: 0;
}

.login-card__header {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-card__title {
  font-size: clamp(2rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgb(15, 23, 42);
  margin: 0;
}

.login-card__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(71, 85, 105, 0.75);
}

.login-card__socials {
  margin-top: 0.5rem;
}

.login-card__form {
  position: relative;
  z-index: 1;
  margin-top: clamp(1.75rem, 4vw, 2.25rem);
}

.login-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.68);
  z-index: 5;
}

.login-card__overlay-fade-enter-active,
.login-card__overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.login-card__overlay-fade-enter-from,
.login-card__overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .login-card {
    width: 100%;
    padding-inline: clamp(1.25rem, 4vw, 1.75rem);
  }
}
</style>
