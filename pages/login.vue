<template>
  <div class="login-page">
    <div
      :class="{ 'login-card--loading': isRedirecting }"
    >
      <SidebarCard
          aria-live="polite"
          class="text-card-foreground px-3 py-2"
          glow>
        <header class="text-card-foreground">
      <span class="login-card__glow" />
      <div class="login-card__header">
        <h1 class="login-card__title text-foreground">Bro World</h1>
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
        <div
            v-if="isRedirecting"
            class="login-card__overlay"
        >
          <v-progress-circular
              indeterminate
              color="primary"
              size="64"
          />
        </div>
      </transition>
        </header>
      </SidebarCard>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { resolveSocialRedirect, type SocialProvider } from "~/lib/auth/social";

const AuthLoginForm = defineAsyncComponent({
  loader: () => import("~/components/auth/LoginForm.vue"),
  suspensible: false,
});
const AuthSocial = defineAsyncComponent({
  loader: () => import("~/components/auth/Social.vue"),
  suspensible: false,
});

definePageMeta({
  title: "login",
  layout: "auth",
  breadcrumb: "disabled",
  documentDriven: false,
});

const { t } = useI18n();
const isRedirecting = ref(false);

function handleSocialRedirect(provider: SocialProvider) {
  const target = resolveSocialRedirect(provider);

  if (!target) return;

  isRedirecting.value = true;

  if (import.meta.client) {
    window.location.href = target;
  }
}
</script>

<style scoped src="~/assets/styles/pages/login.scss" lang="scss"></style>
