<template>
  <div>
    <template v-if="!conversation">
      <v-card
        class="d-flex flex-column align-center justify-center py-12 text-center"
        rounded="xl"
        variant="text"
      >
        <v-icon
          color="primary"
          size="48"
          >mdi-message-outline</v-icon
        >
        <p class="mt-4 text-h6">Select a conversation to get started</p>
        <p class="text-body-2 text-medium-emphasis">Pick someone from the list to open the chat.</p>
      </v-card>
    </template>

    <template v-else>
      <v-skeleton-loader
        v-if="loadingState"
        type="card-avatar"
        class="pt-8 px-2 mb-4"
        height="420"
        rounded="xl"
      />

      <v-card
        v-else
        class="pt-8 px-2 shadow-blur fade-in overflow-visible"
        rounded="xl"
        variant="text"
      >
        <header class="px-4 pb-4">
          <div class="d-flex align-center justify-between">
            <div class="d-flex align-center gap-3">
              <GlowingAvatar
                :src="avatar"
                :alt="title"
                :size="56"
              />
              <div>
                <h2 class="text-h6 mb-0">{{ title }}</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ participantsSubtitle }}
                </p>
              </div>
            </div>
            <div class="d-flex align-center gap-2 text-medium-emphasis">
              <v-btn
                icon
                variant="text"
                size="small"
              >
                <v-icon size="20">mdi-video</v-icon>
              </v-btn>
              <v-menu
                transition="slide-y-transition"
                offset-y
                min-width="160"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    icon
                    variant="text"
                    size="small"
                  >
                    <v-icon size="20">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="comfortable">
                  <v-list-item
                    v-for="item in menuItems"
                    :key="item"
                  >
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </header>

        <v-progress-linear
          v-if="sending"
          indeterminate
          color="primary"
          height="2"
        />

        <div
          ref="messageContainer"
          class="px-4 pb-4 pt-2 overflow-y-auto"
          style="max-height: 420px; overflow-x: hidden"
          @scroll.passive="handleScroll"
        >
          <div
            v-if="messages.length"
            class="d-flex flex-column gap-4"
          >
            <div
              v-for="message in messages"
              :key="message.id"
              class="d-flex"
              :class="isOwnMessage(message) ? 'justify-end text-end' : 'justify-start text-start'"
            >
              <div
                class="message-bubble"
                :class="
                  isOwnMessage(message) ? 'message-bubble--outgoing' : 'message-bubble--incoming'
                "
              >
                <div
                  v-if="message.content?.trim()"
                  class="text-body-2"
                >
                  {{ message.content }}
                </div>
                <div
                  v-for="attachment in message.attachments || []"
                  :key="attachment.id"
                  class="mt-2"
                >
                  <NuxtImg
                    :src="attachment.url"
                    :alt="attachment.name"
                    width="220"
                    class="rounded-lg"
                    loading="lazy"
                  />
                </div>
                <RelativeTime
                  :date="message.createdAt"
                  class="mt-2"
                />
              </div>
            </div>
          </div>
          <div
            v-else
            class="py-8 text-center text-medium-emphasis"
          >
            No messages yet. Start the conversation!
          </div>
          <div ref="bottomAnchor" />
        </div>

        <MessageInput
          class="mt-2"
          :disabled="sending"
          @send="handleSend"
        />

        <p
          v-if="sendError"
          class="px-4 pb-4 text-body-2 text-error"
        >
          {{ sendError }}
        </p>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type {
  MessengerConversation,
  MessengerMessage,
  MessengerSendMessagePayload,
} from "~/types/messenger";
import { useMessengerStore } from "~/stores/messenger";
import { useAuthSession } from "~/stores/auth-session";
import MessageInput from "~/components/world/messenger/MessageInput.vue";
import GlowingAvatar from "~/components/app/GlowingAvatar.vue";
import RelativeTime from "~/components/app/RelativeTime.vue";
import { useConversationUtils } from "~/composables/useConversationUtils";

const props = defineProps<{ conversation: MessengerConversation | null }>();

const messenger = useMessengerStore();
const auth = useAuthSession();
const { getConversationTitle, getConversationAvatar } = useConversationUtils();

const messageContainer = ref<HTMLElement | null>(null);
const bottomAnchor = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const loadingConversation = ref(false);

const menuItems = ["Profile", "Mute conversation", "Block", "Clear chat"];

const messages = computed(() => messenger.currentMessages.value);
const sending = computed(() => messenger.sendingMessage.value);
const sendError = computed(() => messenger.sendError.value);
const activeConversationId = computed(() => messenger.activeConversationId.value);
const conversationId = computed(() => props.conversation?.id ?? null);
const loadingMessages = computed(() => {
  const id = conversationId.value;

  if (!id) {
    return false;
  }

  return messenger.loadingMessages.value[id] ?? false;
});

const loadingState = computed(() => loadingConversation.value || loadingMessages.value);
const title = computed(() => getConversationTitle(props.conversation));
const avatar = computed(
  () => getConversationAvatar(props.conversation) ?? "https://placehold.co/128x128",
);
const participantsSubtitle = computed(() => {
  const participants = props.conversation?.participants ?? [];
  const count = Math.max(participants.length - 1, 0);

  if (count === 0) {
    return "Just you";
  }

  if (count === 1) {
    return "Last seen recently";
  }

  return `${count} friends in this chat`;
});

function isOwnMessage(message: MessengerMessage) {
  const currentUserId = auth.currentUser.value?.id;

  return message.sender?.id === currentUserId;
}

function scrollToBottom(force = false) {
  const element = messageContainer.value;

  if (!element) {
    return;
  }

  if (!force && !autoScroll.value) {
    return;
  }

  element.scrollTo({ top: element.scrollHeight, behavior: force ? "auto" : "smooth" });
}

function nearBottom() {
  const element = messageContainer.value;

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
  if (!conversationId.value) {
    return;
  }

  const lastMessage = messages.value[messages.value.length - 1];

  if (!lastMessage) {
    return;
  }

  messenger.markConversationRead(conversationId.value, lastMessage.id);
}

async function handleSend(payload: MessengerSendMessagePayload) {
  if (!conversationId.value) {
    return;
  }

  await messenger.sendMessage(conversationId.value, payload);
  await nextTick();
  scrollToBottom(true);
}

watch(
  () => conversationId.value,
  async (id, previous) => {
    if (!id) {
      loadingConversation.value = false;
      return;
    }

    if (id === previous) {
      return;
    }

    if (!import.meta.client) {
      return;
    }

    loadingConversation.value = true;
    autoScroll.value = true;

    await messenger.openConversation(id);
    loadingConversation.value = false;

    await nextTick();
    scrollToBottom(true);
    markAsRead();
  },
  { immediate: true },
);

watch(
  () => messages.value.length,
  async (length, previous) => {
    if (!conversationId.value || activeConversationId.value !== conversationId.value) {
      return;
    }

    if (typeof previous === "number" && length <= previous) {
      return;
    }

    await nextTick();

    if (autoScroll.value) {
      scrollToBottom(false);
      markAsRead();
    }
  },
);

watch(
  () => sending.value,
  async (isSending, wasSending) => {
    if (!conversationId.value || activeConversationId.value !== conversationId.value) {
      return;
    }

    if (wasSending && !isSending) {
      await nextTick();
      scrollToBottom(true);
    }
  },
);

onMounted(async () => {
  if (bottomAnchor.value) {
    bottomAnchor.value.classList.add("bottom-anchor");
  }

  if (conversationId.value && import.meta.client) {
    loadingConversation.value = true;
    await messenger.openConversation(conversationId.value);
    loadingConversation.value = false;
    await nextTick();
    scrollToBottom(true);
    markAsRead();
  }
});
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.message-bubble--incoming {
  background: linear-gradient(135deg, rgba(126, 87, 194, 0.15), rgba(255, 255, 255, 0.6));
  color: inherit;
}

.message-bubble--outgoing {
  background: linear-gradient(135deg, rgba(244, 143, 177, 0.8), rgba(206, 147, 216, 0.8));
  color: #fff;
  margin-left: auto;
}
</style>
