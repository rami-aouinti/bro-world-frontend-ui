<template>
  <v-container
    fluid
    class="py-6"
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

const messenger = useMessengerStore();
const router = useRouter();
const { t } = useI18n();
const { registerRightSidebarContent } = useLayoutRightSidebar();

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
});

const pageDescription = computed(() => t("seo.messenger.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

await callOnce(() => messenger.fetchThreads({ limit: 50 }));

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
    wrapperClass: "flex flex-col gap-4 px-3 py-4",
  })),
);

const latestConversationId = messenger.latestConversationId.value;

if (latestConversationId) {
  await navigateTo({ path: `/messenger/${latestConversationId}`, replace: true });
}
</script>
