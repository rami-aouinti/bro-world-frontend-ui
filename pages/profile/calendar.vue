<template>
  <main aria-labelledby="profile-calendar-page-title">
    <header
      class="mb-6"
      aria-describedby="profile-calendar-page-subtitle"
    >
      <ProfileCalendar compact />
    </header>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { usePageLoadingOverlay } from "~/composables/usePageLoadingOverlay";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const ProfileCalendar = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileCalendar.vue"),
  suspensible: false,
});

const ProfileCalendarSidebarSummary = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileCalendarSidebarSummary.vue"),
  suspensible: false,
});

const { t, locale, localeProperties } = useI18n();
usePageLoadingOverlay({
  loader: () => import("~/components/loading/overlays/ProfileCalendarLoadingOverlay.vue"),
});
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.profileCalendar.description"));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

definePageMeta({
  middleware: "auth",
  title: "profile-calendar",
  sidebarVariant: "profile",
  documentDriven: false,
});

useSeoMeta(() => ({
  description: pageDescription.value,
}));

const { registerRightSidebarContent } = useLayoutRightSidebar();

registerRightSidebarContent({
  component: ProfileCalendarSidebarSummary,
  intrinsicHeight: 640,
});

useHead(() => {
  const title = t("seo.profileCalendar.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});
</script>
