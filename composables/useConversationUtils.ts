import { computed } from "vue";
import { useAuthSession } from "~/stores/auth-session";
import {
  resolveConversationAvatar,
  resolveConversationTitle,
  resolveMessageSender,
} from "~/lib/messenger/display";
import { formatRelativeTime } from "~/lib/datetime/relative-time";
import type { MessengerConversation } from "~/types/messenger";
import { optimizeAvatarUrl } from "~/lib/images/avatar";
import { useI18n } from "vue-i18n";

interface ConversationPreviewOptions {
  emptyLabel?: string;
}

export function useConversationUtils() {
  const auth = useAuthSession();
  const { locale } = useI18n();

  const currentUserId = computed(() => auth.currentUser.value?.id ?? null);
  const fallbackInitials = computed(() => {
    const name = auth.currentUser.value?.firstName ?? "";

    return (name.slice(0, 2) || "??").toUpperCase();
  });

  function getConversationTitle(conversation: MessengerConversation | null | undefined): string {
    if (!conversation) {
      return "";
    }

    return resolveConversationTitle(
      conversation,
      currentUserId.value,
      conversation.title ?? "Untitled conversation",
    );
  }

  function getConversationAvatar(conversation: MessengerConversation | null | undefined): string | null {
    if (!conversation) {
      return null;
    }

    const avatar = resolveConversationAvatar(
      conversation,
      currentUserId.value,
      fallbackInitials.value,
    );

    return optimizeAvatarUrl(avatar.url ?? null, 112) ?? null;
  }

  function getConversationPreview(
    conversation: MessengerConversation | null | undefined,
    options: ConversationPreviewOptions = {},
  ) {
    if (!conversation) {
      return {
        snippet: options.emptyLabel ?? "",
        sender: "",
        timeAgo: "",
      };
    }

    const lastMessage = conversation.lastMessage ?? null;

    return {
      snippet: lastMessage?.content?.trim() || options.emptyLabel || "",
      sender: resolveMessageSender(lastMessage, ""),
      timeAgo: formatRelativeTime(lastMessage?.createdAt ?? conversation.updatedAt, locale.value),
    };
  }

  return {
    getConversationTitle,
    getConversationAvatar,
    getConversationPreview,
  };
}
