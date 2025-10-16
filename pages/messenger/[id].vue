<template>
  <div class="flex h-[calc(100vh-50px)] flex-col md:flex-row">
    <ConversationsList
      :conversations="conversations"
      :active-id="conversationId"
      :loading="loading"
      :search-placeholder="t('messenger.searchPlaceholder')"
      :empty-label="t('messenger.emptyList')"
      :unknown-label="t('messenger.unknownParticipant')"
      @select="handleSelect"
    />
    <ChatPane
      class="flex-1"
      :composer-placeholder="t('messenger.composerPlaceholder')"
      :send-label="t('messenger.sendLabel')"
      :sending-label="t('messenger.sendingLabel')"
      :send-error-label="t('messenger.sendErrorStatus')"
      :shortcuts-hint="t('messenger.shortcutsHint')"
      :empty-title="t('messenger.emptyTitle')"
      :empty-description="t('messenger.emptyDescription')"
      :empty-cta-label="t('messenger.emptyCtaLabel')"
      :empty-cta-to="emptyCtaTo"
      :no-messages-label="t('messenger.noMessages')"
      :load-older-label="t('messenger.loadOlder')"
      :participants-label="t('messenger.participantsLabel')"
      :unknown-label="t('messenger.unknownParticipant')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { callOnce, navigateTo } from "#imports";
import { useMessengerStore } from "~/stores/messenger";

const ConversationsList = defineAsyncComponent({
  loader: () => import("~/components/messenger/ConversationsList.vue"),
  suspensible: false,
});
const ChatPane = defineAsyncComponent({
  loader: () => import("~/components/messenger/ChatPane.vue"),
  suspensible: false,
});

const messenger = useMessengerStore();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const { t } = useI18n();

const pageDescription = computed(() => t("seo.messenger.description"));

definePageMeta(() => ({
  documentDriven: false,
}));
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
const emptyCtaTo = computed(() => {
  const raw = t("messenger.emptyCtaLink");
  return raw === "messenger.emptyCtaLink" ? undefined : raw;
});

async function ensureConversation(id: string) {
  if (!id) {
    const latest = messenger.latestConversationId.value;

    if (latest) {
      await navigateTo({ path: `/messenger/${latest}`, replace: true });
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

function handleSelect(id: string) {
  if (!id) {
    return;
  }

  router.push({ path: `/messenger/${id}` });
}
</script>
