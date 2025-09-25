<template>
  <v-container class="py-12" style="margin-top: -70px;">
    <v-card-text class="text-medium-emphasis pa-0">
      <AuthRegisterForm />
    </v-card-text>
  </v-container>
</template>

<script setup lang="ts">
import AuthRegisterForm from "~/components/auth/RegisterForm.vue";
</script>