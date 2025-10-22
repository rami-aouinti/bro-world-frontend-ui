<template>
  <main aria-labelledby="profile-edit-title">
    <ProfileEditForm />
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePageLoadingOverlay } from "~/composables/usePageLoadingOverlay";

const ProfileEditForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileEditForm.vue"),
  suspensible: false,
});

const { t, locale, localeProperties } = useI18n();
usePageLoadingOverlay({
  loader: () => import("~/components/loading/overlays/ProfileEditLoadingOverlay.vue"),
});
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.profileEdit.description"));

definePageMeta({
  middleware: "auth",
  title: "profile-edit",
  sidebarVariant: "profile",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.profileEdit.title");
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
