import type {
  MessengerAttachment,
  MessengerConversation,
  MessengerMessage,
  MessengerParticipant,
} from "~/types/messenger";

interface ConversationState extends MessengerConversation {
  messages: MessengerMessage[];
}

interface MessageSeed {
  id?: string;
  senderId: string;
  content: string;
  createdAt?: string;
  attachments?: MessengerAttachment[];
  read?: boolean;
  readAt?: string | null;
}

interface ConversationSeed {
  id: string;
  title?: string | null;
  participantIds: string[];
  unreadCount?: number;
  messages: MessageSeed[];
}

interface MessagesPage {
  messages: MessengerMessage[];
  hasMore: boolean;
  nextBefore: string | null;
}

const CURRENT_USER_ID = "user-demo";

const PARTICIPANTS: Record<string, MessengerParticipant> = {
  [CURRENT_USER_ID]: {
    id: CURRENT_USER_ID,
    displayName: "Brooke Jenkins",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    isActive: true,
  },
  "user-alex": {
    id: "user-alex",
    displayName: "Alex Kim",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    isActive: true,
  },
  "user-jordan": {
    id: "user-jordan",
    displayName: "Jordan Lee",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    isActive: false,
  },
  "user-taylor": {
    id: "user-taylor",
    displayName: "Taylor Morgan",
    avatarUrl: "https://i.pravatar.cc/150?img=58",
    isActive: true,
  },
  "user-morgan": {
    id: "user-morgan",
    displayName: "Morgan Patel",
    avatarUrl: "https://i.pravatar.cc/150?img=23",
    isActive: false,
  },
};

const conversations = new Map<string, ConversationState>();

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

function toIsoDate(value?: string): string {
  if (value) {
    const timestamp = Date.parse(value);

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }

  return new Date().toISOString();
}

function cloneParticipant(participant: MessengerParticipant): MessengerParticipant {
  return {
    id: participant.id,
    displayName: participant.displayName,
    avatarUrl: participant.avatarUrl ?? null,
    isActive: Boolean(participant.isActive),
  };
}

function resolveParticipant(participantId: string): MessengerParticipant {
  const base = PARTICIPANTS[participantId];

  if (base) {
    return cloneParticipant(base);
  }

  return {
    id: participantId,
    displayName: "Community Member",
    avatarUrl: null,
    isActive: false,
  };
}

function cloneMessage(message: MessengerMessage): MessengerMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: cloneParticipant(message.sender),
    content: message.content,
    createdAt: message.createdAt,
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map((attachment) => ({ ...attachment }))
      : [],
    readAt: message.readAt ?? null,
    status: message.status ?? "sent",
  };
}

function cloneConversation(state: ConversationState): MessengerConversation {
  return {
    id: state.id,
    title: state.title ?? null,
    participants: state.participants.map(cloneParticipant),
    lastMessage: state.lastMessage ? cloneMessage(state.lastMessage) : null,
    unreadCount: state.unreadCount,
    updatedAt: state.updatedAt,
  };
}

function ensureParticipant(state: ConversationState, participantId: string) {
  if (state.participants.some((participant) => participant.id === participantId)) {
    return;
  }

  state.participants.push(resolveParticipant(participantId));
}

function buildMessage(conversationId: string, seed: MessageSeed): MessengerMessage {
  const sender = resolveParticipant(seed.senderId);
  const createdAt = toIsoDate(seed.createdAt);
  const readAt =
    typeof seed.readAt === "string"
      ? toIsoDate(seed.readAt)
      : seed.read
        ? createdAt
        : null;

  return {
    id: seed.id ?? generateId("msg"),
    conversationId,
    sender,
    content: seed.content ?? "",
    createdAt,
    attachments: Array.isArray(seed.attachments)
      ? seed.attachments.map((attachment) => ({ ...attachment }))
      : [],
    readAt,
    status: "sent",
  };
}

function addMessageToConversation(
  state: ConversationState,
  seed: MessageSeed,
  options: { updateUnread: boolean },
): MessengerMessage {
  const message = buildMessage(state.id, seed);
  ensureParticipant(state, message.sender.id);

  const existingIndex = state.messages.findIndex((item) => item.id === message.id);

  if (existingIndex === -1) {
    state.messages.push(message);
  } else {
    state.messages.splice(existingIndex, 1, message);
  }

  state.messages.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  state.lastMessage = state.messages[state.messages.length - 1] ?? null;
  state.updatedAt = state.lastMessage?.createdAt ?? message.createdAt;

  if (options.updateUnread) {
    if (message.sender.id === CURRENT_USER_ID) {
      state.unreadCount = 0;
      message.readAt = message.readAt ?? message.createdAt;
    } else if (!message.readAt) {
      state.unreadCount = Math.min(state.unreadCount + 1, 99);
    }
  }

  return message;
}

function computeUnreadCount(state: ConversationState): number {
  return state.messages.filter((message) => message.sender.id !== CURRENT_USER_ID && !message.readAt).length;
}

function registerConversation(seed: ConversationSeed) {
  const participants = seed.participantIds.map((id) => resolveParticipant(id));

  const state: ConversationState = {
    id: seed.id,
    title: seed.title ?? null,
    participants,
    messages: [],
    lastMessage: null,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  };

  conversations.set(seed.id, state);

  seed.messages.forEach((message) => {
    addMessageToConversation(state, message, { updateUnread: false });
  });

  state.unreadCount = Math.max(0, seed.unreadCount ?? computeUnreadCount(state));

  if (state.lastMessage) {
    state.updatedAt = state.lastMessage.createdAt;
  }
}

const now = Date.now();

const conversationSeeds: ConversationSeed[] = [
  {
    id: "conversation-1",
    title: "Community updates",
    participantIds: [CURRENT_USER_ID, "user-alex"],
    messages: [
      {
        senderId: "user-alex",
        content: "Hey Brooke! Thanks again for helping moderate yesterday's stream.",
        createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
        read: true,
      },
      {
        senderId: CURRENT_USER_ID,
        content: "Of course! The community was so energized. Are we still posting the recap later today?",
        createdAt: new Date(now - 1000 * 60 * 60 * 19).toISOString(),
        read: true,
      },
      {
        senderId: "user-alex",
        content: "Yes! I just uploaded final screenshots to the drive. Let me know if anything's missing.",
        createdAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
        read: false,
      },
    ],
  },
  {
    id: "conversation-2",
    title: "Volunteer meetup",
    participantIds: [CURRENT_USER_ID, "user-jordan", "user-taylor"],
    messages: [
      {
        senderId: "user-taylor",
        content: "Thanks for hosting the planning call earlier!",
        createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
        read: false,
      },
      {
        senderId: "user-jordan",
        content: "I dropped notes in the doc with everyone's action items.",
        createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        read: false,
      },
      {
        senderId: CURRENT_USER_ID,
        content: "Perfect, I'll share the summary post tonight.",
        createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
      },
      {
        senderId: "user-taylor",
        content: "Could you also remind people to bring spare controllers? We were short last time.",
        createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
    ],
  },
  {
    id: "conversation-3",
    title: "Event planning committee",
    participantIds: [CURRENT_USER_ID, "user-morgan"],
    messages: [
      {
        senderId: "user-morgan",
        content: "Venue confirmed for the 28th! I'll send over the contract shortly.",
        createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        read: true,
      },
      {
        senderId: CURRENT_USER_ID,
        content: "Amazing news. I'll update the announcement queue.",
        createdAt: new Date(now - 1000 * 60 * 60 * 47).toISOString(),
        read: true,
      },
    ],
  },
];

conversationSeeds.forEach(registerConversation);

export function listConversations(limit: number, offset: number): {
  conversations: MessengerConversation[];
  total: number;
} {
  const sorted = Array.from(conversations.values()).sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
  const slice = sorted.slice(offset, offset + limit);

  return {
    conversations: slice.map(cloneConversation),
    total: sorted.length,
  };
}

export function getConversation(
  conversationId: string,
  options: { initialMessagesLimit?: number } = {},
): { conversation: MessengerConversation; messages: MessengerMessage[] } | null {
  const state = conversations.get(conversationId);

  if (!state) {
    return null;
  }

  const limit = options.initialMessagesLimit ?? 20;
  const sortedMessages = [...state.messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
  const start = limit > 0 ? Math.max(0, sortedMessages.length - limit) : 0;
  const messages = sortedMessages.slice(start);

  return {
    conversation: cloneConversation(state),
    messages: messages.map(cloneMessage),
  };
}

export function getConversationMessages(
  conversationId: string,
  limit: number,
  before?: string | null,
): MessagesPage | null {
  const state = conversations.get(conversationId);

  if (!state) {
    return null;
  }

  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;
  const sortedMessages = [...state.messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );

  let endIndex = sortedMessages.length;

  if (before) {
    const index = sortedMessages.findIndex((message) => message.id === before);
    endIndex = index === -1 ? sortedMessages.length : index;
  }

  const startIndex = Math.max(0, endIndex - normalizedLimit);
  const slice = sortedMessages.slice(startIndex, endIndex);
  const hasMore = startIndex > 0;
  const nextBefore = hasMore ? slice[0]?.id ?? null : null;

  return {
    messages: slice.map(cloneMessage),
    hasMore,
    nextBefore,
  };
}

export function addMessageFromCurrentUser(
  conversationId: string,
  content: string,
  attachments: MessengerAttachment[] = [],
): MessengerMessage | null {
  const state = conversations.get(conversationId);

  if (!state) {
    return null;
  }

  const createdAt = new Date().toISOString();
  const message = addMessageToConversation(
    state,
    {
      senderId: CURRENT_USER_ID,
      content,
      createdAt,
      attachments,
      read: true,
    },
    { updateUnread: true },
  );

  return cloneMessage(message);
}

export function markConversationRead(
  conversationId: string,
  lastMessageId?: string | null,
): boolean {
  const state = conversations.get(conversationId);

  if (!state) {
    return false;
  }

  const nowIso = new Date().toISOString();

  if (lastMessageId) {
    const targetIndex = state.messages.findIndex((message) => message.id === lastMessageId);

    if (targetIndex !== -1) {
      for (let index = 0; index <= targetIndex; index += 1) {
        const message = state.messages[index];

        if (message.sender.id !== CURRENT_USER_ID && !message.readAt) {
          message.readAt = nowIso;
        }
      }
    }
  } else {
    state.messages.forEach((message) => {
      if (message.sender.id !== CURRENT_USER_ID && !message.readAt) {
        message.readAt = nowIso;
      }
    });
  }

  state.unreadCount = 0;

  return true;
}

export function getCurrentUserId(): string {
  return CURRENT_USER_ID;
}

export function getCurrentUserParticipant(): MessengerParticipant {
  return resolveParticipant(CURRENT_USER_ID);
}
