<template>
  <div class="login-page">
    <div class="login-page__glow login-page__glow--top" />
    <div class="login-page__glow login-page__glow--bottom" />

    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12">
          <v-card
            :loading="isRedirecting"
            class="auth-card border-radius-xl overflow-visible"
            rounded="xl"
            elevation="24"
          >
            <v-sheet
              class="mx-auto login-brand"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
              color="primary"
            >
              <div class="py-4 text-center text-white">
                <div class="text-h4 font-weight-bold">Bro World</div>
              </div>
              <AuthSocial
                :loading="isRedirecting"
                @redirect="handleSocialRedirect"
              />
            </v-sheet>

            <v-card-text class="pa-3 pt-4">
              <AuthLoginForm :disabled="isRedirecting" />
            </v-card-text>

            <v-overlay
              :model-value="isRedirecting"
              class="login-overlay"
              contained
              persistent
              scrim="rgba(15, 23, 42, 0.65)"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              />
            </v-overlay>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
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

const { t } = useI18n();
const pageDescription = computed(() => t("seo.login.description"));

definePageMeta({
  title: "login",
  layout: "auth",
  breadcrumb: "disabled",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
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
