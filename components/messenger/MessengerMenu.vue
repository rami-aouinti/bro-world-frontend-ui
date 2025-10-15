<template>
  <v-menu
    v-model="open"
    location="bottom end"
    offset="8"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.buttonLabel"
        v-bind="menuProps"
      >
        <v-badge
          v-if="props.unreadCount > 0"
          :content="props.unreadCount"
          color="primary"
          floating
          max="99"
          offset-x="4"
          offset-y="2"
          size="small"
        >
          <AppIcon
            name="mdi:message-outline"
            :size="26"
          />
        </v-badge>
        <template v-else>
          <AppIcon
            name="mdi:message-outline"
            :size="26"
          />
        </template>
      </button>
    </template>
    <MessengerMenuContent
      :title="props.title"
      :subtitle="props.subtitle"
      :view-all-label="props.viewAllLabel"
      :loading="props.loading"
      :previews="previews"
      :empty-text="props.emptyText"
      @view-all="handleViewAll"
      @open-conversation="openConversation"
    />
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import {
  resolveConversationAvatar,
  resolveConversationTitle,
  resolveMessageSender,
} from "~/lib/messenger/display";
import { formatRelativeTime } from "~/lib/datetime/relative-time";
import type { MessengerConversation } from "~/types/messenger";
import type { MessengerPreviewEntry } from "~/types/messenger/ui";

const MessengerMenuContent = defineAsyncComponent({
  loader: () => import("./MessengerMenuContent.vue"),
  suspensible: false,
});

const props = defineProps<{
  iconTriggerClasses: string;
  conversations: MessengerConversation[];
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  buttonLabel: string;
  emptyText: string;
  unknownLabel: string;
  loading: boolean;
}>();

const router = useRouter();
const { locale } = useI18n();
const auth = useAuthSession();
const currentUserId = computed(() => auth.currentUser.value?.id ?? null);
const fallbackInitials = computed(() => props.unknownLabel.slice(0, 2).toUpperCase());
const open = ref(false);

const previews = computed<MessengerPreviewEntry[]>(() => {
  const userId = currentUserId.value;
  const initialsFallback = fallbackInitials.value;

  return props.conversations.slice(0, 3).map((conversation) => {
    const title = resolveConversationTitle(conversation, userId, props.unknownLabel);
    const lastMessage = conversation.lastMessage ?? null;
    const snippet = lastMessage?.content ?? "";
    const sender = resolveMessageSender(lastMessage, "");
    const avatar = resolveConversationAvatar(conversation, userId, initialsFallback);

    return {
      id: conversation.id,
      title,
      sender,
      snippet,
      unread: (conversation.unreadCount ?? 0) > 0,
      unreadCount: conversation.unreadCount ?? 0,
      avatarUrl: avatar.url,
      initials: avatar.initials,
      timeAgo: formatRelativeTime(
        conversation.lastMessage?.createdAt ?? conversation.updatedAt,
        locale.value,
      ),
    };
  });
});

function openConversation(id: string) {
  open.value = false;
  router.push({ path: `/messenger/${id}` });
}

function handleViewAll() {
  open.value = false;
  router.push({ path: "/messenger" });
}
</script>
