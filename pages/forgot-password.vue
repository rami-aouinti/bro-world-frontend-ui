<template>
  <v-container class="py-12" style="margin-top: -70px;">
    <v-card-text class="text-medium-emphasis pa-1">
      <AuthResetPasswordForm />
    </v-card-text>
  </v-container>
</template>

<script setup lang="ts">
import AuthResetPasswordForm from "~/components/auth/ResetPasswordForm.vue";
</script>
