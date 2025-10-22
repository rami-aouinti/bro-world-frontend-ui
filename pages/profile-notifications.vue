<template>
  <main aria-labelledby="profile-notifications-title">
    <ProfileNotificationSettingsForm />
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { usePageLoadingOverlay } from "~/composables/usePageLoadingOverlay";

const ProfileNotificationSettingsForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileNotificationSettingsForm.vue"),
  suspensible: false,
});

const ProfileNotificationSidebarContent = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileNotificationSidebarContent.vue"),
  suspensible: false,
});

const { t } = useI18n();
const pageDescription = computed(() => t("seo.profileNotifications.description"));
usePageLoadingOverlay({
  loader: () => import("~/components/loading/overlays/ProfileNotificationsLoadingOverlay.vue"),
});

definePageMeta({
  middleware: "auth",
  title: "profile-notifications",
  sidebarVariant: "profile",
  documentDriven: false,
});

useSeoMeta(() => ({
  description: pageDescription.value,
}));

const { registerRightSidebarContent, setRightSidebarContent } = useLayoutRightSidebar();

if (import.meta.server) {
  setRightSidebarContent({
    component: ProfileNotificationSidebarContent,
    wrapperClass: "flex flex-col gap-4",
  });
} else {
  registerRightSidebarContent({
    component: ProfileNotificationSidebarContent,
    wrapperClass: "flex flex-col gap-4",
  });
}
</script>
