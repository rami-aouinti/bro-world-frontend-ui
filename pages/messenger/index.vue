<template>
  <v-container
    fluid
    class="messenger-page py-6"
  >
    <ChatWindow :conversation="activeConversation" />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { callOnce, navigateTo } from "#app";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ChatWindow from "~/components/messenger/ChatWindow.vue";
import ChatList from "~/components/messenger/ChatList.vue";
import { useMessengerStore } from "~/stores/messenger";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const messenger = useMessengerStore();
const router = useRouter();
const { t } = useI18n();
await useLocaleNamespaces(["messenger"]);
const { registerRightSidebarContent } = useLayoutRightSidebar();

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
  requiresPlugin: "messenger",
});

const pageDescription = computed(() => t("seo.messenger.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

await callOnce("messenger:threads:prefetch", () => messenger.fetchThreads({ limit: 50 }));

const conversations = computed(() => messenger.orderedConversations.value ?? []);
const activeConversation = computed(() => messenger.activeConversation.value);
const activeConversationId = computed(() => messenger.activeConversationId.value);
const loading = computed(() => messenger.loadingList.value);
const emptyLabel = computed(() => t("messenger.emptyList", "No conversations yet"));

function handleSelect(id: string) {
  if (!id) {
    return;
  }

  router.push({ path: `/messenger/${id}` });
}

registerRightSidebarContent(
  computed(() => ({
    component: ChatList,
    props: {
      conversations: conversations.value,
      selectedId: activeConversationId.value,
      loading: loading.value,
      emptyLabel: emptyLabel.value,
      onSelect: handleSelect,
    },
    wrapperClass: "flex h-full flex-col gap-4 px-3 py-4",
  })),
);

const latestConversationId = messenger.latestConversationId.value;

if (latestConversationId) {
  await navigateTo({ path: `/messenger/${latestConversationId}`, replace: true });
}
</script>

<style scoped>
.messenger-page {
  display: flex !important;
  flex: 1 1 auto;
  flex-direction: column;
  flex-wrap: nowrap !important;
  align-content: stretch;
  min-height: calc(var(--app-viewport-height, 100vh) - var(--app-bar-height));
}
</style>
