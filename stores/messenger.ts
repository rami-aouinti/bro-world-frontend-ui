import { computed, ref, shallowRef, watch } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import { useAuthSession } from "~/stores/auth-session";
import { useMercure } from "~/composables/useMercure";
import type {
  MessengerConversation,
  MessengerConversationEnvelope,
  MessengerMercureEnvelope,
  MessengerMessage,
  MessengerMessagesEnvelope,
  MessengerAttachment,
  MessengerParticipant,
  MessengerSendMessagePayload,
  MessengerThreadEnvelope,
} from "~/types/messenger";
import { useRuntimeConfig, useState } from "#imports";
import { resolveApiFetcher } from "~/lib/api/fetcher";

interface FetchThreadsOptions {
  limit?: number;
  offset?: number;
  force?: boolean;
}

interface FetchMessagesOptions {
  before?: string | null;
  limit?: number;
}

interface NormalizedConversation extends MessengerConversation {
  participants: MessengerParticipant[];
}

interface ConversationPaginationState {
  before: string | null;
  hasMore: boolean;
  pending: boolean;
}

interface SendMessageState {
  pending: boolean;
  error: string | null;
}

const DEFAULT_PREVIEW_LIMIT = 3;
const DEFAULT_LIST_LIMIT = 50;

function isIsoDate(value: string | undefined | null) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function normalizeParticipant(participant: MessengerParticipant): MessengerParticipant {
  return {
    id: participant.id,
    displayName: participant.displayName?.trim() || "",
    avatarUrl: participant.avatarUrl ?? null,
    isActive: participant.isActive ?? false,
  };
}

function normalizeMessage(message: MessengerMessage): MessengerMessage {
  return {
    ...message,
    conversationId: message.conversationId,
    sender: normalizeParticipant(message.sender),
    content: message.content ?? "",
    createdAt: isIsoDate(message.createdAt) ? message.createdAt : new Date().toISOString(),
    attachments: Array.isArray(message.attachments) ? [...message.attachments] : [],
    status: message.status ?? "sent",
    optimistic: Boolean(message.optimistic),
  };
}

function normalizeConversation(conversation: MessengerConversation): NormalizedConversation {
  return {
    id: conversation.id,
    title: conversation.title ?? null,
    participants: Array.isArray(conversation.participants)
      ? conversation.participants.map(normalizeParticipant)
      : [],
    lastMessage: conversation.lastMessage ? normalizeMessage(conversation.lastMessage) : null,
    unreadCount: Math.max(Number(conversation.unreadCount ?? 0), 0),
    updatedAt: isIsoDate(conversation.updatedAt)
      ? conversation.updatedAt
      : (conversation.lastMessage?.createdAt ?? new Date().toISOString()),
  };
}

function sortConversationIds(
  conversations: Record<string, MessengerConversation>,
  ids: string[],
): string[] {
  return [...ids].sort((a, b) => {
    const left = conversations[a]?.updatedAt ?? "";
    const right = conversations[b]?.updatedAt ?? "";

    const leftTimestamp = Date.parse(left);
    const rightTimestamp = Date.parse(right);

    if (Number.isNaN(leftTimestamp) && Number.isNaN(rightTimestamp)) {
      return 0;
    }

    if (Number.isNaN(leftTimestamp)) {
      return 1;
    }

    if (Number.isNaN(rightTimestamp)) {
      return -1;
    }

    return rightTimestamp - leftTimestamp;
  });
}

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  ids.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  });

  return result;
}

function createOptimisticMessage(
  conversationId: string,
  sender: MessengerParticipant,
  content: string,
  attachments: MessengerAttachment[] = [],
): MessengerMessage {
  return {
    id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    conversationId,
    sender,
    content,
    createdAt: new Date().toISOString(),
    status: "pending",
    optimistic: true,
    attachments,
  };
}

export const useMessengerStore = defineStore("messenger", () => {
  const auth = useAuthSession();
  const runtimeConfig = useRuntimeConfig();
  const fetcher = resolveApiFetcher();
  const connectToMercure = import.meta.client ? useMercure() : null;

  const conversations = useState<Record<string, NormalizedConversation>>(
    "messenger-conversations",
    () => ({}),
  );
  const conversationOrder = useState<string[]>("messenger-conversation-order", () => []);
  const messages = useState<Record<string, MessengerMessage[]>>("messenger-messages", () => ({}));
  const pagination = useState<Record<string, ConversationPaginationState>>(
    "messenger-pagination",
    () => ({}),
  );
  const sendState = useState<Record<string, SendMessageState>>("messenger-send-state", () => ({}));
  const activeConversationId = useState<string | null>("messenger-active-id", () => null);
  const previewFetchedAt = useState<number | null>("messenger-preview-fetched", () => null);
  const loadingPreview = useState<boolean>("messenger-preview-loading", () => false);
  const loadingList = useState<boolean>("messenger-list-loading", () => false);
  const loadingMessages = useState<Record<string, boolean>>(
    "messenger-messages-loading",
    () => ({}),
  );
  const lastReadMessage = useState<Record<string, string | null>>(
    "messenger-last-read",
    () => ({}),
  );
  const errorState = useState<string | null>("messenger-error", () => null);

  const inboxSource = shallowRef<EventSource | null>(null);
  const conversationSource = shallowRef<EventSource | null>(null);
  const conversationSubscriptionId = ref<string | null>(null);

  function resetState() {
    conversations.value = {};
    conversationOrder.value = [];
    messages.value = {};
    pagination.value = {} as Record<string, ConversationPaginationState>;
    sendState.value = {} as Record<string, SendMessageState>;
    activeConversationId.value = null;
    previewFetchedAt.value = null;
    loadingPreview.value = false;
    loadingList.value = false;
    loadingMessages.value = {} as Record<string, boolean>;
    lastReadMessage.value = {} as Record<string, string | null>;
    errorState.value = null;
    closeInboxSource();
    closeConversationSource();
  }

  function closeInboxSource() {
    if (inboxSource.value) {
      inboxSource.value.close();
      inboxSource.value = null;
    }
  }

  function closeConversationSource() {
    if (conversationSource.value) {
      conversationSource.value.close();
      conversationSource.value = null;
    }

    conversationSubscriptionId.value = null;
  }

  function upsertConversation(conversation: MessengerConversation) {
    const normalized = normalizeConversation(conversation);

    conversations.value = {
      ...conversations.value,
      [normalized.id]: {
        ...(conversations.value[normalized.id] ?? normalized),
        ...normalized,
      },
    };

    const mergedOrder = uniqueIds([normalized.id, ...conversationOrder.value]);
    conversationOrder.value = sortConversationIds(conversations.value, mergedOrder);
  }

  function setConversations(list: MessengerConversation[]) {
    const mapped: Record<string, NormalizedConversation> = {};
    const ids: string[] = [];

    list.forEach((conversation) => {
      const normalized = normalizeConversation(conversation);
      mapped[normalized.id] = {
        ...(conversations.value[normalized.id] ?? normalized),
        ...normalized,
      };
      ids.push(normalized.id);
    });

    conversations.value = {
      ...conversations.value,
      ...mapped,
    };

    const combinedIds = uniqueIds([...ids, ...conversationOrder.value]);
    conversationOrder.value = sortConversationIds(conversations.value, combinedIds);
  }

  function getMessagesState(conversationId: string) {
    return messages.value[conversationId] ?? [];
  }

  function setMessages(conversationId: string, list: MessengerMessage[]) {
    const normalized = list.map(normalizeMessage);

    messages.value = {
      ...messages.value,
      [conversationId]: normalized.sort((a, b) => {
        const left = Date.parse(a.createdAt);
        const right = Date.parse(b.createdAt);

        if (Number.isNaN(left) || Number.isNaN(right)) {
          return 0;
        }

        return left - right;
      }),
    };
  }

  function appendMessage(conversationId: string, message: MessengerMessage) {
    const current = getMessagesState(conversationId);
    const normalized = normalizeMessage(message);

    if (current.some((entry) => entry.id === normalized.id)) {
      return;
    }

    const next = [...current, normalized].sort((a, b) => {
      const left = Date.parse(a.createdAt);
      const right = Date.parse(b.createdAt);

      if (Number.isNaN(left) || Number.isNaN(right)) {
        return 0;
      }

      return left - right;
    });

    messages.value = {
      ...messages.value,
      [conversationId]: next,
    };
  }

  function replaceMessage(
    conversationId: string,
    optimisticId: string,
    replacement: MessengerMessage,
  ) {
    const current = getMessagesState(conversationId);
    const index = current.findIndex((message) => message.id === optimisticId);

    if (index === -1) {
      appendMessage(conversationId, replacement);
      return;
    }

    const updated = [...current];
    updated.splice(index, 1, normalizeMessage(replacement));

    messages.value = {
      ...messages.value,
      [conversationId]: updated,
    };
  }

  function markMessageAsError(conversationId: string, messageId: string) {
    const current = getMessagesState(conversationId);
    const index = current.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return;
    }

    const updated = [...current];
    updated.splice(index, 1, {
      ...current[index],
      status: "error",
      optimistic: false,
    });

    messages.value = {
      ...messages.value,
      [conversationId]: updated,
    };
  }

  function removeMessage(conversationId: string, messageId: string) {
    const current = getMessagesState(conversationId);

    if (!current.some((message) => message.id === messageId)) {
      return;
    }

    messages.value = {
      ...messages.value,
      [conversationId]: current.filter((message) => message.id !== messageId),
    };
  }

  function setPagination(conversationId: string, state: Partial<ConversationPaginationState>) {
    const previous = pagination.value[conversationId] ?? {
      before: null,
      hasMore: false,
      pending: false,
    };

    pagination.value = {
      ...pagination.value,
      [conversationId]: {
        ...previous,
        ...state,
      },
    };
  }

  function setSendState(conversationId: string, state: Partial<SendMessageState>) {
    const previous = sendState.value[conversationId] ?? { pending: false, error: null };

    sendState.value = {
      ...sendState.value,
      [conversationId]: {
        ...previous,
        ...state,
      },
    };
  }

  function markConversationReadLocal(conversationId: string, lastMessageId: string | null) {
    const conversation = conversations.value[conversationId];

    if (!conversation) {
      return;
    }

    conversations.value = {
      ...conversations.value,
      [conversationId]: {
        ...conversation,
        unreadCount: 0,
      },
    };

    lastReadMessage.value = {
      ...lastReadMessage.value,
      [conversationId]: lastMessageId ?? conversation.lastMessage?.id ?? null,
    };
  }

  async function fetchThreads(options: FetchThreadsOptions = {}) {
    if (loadingPreview.value || loadingList.value) {
      if (!options.force) {
        return;
      }
    }

    const limit = options.limit ?? DEFAULT_LIST_LIMIT;
    const offset = options.offset ?? 0;
    const now = Date.now();

    if (!options.force && limit <= DEFAULT_PREVIEW_LIMIT && previewFetchedAt.value) {
      if (now - previewFetchedAt.value < 30_000) {
        return;
      }
    }

    const params: Record<string, string | number> = { limit, offset };
    const isPreview = limit <= DEFAULT_PREVIEW_LIMIT;

    if (isPreview) {
      loadingPreview.value = true;
    } else {
      loadingList.value = true;
    }

    try {
      errorState.value = null;
      const response = await fetcher<MessengerThreadEnvelope | MessengerConversation[]>(
        "/v1/messenger/threads",
        {
          method: "GET",
          params,
        },
      );

      const data = Array.isArray((response as MessengerThreadEnvelope)?.data)
        ? (response as MessengerThreadEnvelope).data
        : Array.isArray(response)
          ? response
          : [];

      if (data.length) {
        setConversations(data);
        if (isPreview) {
          previewFetchedAt.value = now;
        }
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error("Failed to fetch messenger threads", error);
      }
      errorState.value = error instanceof Error ? error.message : "Unable to load conversations.";
    } finally {
      if (isPreview) {
        loadingPreview.value = false;
      } else {
        loadingList.value = false;
      }
    }
  }

  async function fetchConversation(conversationId: string) {
    try {
      errorState.value = null;
      const response = await fetcher<
        MessengerConversationEnvelope | (MessengerConversation & { messages?: MessengerMessage[] })
      >(`/v1/messenger/threads/${conversationId}`);

      const payload = (response as MessengerConversationEnvelope)?.data
        ? (response as MessengerConversationEnvelope).data
        : (response as MessengerConversation & { messages?: MessengerMessage[] });

      if (!payload) {
        return null;
      }

      const { messages: initialMessages = [], ...conversation } = payload;
      upsertConversation(conversation);

      if (Array.isArray(initialMessages) && initialMessages.length) {
        setMessages(conversationId, initialMessages);
      }

      return conversations.value[conversationId] ?? null;
    } catch (error) {
      if (import.meta.dev) {
        console.error(`Failed to fetch conversation ${conversationId}`, error);
      }

      errorState.value = error instanceof Error ? error.message : "Unable to load conversation.";
      return null;
    }
  }

  async function fetchMessages(conversationId: string, options: FetchMessagesOptions = {}) {
    const state = pagination.value[conversationId] ?? {
      before: null,
      hasMore: true,
      pending: false,
    };

    if (state.pending) {
      return;
    }

    if (!state.hasMore && !options.before) {
      return;
    }

    const before = options.before ?? state.before;
    const limit = options.limit ?? 50;

    setPagination(conversationId, { pending: true });
    loadingMessages.value = {
      ...loadingMessages.value,
      [conversationId]: true,
    };

    try {
      const response = await fetcher<MessengerMessagesEnvelope | MessengerMessage[]>(
        `/v1/messenger/threads/${conversationId}/messages`,
        {
          method: "GET",
          params: {
            before: before ?? undefined,
            limit,
          },
        },
      );

      const list = Array.isArray((response as MessengerMessagesEnvelope)?.data)
        ? (response as MessengerMessagesEnvelope).data
        : Array.isArray(response)
          ? response
          : [];

      if (!list.length) {
        setPagination(conversationId, { pending: false, hasMore: false });
        return;
      }

      const current = getMessagesState(conversationId);
      const normalized = list.map(normalizeMessage);
      const merged = uniqueIds([
        ...normalized.map((message) => message.id),
        ...current.map((message) => message.id),
      ]);

      const mergedMessages = merged
        .map(
          (id) =>
            normalized.find((message) => message.id === id) ??
            current.find((message) => message.id === id)!,
        )
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

      messages.value = {
        ...messages.value,
        [conversationId]: mergedMessages,
      };

      const lastItem = normalized[0];

      setPagination(conversationId, {
        pending: false,
        hasMore: Boolean(
          (response as MessengerMessagesEnvelope)?.hasMore ?? normalized.length === limit,
        ),
        before: lastItem?.id ?? null,
      });
    } catch (error) {
      if (import.meta.dev) {
        console.error(`Failed to fetch messages for conversation ${conversationId}`, error);
      }

      setPagination(conversationId, { pending: false });
    } finally {
      loadingMessages.value = {
        ...loadingMessages.value,
        [conversationId]: false,
      };
    }
  }

  async function markConversationRead(conversationId: string, lastMessageId?: string | null) {
    const conversation = conversations.value[conversationId];

    if (!conversation) {
      return;
    }

    const lastMessage = lastMessageId ?? conversation.lastMessage?.id ?? null;
    markConversationReadLocal(conversationId, lastMessage);

    try {
      await fetcher(`/v1/messenger/threads/${conversationId}/read`, {
        method: "POST",
        body: lastMessage ? { lastMessageId: lastMessage } : undefined,
      });
    } catch (error) {
      if (import.meta.dev) {
        console.error(`Failed to mark conversation ${conversationId} as read`, error);
      }
    }
  }

  async function sendMessage(conversationId: string, payload: MessengerSendMessagePayload) {
    const conversation = conversations.value[conversationId];
    const currentUser = auth.currentUser.value;

    if (!conversation || !currentUser) {
      throw new Error("A conversation and authenticated user are required to send messages.");
    }

    const sender: MessengerParticipant = {
      id: currentUser.id,
      displayName:
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
        currentUser.username ||
        "You",
      avatarUrl: currentUser.photo ?? null,
    };

    const normalizedAttachments = Array.isArray(payload.attachments)
      ? payload.attachments
          .filter((attachment) => Boolean(attachment?.url))
          .map((attachment) => ({
            id: attachment.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: attachment.name?.trim() || "Attachment",
            url: attachment.url,
            mimeType: attachment.mimeType ?? undefined,
            size: attachment.size ?? undefined,
          }))
      : [];

    const trimmedContent = payload.content?.trim() ?? "";
    const hasContent = trimmedContent.length > 0;

    if (!hasContent && normalizedAttachments.length === 0) {
      return null;
    }

    const fallbackContent = hasContent
      ? trimmedContent
      : normalizedAttachments.length > 1
        ? `${normalizedAttachments.length} attachments`
        : (normalizedAttachments[0]?.name ?? "Attachment");

    const optimistic = createOptimisticMessage(
      conversationId,
      sender,
      fallbackContent,
      normalizedAttachments,
    );
    appendMessage(conversationId, optimistic);
    setSendState(conversationId, { pending: true, error: null });

    try {
      const response = await fetcher<MessengerMessage>(
        `/v1/messenger/threads/${conversationId}/messages`,
        {
          method: "POST",
          body: {
            content: fallbackContent,
            attachments: normalizedAttachments,
          },
        },
      );

      if (response && response.id) {
        replaceMessage(conversationId, optimistic.id, {
          ...response,
          status: "sent",
          optimistic: false,
        });
      } else {
        removeMessage(conversationId, optimistic.id);
      }

      setSendState(conversationId, { pending: false, error: null });

      upsertConversation({
        ...conversation,
        lastMessage: normalizeMessage(response ?? optimistic),
        updatedAt: (response ?? optimistic).createdAt,
        unreadCount: 0,
      });

      return response ?? optimistic;
    } catch (error) {
      setSendState(conversationId, {
        pending: false,
        error: error instanceof Error ? error.message : "Unable to send message.",
      });
      markMessageAsError(conversationId, optimistic.id);

      if (import.meta.dev) {
        console.error(`Failed to send message in conversation ${conversationId}`, error);
      }

      return null;
    }
  }

  async function openConversation(conversationId: string) {
    if (!conversationId) {
      return null;
    }

    activeConversationId.value = conversationId;

    if (!conversations.value[conversationId]) {
      await fetchConversation(conversationId);
    }

    if (!messages.value[conversationId]) {
      await fetchConversation(conversationId);
    }

    await fetchMessages(conversationId, { limit: 50 });
    await subscribeToConversation(conversationId);

    return conversations.value[conversationId] ?? null;
  }

  function handleMercurePayload(payload: MessengerMercureEnvelope) {
    if (!payload?.conversationId) {
      return;
    }

    const conversationId = payload.conversationId;

    switch (payload.type) {
      case "message.created": {
        if (!payload.message) {
          return;
        }

        const normalized = normalizeMessage(payload.message);
        appendMessage(conversationId, { ...normalized, status: "sent", optimistic: false });

        const conversation = conversations.value[conversationId];
        const unreadCount =
          conversationId === activeConversationId.value
            ? 0
            : (payload.unreadCount ?? (conversation?.unreadCount ?? 0) + 1);

        upsertConversation({
          ...(conversation ?? {
            id: conversationId,
            participants: normalized.sender ? [normalized.sender] : [],
            lastMessage: normalized,
            unreadCount,
            updatedAt: normalized.createdAt,
          }),
          lastMessage: normalized,
          unreadCount,
          updatedAt: normalized.createdAt,
        });

        if (conversationId === activeConversationId.value) {
          markConversationReadLocal(conversationId, normalized.id);
        }

        break;
      }

      case "conversation.updated": {
        const conversation = conversations.value[conversationId];
        const lastMessage = payload.lastMessage
          ? normalizeMessage(payload.lastMessage)
          : (conversation?.lastMessage ?? null);

        upsertConversation({
          ...(conversation ?? {
            id: conversationId,
            participants: lastMessage ? [lastMessage.sender] : [],
            lastMessage,
            unreadCount: payload.unreadCount ?? 0,
            updatedAt: lastMessage?.createdAt ?? new Date().toISOString(),
          }),
          lastMessage,
          unreadCount: payload.unreadCount ?? conversation?.unreadCount ?? 0,
          updatedAt: lastMessage?.createdAt ?? conversation?.updatedAt ?? new Date().toISOString(),
        });

        break;
      }

      case "message.read": {
        if (payload.userId && payload.userId !== auth.currentUser.value?.id) {
          break;
        }

        markConversationReadLocal(conversationId, payload.lastReadMessageId ?? null);
        break;
      }

      default:
        break;
    }
  }

  function bindEventSource(source: EventSource | null) {
    if (!source) {
      return;
    }

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as MessengerMercureEnvelope;
        handleMercurePayload(payload);
      } catch (error) {
        if (import.meta.dev) {
          console.error("Failed to parse Mercure payload", error);
        }
      }
    };

    source.onerror = (event) => {
      if (import.meta.dev) {
        console.error("Mercure connection error", event);
      }
    };
  }

  async function ensureMercureToken(): Promise<string | null> {
    const configuredToken = runtimeConfig.public?.mercure?.token ?? null;

    if (configuredToken) {
      return configuredToken;
    }

    const token = auth.mercureToken.value;

    if (token) {
      return token;
    }

    const refreshed = await auth.refreshMercureToken();
    return refreshed?.token ?? null;
  }

  async function connectInbox() {
    if (import.meta.server) {
      return null;
    }

    if (inboxSource.value) {
      return inboxSource.value;
    }

    const userId = auth.currentUser.value?.id;
    const hubUrl = runtimeConfig.public?.mercure?.hubUrl ?? null;

    if (!userId || !hubUrl) {
      return null;
    }

    if (!connectToMercure) {
      return null;
    }

    try {
      const token = await ensureMercureToken();

      inboxSource.value = connectToMercure(hubUrl, {
        token: token ?? undefined,
        params: {
          topic: `/messenger/users/${userId}`,
        },
      });
      bindEventSource(inboxSource.value);
      return inboxSource.value;
    } catch (error) {
      if (import.meta.dev) {
        console.error("Failed to connect to inbox Mercure topic", error);
      }

      return null;
    }
  }

  async function subscribeToConversation(conversationId: string) {
    if (import.meta.server) {
      return;
    }

    if (!conversationId) {
      return;
    }

    if (conversationSubscriptionId.value === conversationId) {
      return;
    }

    const hubUrl = runtimeConfig.public?.mercure?.hubUrl ?? null;

    if (!hubUrl || !connectToMercure) {
      return;
    }

    try {
      const token = await ensureMercureToken();
      closeConversationSource();

      conversationSource.value = connectToMercure(hubUrl, {
        token: token ?? undefined,
        params: {
          topic: `/messenger/conversations/${conversationId}`,
        },
      });
      conversationSubscriptionId.value = conversationId;
      bindEventSource(conversationSource.value);
    } catch (error) {
      if (import.meta.dev) {
        console.error(`Failed to subscribe to conversation ${conversationId}`, error);
      }
    }
  }

  watch(
    () => auth.currentUser.value?.id ?? null,
    (userId, previousUserId) => {
      if (userId === previousUserId) {
        return;
      }

      resetState();

      if (!userId) {
        return;
      }

      fetchThreads({ limit: DEFAULT_PREVIEW_LIMIT }).catch(() => {});
      connectInbox()?.catch(() => {});
    },
    { immediate: true },
  );

  const previewConversations = computed(() =>
    conversationOrder.value
      .slice(0, DEFAULT_PREVIEW_LIMIT)
      .map((id) => conversations.value[id])
      .filter(Boolean),
  );

  const orderedConversations = computed(() =>
    conversationOrder.value.map((id) => conversations.value[id]).filter(Boolean),
  );

  const unreadTotal = computed(() =>
    orderedConversations.value.reduce(
      (total, conversation) => total + (conversation?.unreadCount ?? 0),
      0,
    ),
  );

  const activeConversation = computed(() => {
    if (!activeConversationId.value) {
      return null;
    }

    return conversations.value[activeConversationId.value] ?? null;
  });

  const currentMessages = computed(() => {
    if (!activeConversationId.value) {
      return [] as MessengerMessage[];
    }

    return messages.value[activeConversationId.value] ?? [];
  });

  const sendingMessage = computed(() => {
    if (!activeConversationId.value) {
      return false;
    }

    return sendState.value[activeConversationId.value]?.pending ?? false;
  });

  const sendError = computed(() => {
    if (!activeConversationId.value) {
      return null as string | null;
    }

    return sendState.value[activeConversationId.value]?.error ?? null;
  });

  const hasConversations = computed(() => orderedConversations.value.length > 0);
  const latestConversationId = computed(() => conversationOrder.value[0] ?? null);

  return {
    conversations,
    conversationOrder,
    messages,
    pagination,
    sendState,
    activeConversationId,
    loadingPreview,
    loadingList,
    loadingMessages,
    errorState,
    previewConversations,
    orderedConversations,
    unreadTotal,
    activeConversation,
    currentMessages,
    sendingMessage,
    sendError,
    hasConversations,
    latestConversationId,
    lastReadMessage,
    fetchThreads,
    fetchConversation,
    fetchMessages,
    markConversationRead,
    sendMessage,
    openConversation,
    setPagination,
    getMessagesState,
    appendMessage,
    markConversationReadLocal,
    connectInbox,
    subscribeToConversation,
    resetState,
  };
});
