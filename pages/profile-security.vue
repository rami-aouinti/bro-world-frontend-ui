<template>
  <main aria-labelledby="security-title">
    <ProfileSecurityForm />
  </main>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";

const ProfileSecurityForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileSecurityForm.vue"),
  suspensible: false,
});

const ProfileSecurityTwoFactorSidebarCard = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileSecurityTwoFactorSidebarCard.vue"),
  suspensible: false,
});

definePageMeta({
  middleware: "auth",
  title: "profile-security",
  sidebarVariant: "profile",
  documentDriven: false,
});

const { registerRightSidebarContent, setRightSidebarContent } = useLayoutRightSidebar();

if (import.meta.server) {
  setRightSidebarContent({
    component: ProfileSecurityTwoFactorSidebarCard,
    wrapperClass: "flex flex-col gap-4",
  });
} else {
  registerRightSidebarContent({
    component: ProfileSecurityTwoFactorSidebarCard,
    wrapperClass: "flex flex-col gap-4",
  });
}
</script>
