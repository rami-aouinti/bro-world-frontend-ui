<template>
  <main
    class="py-8"
    aria-labelledby="profile-password-title"
  >
    <v-card
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
        <div class="py-5 text-center text-white">
          <div class="text-h4 font-weight-bold">Bro World</div>
        </div>
      </v-sheet>

      <div class="pa-6 auth-card__form">
        <AuthResetPasswordForm />
      </div>
    </v-card>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

const AuthResetPasswordForm = defineAsyncComponent({
  loader: () => import("~/components/auth/ResetPasswordForm.vue"),
  suspensible: false,
});

const { t } = useI18n();
const pageDescription = computed(() => t("seo.forgotPassword.description"));

definePageMeta(() => ({
  title: "forgot-password",
  layout: "auth",
  breadcrumb: "disabled",
}));
useSeoMeta(() => ({
  description: pageDescription.value,
}));
</script>

<style scoped src="~/assets/styles/pages/forgot-password.scss" lang="scss"></style>
