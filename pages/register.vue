<template>
  <v-card
    :loading="isRedirecting"
    class="auth-card border-radius-xl overflow-visible"
    rounded="xl"
    elevation="24"
  >
    <v-sheet
      class="mx-auto"
      elevation="12"
      max-width="calc(100% - 32px)"
      rounded="lg"
      color="primary"
      style="z-index: 2; top: -44px; position: relative"
    >
      <div class="py-4 text-center">
        <div class="text-h4 font-weight-bold text-white">Bro World</div>
      </div>
      <AuthSocial
        :loading="isRedirecting"
        @redirect="handleSocialRedirect"
      />
    </v-sheet>

    <div class="pa-6">
      <v-progress-circular
        v-if="isRedirecting"
        indeterminate
        color="primary"
        size="80"
        class="mx-auto d-block"
      />
      <div
        v-else
        class="auth-card__form"
      >
        <AuthRegisterForm />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

import AuthRegisterForm from "~/components/auth/RegisterForm.vue";
import AuthSocial from "~/components/auth/Social.vue";
import { resolveSocialRedirect, type SocialProvider } from "~/lib/auth/social";

definePageMeta({
  title: "register",
  layout: "auth",
  breadcrumb: "disabled",
  documentDriven: false,
});

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

<style scoped src="~/assets/styles/pages/register.scss" lang="scss"></style>
