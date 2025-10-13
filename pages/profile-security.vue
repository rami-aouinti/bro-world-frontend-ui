<template>
  <main
    aria-labelledby="security-title"
  >
    <ProfileSecurityForm />
  </main>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const ProfileSecurityForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileSecurityForm.vue"),
  suspensible: false,
});

definePageMeta({
  middleware: "auth",
  title: "profile-security",
  sidebarVariant: "profile",
  documentDriven: false,
});

useProfileSidebarContent();
</script>
