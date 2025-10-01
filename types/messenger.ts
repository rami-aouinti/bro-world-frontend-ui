export interface MessengerParticipant {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface MessengerMessage {
  id: string;
  conversationId: string;
  sender: MessengerParticipant;
  content: string;
  createdAt: string;
  attachments?: MessengerAttachment[];
  readAt?: string | null;
  status?: MessengerMessageStatus;
  optimistic?: boolean;
}

export interface MessengerAttachment {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export type MessengerMessageStatus = "pending" | "sent" | "error";

export interface MessengerConversation {
  id: string;
  title?: string | null;
  participants: MessengerParticipant[];
  lastMessage: MessengerMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface MessengerThreadEnvelope {
  data: MessengerConversation[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface MessengerConversationEnvelope {
  data: MessengerConversation & {
    messages?: MessengerMessage[];
  };
}

export interface MessengerMessagesEnvelope {
  data: MessengerMessage[];
  nextBefore?: string | null;
  hasMore?: boolean;
}

export interface MessengerSendMessagePayload {
  content: string;
  attachments?: MessengerAttachment[];
}

export interface MessengerMercureEnvelope {
  type: "message.created" | "message.read" | "conversation.updated";
  conversationId: string;
  message?: MessengerMessage;
  lastMessage?: MessengerMessage | null;
  unreadCount?: number;
  lastReadMessageId?: string;
  userId?: string;
}
