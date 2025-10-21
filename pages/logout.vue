<template>
  <main
    class="flex min-h-[calc(100vh-var(--app-bar-height))] flex-col items-center justify-center gap-4 px-6 py-12 text-center"
    aria-live="polite"
  >
    <v-progress-circular
      v-if="isProcessing"
      indeterminate
      color="primary"
      size="36"
      :aria-label="t('auth.signOut')"
    />
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">{{ t("auth.signOut") }}</h1>
      <p class="text-muted-foreground">
        {{ statusMessage }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const auth = useAuthSession();
const router = useRouter();
const { t } = useI18n();
await useLocaleNamespaces(["auth"]);
const { localePath } = useI18nDocs();

const pageDescription = computed(() => t("seo.logout.description"));

definePageMeta({
  middleware: "auth",
  title: "logout",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const isProcessing = ref(true);
const statusMessage = ref(t("auth.signOut"));

onMounted(async () => {
  await auth.logout({ redirect: false });
  statusMessage.value = t("auth.logoutMessage");
  isProcessing.value = false;
  await router.replace(localePath("/login"));
});
</script>
