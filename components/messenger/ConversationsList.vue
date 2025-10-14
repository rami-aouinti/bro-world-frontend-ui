<template>
  <aside
    class="flex h-full flex-col border-border"
    :class="['w-full md:w-[320px]', 'border-b md:border-b-0 md:border-r']"
  >
    <div class="border-b border-border px-4 py-3">
      <v-text-field
        v-model="query"
        :placeholder="props.searchPlaceholder"
        density="comfortable"
        hide-details
        variant="solo"
        color="primary"
        prepend-inner-icon="mdi:magnify"
        clearable
        :aria-label="props.searchPlaceholder"
      />
    </div>
    <div class="flex-1 overflow-y-auto">
      <div
        v-if="props.loading"
        class="flex flex-col gap-4 px-4 py-6"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="flex items-center gap-3"
        >
          <v-skeleton-loader
            class="rounded-full"
            height="42"
            type="avatar"
            width="42"
          />
          <div class="flex flex-1 flex-col gap-2">
            <v-skeleton-loader
              height="12"
              type="text"
            />
            <v-skeleton-loader
              height="10"
              type="text"
            />
          </div>
        </div>
      </div>
      <template v-else>
        <v-list
          v-if="filteredConversations.length"
          class="py-0"
          density="comfortable"
          nav
        >
          <v-list-item
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            :value="conversation.id"
            :class="[
              'px-4 py-3 transition-colors',
              conversation.id === props.activeId
                ? 'bg-primary/10 text-primary-foreground dark:bg-primary/20'
                : 'hover:bg-muted/70 dark:hover:bg-muted/40',
            ]"
            role="button"
            @click="handleSelect(conversation.id)"
          >
            <template #prepend>
              <v-avatar
                :size="44"
                class="bg-muted text-sm font-semibold text-muted-foreground"
              >
                <img
                  v-if="conversation.avatarUrl"
                  :alt="conversation.title"
                  :src="conversation.avatarUrl"
                  width="44"
                  height="44"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                  class="h-full w-full object-cover"
                />
                <span v-else>
                  {{ conversation.initials }}
                </span>
              </v-avatar>
            </template>
            <div class="flex flex-1 flex-col gap-1 overflow-hidden">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-sm font-semibold">
                  {{ conversation.title }}
                </p>
                <span class="whitespace-nowrap text-xs text-muted-foreground">
                  {{ conversation.timeAgo }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <p class="line-clamp-1 text-xs text-muted-foreground">
                  <span
                    v-if="conversation.sender"
                    class="font-medium text-foreground"
                  >
                    {{ conversation.sender }}
                  </span>
                  <span v-if="conversation.sender && conversation.snippet">
                    &nbsp;&mdash;&nbsp;
                  </span>
                  <span>
                    {{ conversation.snippet || props.emptyLabel }}
                  </span>
                </p>
                <span
                  v-if="conversation.unreadCount"
                  class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                >
                  {{ conversation.unreadCount > 99 ? "99+" : conversation.unreadCount }}
                </span>
              </div>
            </div>
          </v-list-item>
        </v-list>
        <div
          v-else
          class="flex h-full flex-col items-center justify-center gap-3 px-8 py-12 text-center"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <AppIcon
              name="mdi:message-reply-text"
              :size="32"
            />
          </div>
          <p class="text-sm font-medium">
            {{ props.emptyLabel }}
          </p>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import { formatRelativeTime } from "~/lib/datetime/relative-time";
import {
  resolveConversationAvatar,
  resolveConversationTitle,
  resolveMessageSender,
} from "~/lib/messenger/display";
import type { MessengerConversation } from "~/types/messenger";

const props = defineProps<{
  conversations: MessengerConversation[];
  activeId: string | null;
  loading: boolean;
  searchPlaceholder: string;
  emptyLabel: string;
  unknownLabel: string;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
}>();

const auth = useAuthSession();
const { locale } = useI18n();
const query = ref("");

const normalizedConversations = computed(() => {
  const currentUserId = auth.currentUser.value?.id ?? null;
  const fallbackInitials = props.unknownLabel.slice(0, 2).toUpperCase();

  return props.conversations.map((conversation) => {
    const title = resolveConversationTitle(conversation, currentUserId, props.unknownLabel);
    const avatar = resolveConversationAvatar(conversation, currentUserId, fallbackInitials);
    const lastMessage = conversation.lastMessage ?? null;

    return {
      id: conversation.id,
      title,
      avatarUrl: avatar.url,
      initials: avatar.initials,
      snippet: lastMessage?.content ?? "",
      sender: resolveMessageSender(lastMessage, ""),
      timeAgo: formatRelativeTime(lastMessage?.createdAt ?? conversation.updatedAt, locale.value),
      unreadCount: conversation.unreadCount ?? 0,
    };
  });
});

const filteredConversations = computed(() => {
  const term = query.value.trim().toLowerCase();

  if (!term) {
    return normalizedConversations.value;
  }

  return normalizedConversations.value.filter((conversation) => {
    return [conversation.title, conversation.snippet, conversation.sender]
      .filter(Boolean)
      .some((entry) => entry.toLowerCase().includes(term));
  });
});

function handleSelect(id: string) {
  emit("select", id);
}
</script>
