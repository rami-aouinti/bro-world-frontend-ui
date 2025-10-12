<template>
  <main
    class="py-4"
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
  showRightWidgets: false,
  sidebarVariant: "profile",
  documentDriven: false,
});
</script>
