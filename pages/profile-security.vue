<template>
  <main
    aria-labelledby="security-title"
  >
    <ProfileSecurityForm />
  </main>
</template>

<script setup lang="ts">
import ProfileSecurityForm from "~/components/forms/ProfileSecurityForm.vue";

definePageMeta({
  middleware: "auth",
  title: "profile-security",
  sidebarVariant: "profile",
  documentDriven: false,
});
</script>
