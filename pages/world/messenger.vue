<template>
  <v-container fluid>
    <client-only>
      <teleport
        v-if="canTeleport"
        to="#menu-bar-world"
      >
        <template v-if="showSkeleton">
          <v-card
            class="pa-4"
            rounded="xl"
            variant="text"
          >
            <v-skeleton-loader
              v-for="n in 4"
              :key="n"
              type="list-item-avatar"
              class="rounded-lg mb-2"
              height="60"
            />
          </v-card>
        </template>
        <ChatList
          v-else
          :conversations="conversations"
          :selected-id="activeConversation?.id ?? null"
          :loading="loadingList"
          :empty-label="emptyLabel"
          @select="setActiveConversation"
        />
      </teleport>
    </client-only>

    <v-row
      class="mt-4"
      align="stretch"
      dense
    >
      <v-col
        v-if="!canTeleport"
        cols="12"
        md="4"
      >
        <ChatList
          :conversations="conversations"
          :selected-id="activeConversation?.id ?? null"
          :loading="loadingList"
          :empty-label="emptyLabel"
          @select="setActiveConversation"
        />
      </v-col>
      <v-col
        cols="12"
        :md="canTeleport ? 12 : 8"
      >
        <ChatWindow :conversation="activeConversation" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watchEffect } from "vue";
import { callOnce } from "#app";
import { useI18n } from "vue-i18n";
import ChatList from "~/components/messenger/ChatList.vue";
import ChatWindow from "~/components/messenger/ChatWindow.vue";
import { useMessengerStore } from "~/stores/messenger";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const messenger = useMessengerStore();
const { t } = useI18n();
await useLocaleNamespaces(["messenger"]);

const canTeleport = ref(false);

await callOnce("messenger:threads:prefetch", () => messenger.fetchThreads({ limit: 50 }));

const conversations = computed(() => messenger.orderedConversations.value ?? []);
const activeConversation = computed(() => messenger.activeConversation.value);
const loadingList = computed(() => messenger.loadingList.value);
const emptyLabel = computed(() => t("messenger.emptyList", "No conversations yet"));
const showSkeleton = computed(() => loadingList.value && conversations.value.length === 0);

function setActiveConversation(id: string) {
  if (!id) {
    return;
  }

  messenger.openConversation(id);
}

watchEffect(async () => {
  if (!import.meta.client) {
    return;
  }

  if (activeConversation.value || conversations.value.length === 0) {
    return;
  }

  const preferred = messenger.latestConversationId.value ?? conversations.value[0]?.id;

  if (preferred) {
    await messenger.openConversation(preferred);
  }
});

onMounted(async () => {
  await nextTick();

  setTimeout(() => {
    if (typeof document !== "undefined") {
      canTeleport.value = Boolean(document.getElementById("menu-bar-world"));
    }
  }, 200);
});

definePageMeta({
  layout: "default",
  description: "Messenger page",
  title: "Messenger",
  breadcrumb: "disabled",
  scrollToTop: true,
  requiresPlugin: "messenger",
});

useSeoMeta({
  title: "Messenger",
  description: "Chat with your friends and manage conversations.",
  ogTitle: "Messenger",
  ogDescription: "Chat with your friends and manage conversations.",
});
</script>
