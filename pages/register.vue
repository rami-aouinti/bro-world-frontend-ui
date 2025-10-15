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
import { computed, ref, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { resolveSocialRedirect, type SocialProvider } from "~/lib/auth/social";

const AuthRegisterForm = defineAsyncComponent({
  loader: () => import("~/components/auth/RegisterForm.vue"),
  suspensible: false,
});
const AuthSocial = defineAsyncComponent({
  loader: () => import("~/components/auth/Social.vue"),
  suspensible: false,
});

const isRedirecting = ref(false);
const { t } = useI18n();
const pageDescription = computed(() => t("seo.register.description"));

definePageMeta(() => ({
  title: "register",
  layout: "auth",
  breadcrumb: "disabled",
  documentDriven: false,
  description: pageDescription.value,
}));

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
