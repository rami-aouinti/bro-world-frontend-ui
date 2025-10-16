<template>
  <main aria-labelledby="security-title">
    <ProfileSecurityForm />
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";

const ProfileSecurityForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileSecurityForm.vue"),
  suspensible: false,
});

const ProfileSecurityTwoFactorSidebarCard = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileSecurityTwoFactorSidebarCard.vue"),
  suspensible: false,
});

const { t } = useI18n();
const pageDescription = computed(() => t("seo.profileSecurity.description"));

definePageMeta(() => ({
  middleware: "auth",
  title: "profile-security",
  sidebarVariant: "profile",
  documentDriven: false,
}));
useSeoMeta(() => ({
  description: pageDescription.value,
}));
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
