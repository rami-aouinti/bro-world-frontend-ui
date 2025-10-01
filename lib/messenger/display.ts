import type {
  MessengerConversation,
  MessengerMessage,
  MessengerParticipant,
} from "~/types/messenger";

export function resolveConversationTitle(
  conversation: MessengerConversation,
  currentUserId: string | null,
  fallback: string,
): string {
  if (conversation.title) {
    return conversation.title;
  }

  const participants = Array.isArray(conversation.participants) ? conversation.participants : [];

  const others = participants.filter((participant) => participant.id !== currentUserId);
  const base = (others.length ? others : participants)
    .map((participant) => participant.displayName?.trim())
    .filter(Boolean)
    .join(", ");

  return base || fallback;
}

export function resolveParticipantInitials(
  participant: MessengerParticipant | undefined,
  fallback: string,
): string {
  if (!participant) {
    return fallback;
  }

  if (!participant.displayName) {
    return fallback;
  }

  return (
    participant.displayName
      .split(" ")
      .map((segment) => segment.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback
  );
}

export function resolveConversationAvatar(
  conversation: MessengerConversation,
  currentUserId: string | null,
  fallback: string,
): { url: string | null; initials: string } {
  const participants = Array.isArray(conversation.participants) ? conversation.participants : [];

  const target =
    participants.find((participant) => participant.id !== currentUserId) ?? participants[0];

  return {
    url: target?.avatarUrl ?? null,
    initials: resolveParticipantInitials(target, fallback),
  };
}

export function resolveMessageSender(
  message: MessengerMessage | null | undefined,
  fallback: string,
): string {
  if (!message?.sender) {
    return fallback;
  }

  return message.sender.displayName?.trim() || fallback;
}
