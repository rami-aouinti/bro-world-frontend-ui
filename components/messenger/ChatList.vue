<template>
  <v-card
    class="pa-4"
    variant="text"
    rounded="xl"
  >
    <div v-if="loading">
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="list-item-avatar"
        class="rounded-lg mb-2"
        height="60"
      />
    </div>
    <template v-else>
      <v-list
        v-if="items.length"
        nav
        class="py-0"
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
                <span v-if="conversation.sender" class="font-medium text-body-2">{{ conversation.sender }} — </span>
                <span>{{ conversation.preview }}</span>
              </p>
              <v-chip
                v-if="conversation.unreadCount"
                color="primary"
                size="x-small"
                class="font-semibold"
                rounded="lg"
              >
                {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
              </v-chip>
            </div>
          </div>
        </v-list-item>
      </v-list>
      <div
        v-else
        class="text-center py-8 text-medium-emphasis"
      >
        {{ emptyLabel }}
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlowingAvatar from "~/components/app/GlowingAvatar.vue";
import { useConversationUtils } from "~/composables/useConversationUtils";
import type { MessengerConversation } from "~/types/messenger";

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
.hover\:bg-surface-light:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
