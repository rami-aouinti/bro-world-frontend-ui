<template>
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
</template>

<script setup lang="ts">
import AuthResetPasswordForm from "~/components/auth/ResetPasswordForm.vue";

definePageMeta({
  title: "forgot-password",
  layout: "auth",
  breadcrumb: "disabled",
});
</script>

<style scoped>
.auth-card {
  max-width: 520px;
  margin-inline: auto;
}

.auth-card__form {
  margin-top: -60px;
}
</style>
