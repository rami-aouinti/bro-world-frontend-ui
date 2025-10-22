<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div
      v-if="loading"
      class="messenger-chat-list__scroll messenger-chat-list__skeleton"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="list-item-avatar"
        class="rounded-lg"
        height="60"
      />
    </div>
    <template v-else>
      <h2
        id="contact-support"
        class="text-h5 font-weight-semibold mb-2"
      >
        Conversations
      </h2>
      <v-list
        v-if="items.length"
        nav
        class="messenger-chat-list__scroll py-0"
      >
        <v-list-item
          v-for="conversation in items"
          :key="conversation.id"
          :value="conversation.id"
          rounded="lg"
          class="mb-1"
          :class="conversation.id === selectedId ? 'bg-primary/10' : 'hover:bg-surface-light'"
          @click="() => handleSelect(conversation.id)"
        >
          <template #prepend>
            <GlowingAvatar
              :src="conversation.avatar"
              :alt="conversation.title"
              :size="48"
            />
          </template>
          <div class="flex flex-col gap-1 overflow-hidden">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-body-1 font-semibold">
                {{ conversation.title }}
              </p>
              <span class="text-caption text-medium-emphasis whitespace-nowrap">
                {{ conversation.timeAgo }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-body-2 text-medium-emphasis">
                <span
                  v-if="conversation.sender"
                  class="font-medium text-body-2"
                  >{{ conversation.sender }} —
                </span>
                <span>{{ conversation.preview }}</span>
              </p>
              <v-chip
                v-if="conversation.unreadCount"
                color="primary"
                size="x-small"
                class="font-semibold"
                rounded="lg"
              >
                {{ conversation.unreadCount > 99 ? "99+" : conversation.unreadCount }}
              </v-chip>
            </div>
          </div>
        </v-list-item>
      </v-list>
      <div
        v-else
        class="messenger-chat-list__scroll messenger-chat-list__empty text-medium-emphasis"
      >
        {{ emptyLabel }}
      </div>
    </template>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlowingAvatar from "~/components/app/GlowingAvatar.vue";
import { useConversationUtils } from "~/composables/useConversationUtils";
import type { MessengerConversation } from "~/types/messenger";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const props = withDefaults(
  defineProps<{
    conversations?: MessengerConversation[];
    selectedId?: string | null;
    loading?: boolean;
    emptyLabel?: string;
  }>(),
  {
    conversations: () => [],
    selectedId: null,
    loading: false,
    emptyLabel: "No conversations yet",
  },
);

const emit = defineEmits<{ (e: "select", id: string): void }>();

const { getConversationTitle, getConversationAvatar, getConversationPreview } =
  useConversationUtils();

const items = computed(() =>
  props.conversations.map((conversation) => {
    const preview = getConversationPreview(conversation, { emptyLabel: props.emptyLabel });

    return {
      id: conversation.id,
      title: getConversationTitle(conversation),
      avatar: getConversationAvatar(conversation) ?? "https://placehold.co/96x96",
      preview: preview.snippet,
      sender: preview.sender,
      timeAgo: preview.timeAgo,
      unreadCount: conversation.unreadCount ?? 0,
    };
  }),
);

const loading = computed(() => props.loading);
const selectedId = computed(() => props.selectedId);
const emptyLabel = computed(() => props.emptyLabel);

function handleSelect(id: string) {
  emit("select", id);
}
</script>

<style scoped>
.messenger-chat-list {
  --messenger-sidebar-min-height: clamp(520px, 70vh, 840px);
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 12px;
  min-height: var(--messenger-sidebar-min-height);
}

.messenger-chat-list__scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  scrollbar-gutter: stable both-edges;
}

.messenger-chat-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messenger-chat-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 0;
}

.hover\:bg-surface-light:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
