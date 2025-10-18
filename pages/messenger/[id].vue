<template>
  <v-container
    fluid
    class="py-6"
  >
    <ChatWindow :conversation="activeConversation" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { callOnce, navigateTo } from "#app";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ChatWindow from "~/components/messenger/ChatWindow.vue";
import ChatList from "~/components/messenger/ChatList.vue";
import { useMessengerStore } from "~/stores/messenger";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";

const messenger = useMessengerStore();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
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

const conversationId = computed(() => {
  const params = currentRoute.value?.params ?? {};
  return String((params as Record<string, unknown>).id ?? "");
});

const conversations = computed(() => messenger.orderedConversations.value ?? []);
const loading = computed(() => messenger.loadingList.value);
const activeConversation = computed(() => messenger.activeConversation.value);
const activeConversationId = computed(() => messenger.activeConversationId.value);

function handleSelect(id: string) {
  if (!id) {
    return;
  }

  if (id === conversationId.value) {
    return;
  }

  router.push({ path: `/messenger/${id}` });
}

registerRightSidebarContent(
  computed(() => ({
    component: ChatList,
    props: {
      conversations: conversations.value,
      selectedId: (activeConversationId.value ?? conversationId.value) || null,
      loading: loading.value,
      emptyLabel: t("messenger.emptyList", "No conversations yet"),
      onSelect: handleSelect,
    },
    wrapperClass: "flex flex-col gap-4 px-3 py-4",
  })),
);

async function ensureConversation(id: string) {
  if (!id) {
    const fallback = messenger.latestConversationId.value;

    if (fallback) {
      await navigateTo({ path: `/messenger/${fallback}`, replace: true });
    } else {
      await navigateTo({ path: "/messenger", replace: true });
    }

    return;
  }

  const conversation = await messenger.openConversation(id);

  if (!conversation) {
    const fallback = messenger.latestConversationId.value;

    if (fallback && fallback !== id) {
      await navigateTo({ path: `/messenger/${fallback}`, replace: true });
    } else {
      await navigateTo({ path: "/messenger", replace: true });
    }
  }
}

await ensureConversation(conversationId.value);

watch(
  () => conversationId.value,
  (id, previous) => {
    if (id && id !== previous) {
      ensureConversation(id);
    }
  },
);
</script>
