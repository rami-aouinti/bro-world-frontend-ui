<template>
  <section class="flex h-full flex-1 flex-col">
    <header
      v-if="conversation"
      class="flex items-center justify-between border-b border-border px-4 py-3"
    >
      <div class="flex min-w-0 items-center gap-3">
        <v-avatar
          :size="44"
          class="bg-muted text-sm font-semibold text-muted-foreground"
        >
          <img
            v-if="avatarImage"
            :alt="conversationTitle"
            :src="avatarImage"
            width="44"
            height="44"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            class="h-full w-full object-cover"
          />
          <span v-else>
            {{ avatar.initials }}
          </span>
        </v-avatar>
        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold">
            {{ conversationTitle }}
          </h2>
          <p class="truncate text-xs text-muted-foreground">
            {{ participantsSubtitle }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <v-btn
          v-if="hasMore"
          variant="text"
          density="comfortable"
          size="small"
          :disabled="loadingOlder"
          @click="loadOlder"
        >
          {{ props.loadOlderLabel }}
        </v-btn>
      </div>
    </header>
    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <AppIcon
          name="mdi:message-outline"
          :size="36"
        />
      </div>
      <div class="space-y-1">
        <p class="text-lg font-semibold">
          {{ props.emptyTitle }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ props.emptyDescription }}
        </p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        :to="props.emptyCtaTo"
      >
        {{ props.emptyCtaLabel }}
      </v-btn>
    </div>

    <div
      v-if="conversation"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6"
      @scroll.passive="handleScroll"
    >
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex w-full flex-col gap-1',
            isOwnMessage(message) ? 'items-end' : 'items-start',
          ]"
        >
          <div
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-colors',
              isOwnMessage(message)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
            ]"
          >
            <p class="whitespace-pre-line break-words">
              {{ message.content }}
            </p>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              {{ messageTime(message.createdAt) }}
            </span>
            <span v-if="message.status === 'pending'">
              {{ props.sendingLabel }}
            </span>
            <span
              v-else-if="message.status === 'error'"
              class="text-destructive"
            >
              {{ props.sendErrorLabel }}
            </span>
          </div>
        </div>
        <div
          v-if="!messages.length"
          class="py-10 text-center text-sm text-muted-foreground"
        >
          {{ props.noMessagesLabel }}
        </div>
      </div>
    </div>

    <div
      v-if="conversation"
      class="border-t border-border px-4 py-4"
    >
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <v-textarea
          v-model="draft"
          :placeholder="props.composerPlaceholder"
          auto-grow
          max-rows="6"
          rows="1"
          variant="solo"
          density="comfortable"
          class="w-full"
          :disabled="sending || !conversation"
          @keydown="handleKeydown"
        />
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-muted-foreground">
            {{ props.shortcutsHint }}
          </span>
          <div class="flex items-center gap-2">
            <v-btn
              color="primary"
              :disabled="sending || !draft.trim()"
              :loading="sending"
              @click="send"
            >
              {{ props.sendLabel }}
            </v-btn>
          </div>
        </div>
        <p
          v-if="sendError"
          class="text-sm text-destructive"
        >
          {{ sendError }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import { useMessengerStore } from "~/stores/messenger";
import { formatRelativeTime } from "~/lib/datetime/relative-time";
import { resolveConversationAvatar, resolveConversationTitle } from "~/lib/messenger/display";
import type { MessengerMessage } from "~/types/messenger";
import { optimizeAvatarUrl } from "~/lib/images/avatar";

const props = defineProps<{
  composerPlaceholder: string;
  sendLabel: string;
  sendingLabel: string;
  sendErrorLabel: string;
  shortcutsHint: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel: string;
  emptyCtaTo?: string;
  noMessagesLabel: string;
  loadOlderLabel: string;
  participantsLabel: string;
  unknownLabel: string;
}>();

const auth = useAuthSession();
const messenger = useMessengerStore();
const { locale } = useI18n();

const messagesContainer = ref<HTMLDivElement | null>(null);
const draft = ref("");
const autoScroll = ref(true);

const conversation = computed(() => messenger.activeConversation.value);
const messages = computed<MessengerMessage[]>(() => messenger.currentMessages.value ?? []);
const sending = computed(() => messenger.sendingMessage.value);
const sendError = computed(() => messenger.sendError.value);
const pagination = computed(() => {
  const current = conversation.value;
  if (!current) {
    return undefined;
  }

  return messenger.pagination.value[current.id];
});

const loadingOlder = computed(() => pagination.value?.pending ?? false);
const hasMore = computed(() => pagination.value?.hasMore ?? false);

const conversationTitle = computed(() => {
  if (!conversation.value) {
    return "";
  }

  const userId = auth.currentUser.value?.id ?? null;
  return resolveConversationTitle(conversation.value, userId, props.unknownLabel);
});

const participantsSubtitle = computed(() => {
  if (!conversation.value) {
    return "";
  }

  const participants = conversation.value.participants ?? [];
  const count = Math.max(participants.length - 1, 0);

  return props.participantsLabel.replace("{count}", String(count));
});

const avatar = computed(() => {
  if (!conversation.value) {
    return { url: null, initials: props.unknownLabel.slice(0, 2).toUpperCase() };
  }

  const userId = auth.currentUser.value?.id ?? null;
  return resolveConversationAvatar(
    conversation.value,
    userId,
    props.unknownLabel.slice(0, 2).toUpperCase(),
  );
});
const avatarPixelSize = 44;
const avatarImage = computed(() =>
  optimizeAvatarUrl(avatar.value.url ?? null, avatarPixelSize * 2),
);

function isOwnMessage(message: MessengerMessage) {
  const userId = auth.currentUser.value?.id;
  return message.sender?.id === userId;
}

function messageTime(value: string) {
  return formatRelativeTime(value, locale.value);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    send();
  }
}

async function send() {
  if (!conversation.value) {
    return;
  }

  const content = draft.value.trim();

  if (!content) {
    return;
  }

  await messenger.sendMessage(conversation.value.id, { content });
  draft.value = "";

  await nextTick();
  scrollToBottom(true);
  markAsRead();
}

function scrollToBottom(force = false) {
  const element = messagesContainer.value;

  if (!element) {
    return;
  }

  if (!force && !autoScroll.value) {
    return;
  }

  element.scrollTo({
    top: element.scrollHeight,
    behavior: force ? "auto" : "smooth",
  });
}

function nearBottom(): boolean {
  const element = messagesContainer.value;

  if (!element) {
    return false;
  }

  const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
  return distance < 120;
}

function handleScroll() {
  autoScroll.value = nearBottom();

  if (autoScroll.value) {
    markAsRead();
  }
}

function markAsRead() {
  if (!conversation.value || conversation.value.unreadCount <= 0) {
    return;
  }

  const lastMessage = messages.value[messages.value.length - 1];

  if (!lastMessage) {
    return;
  }

  messenger.markConversationRead(conversation.value.id, lastMessage.id);
}

async function loadOlder() {
  if (!conversation.value || !hasMore.value || loadingOlder.value) {
    return;
  }

  await messenger.fetchMessages(conversation.value.id, { before: pagination.value?.before });
}

watch(
  () => conversation.value?.id,
  () => {
    draft.value = "";
    nextTick(() => {
      scrollToBottom(true);
      markAsRead();
    });
  },
);

watch(
  () => messages.value.length,
  () => {
    nextTick(() => {
      scrollToBottom(false);
      if (autoScroll.value) {
        markAsRead();
      }
    });
  },
);

watch(
  () => sendError.value,
  (error) => {
    if (error) {
      autoScroll.value = true;
    }
  },
);

watch(
  () => sending.value,
  (isSending, wasSending) => {
    if (!isSending && wasSending) {
      nextTick(() => {
        scrollToBottom(true);
      });
    }
  },
);
</script>
