<template>
  <BaseCard
    as="article"
    variant="solid"
    padding="md"
    rounded="lg"
    spacing="sm"
    :class="[
      'w-full border border-slate-200 bg-white text-slate-800 shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
      depth > 0 ? 'ml-6 border-l border-slate-200/70 pl-6' : '',
    ]"
    header-class="items-start gap-3"
    body-class="space-y-3 text-sm text-slate-700"
    :footer-divider="false"
  >
    <template #header>
      <CommentMeta
        :user="comment.user"
        :default-avatar="avatarFallback"
        :published-label="formatDateTime(comment.publishedAt)"
        :is-authenticated="isAuthenticated"
        :is-author="isAuthor"
        :is-following="isFollowing"
        :follow-loading="followLoading"
        :follow-label="followLabel"
        :follow-loading-label="followLoadingLabel"
        :follow-aria-label="followAriaLabel"
        :following-label="followingLabel"
        :following-aria-label="followingAriaLabel"
        :actions-aria-label="actionsAriaLabel"
        :edit-label="editLabel"
        :delete-label="deleteLabel"
        @follow="handleFollow"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      class="space-y-2 leading-relaxed text-slate-700 [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold"
      v-html="sanitizedContent"
    ></div>

    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-test="comment-like-button"
            :aria-label="commentReactionButtonAriaLabel"
            :aria-pressed="isReacted"
            class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="isReacted
              ? 'border-primary bg-primary text-white hover:border-primary hover:bg-primary/90'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary'"
            :disabled="reacting"
            @click="handleReact"
          >
            <span aria-hidden="true">{{ commentReactionIcon }}</span>
            <span>{{ commentReactionButtonText }}</span>
          </button>

          <div
            v-if="hasReactionPreview"
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span v-for="reaction in comment.reactions_preview" :key="reaction.id" class="text-sm" aria-hidden="true">
              {{ reactionEmojis[reaction.type] }}
            </span>
            <span aria-hidden="true">{{ formatNumber(commentReactionCount) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span aria-hidden="true">👍</span>
            <span aria-hidden="true">{{ formatNumber(commentReactionCount) }}</span>
          </span>
          <span
            :aria-label="replyCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span aria-hidden="true">💬</span>
            <span aria-hidden="true">{{ formatNumber(commentReplyCount) }}</span>
          </span>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            @click="toggleReply"
          >
            <span v-if="replying">{{ t('blog.comments.cancelReply') }}</span>
            <span v-else>{{ t('blog.comments.reply') }}</span>
          </button>
        </div>
      </div>

      <p v-if="reactionError" class="text-xs text-rose-500">
        {{ reactionError }}
      </p>
    </div>

    <form
      v-if="replying"
      class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      @submit.prevent="handleReplySubmit"
    >
      <label class="flex flex-col gap-2 text-xs text-slate-600">
        <span class="sr-only">{{ t('blog.comments.replyPlaceholder') }}</span>
        <textarea
          v-model="replyContent"
          class="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          :placeholder="t('blog.comments.replyPlaceholder')"
        />
      </label>
      <div class="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p
          v-if="replyFeedback"
          :class="replyFeedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'"
        >
          {{ replyFeedback.message }}
        </p>
        <div class="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            @click="cancelReply"
          >
            {{ t('blog.comments.cancelReply') }}
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submittingReply"
          >
            <span v-if="submittingReply">{{ t('blog.comments.replying') }}</span>
            <span v-else>{{ t('blog.comments.replySubmit') }}</span>
          </button>
        </div>
      </div>
    </form>

    <div v-if="hasChildren" class="space-y-3">
      <CommentCard
        v-for="child in childComments"
        :key="child.id"
        :comment="child"
        :default-avatar="avatarFallback"
        :reaction-emojis="reactionEmojis"
        :reaction-labels="reactionLabels"
        :react-to-comment="reactToComment"
        :reply-to-comment="replyToComment"
        :is-authenticated="isAuthenticated"
        :is-author="isAuthor"
        :is-following="isFollowing"
        :follow-loading="followLoading"
        :follow-label="followLabel"
        :follow-loading-label="followLoadingLabel"
        :follow-aria-label="followAriaLabel"
        :following-label="followingLabel"
        :following-aria-label="followingAriaLabel"
        :actions-aria-label="actionsAriaLabel"
        :edit-label="editLabel"
        :delete-label="deleteLabel"
        :follow-comment="followComment"
        :edit-comment="editComment"
        :delete-comment="deleteComment"
        :depth="depth + 1"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CommentMeta from "~/components/blog/CommentMeta.vue";
import { BaseCard } from "~/components/ui";
import type { BlogCommentWithReplies, ReactionAction, ReactionType } from "~/lib/mock/blog";
import { sanitizeRichText } from "~/lib/sanitize-html";

defineOptions({ name: "CommentCard" });

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface ReactionAggregate {
  reactions_count?: number | null;
  likes_count?: number | null;
  likes?: unknown[] | null;
  reactions?: unknown[] | null;
}

interface CommentAggregate {
  totalComments?: number | null;
  children?: unknown;
  comments?: unknown;
  replies?: unknown;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function resolveReactionTotal(entity: ReactionAggregate): number {
  const candidates: Array<number | null> = [
    toFiniteNumber(entity.likes_count ?? null),
    toFiniteNumber(entity.reactions_count ?? null),
  ];

  for (const candidate of candidates) {
    if (candidate !== null) {
      return candidate;
    }
  }

  if (Array.isArray(entity.likes)) {
    return entity.likes.length;
  }

  if (Array.isArray(entity.reactions)) {
    return entity.reactions.length;
  }

  return 0;
}

function resolveReplyTotal(entity: CommentAggregate): number {
  const directTotal = toFiniteNumber(entity.totalComments ?? null);

  if (directTotal !== null) {
    return directTotal;
  }

  const collections = [entity.children, entity.comments, entity.replies];

  for (const candidate of collections) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  return 0;
}

const props = defineProps<{
  comment: BlogCommentWithReplies;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  depth?: number;
  reactToComment?: (commentId: string, reactionType: ReactionAction) => Promise<void> | void;
  replyToComment?: (commentId: string, content: string) => Promise<void> | void;
  isAuthenticated?: boolean;
  isAuthor?: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  followLabel?: string;
  followLoadingLabel?: string;
  followAriaLabel?: string;
  followingLabel?: string;
  followingAriaLabel?: string;
  actionsAriaLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  followComment?: (commentId: string) => Promise<void> | void;
  editComment?: (commentId: string, event: Event) => Promise<void> | void;
  deleteComment?: (commentId: string, event: Event) => Promise<void> | void;
}>();

const { locale, t } = useI18n();

const comment = computed(() => props.comment);
const sanitizedContent = computed(() => sanitizeRichText(comment.value.content));
const depth = computed(() => props.depth ?? 0);
const avatarFallback = computed(() => props.defaultAvatar || "https://bro-world-space.com/img/person.png");
const hasReactionPreview = computed(() => (comment.value.reactions_preview ?? []).length > 0);
const childComments = computed(() => comment.value.comments ?? comment.value.replies ?? comment.value.children ?? []);
const hasChildren = computed(() => childComments.value.length > 0);
const isAuthenticated = computed(() => props.isAuthenticated ?? false);
const isAuthor = computed(() => props.isAuthor ?? false);
const isFollowing = computed(() => props.isFollowing ?? false);
const followLoading = computed(() => props.followLoading ?? false);
const followLabel = computed(() => props.followLabel ?? t("blog.posts.actions.follow"));
const followLoadingLabel = computed(() => props.followLoadingLabel ?? t("blog.posts.actions.following"));
const followAriaLabel = computed(() =>
  props.followAriaLabel ??
  t("blog.posts.actions.followAria", {
    name: `${comment.value.user.firstName} ${comment.value.user.lastName}`,
  }),
);
const followingLabel = computed(() => props.followingLabel ?? t("blog.posts.actions.following"));
const followingAriaLabel = computed(() =>
  props.followingAriaLabel ??
  t("blog.posts.actions.followingAria", {
    name: `${comment.value.user.firstName} ${comment.value.user.lastName}`,
  }),
);
const actionsAriaLabel = computed(() => props.actionsAriaLabel ?? t("blog.posts.actions.openMenu"));
const editLabel = computed(() => props.editLabel ?? t("blog.posts.actions.edit"));
const deleteLabel = computed(() => props.deleteLabel ?? t("blog.posts.actions.delete"));
const followComment = computed(() => props.followComment);
const editComment = computed(() => props.editComment);
const deleteComment = computed(() => props.deleteComment);

const reacting = ref(false);
const reactionError = ref<string | null>(null);
const replying = ref(false);
const submittingReply = ref(false);
const replyContent = ref("");
const replyFeedback = ref<FeedbackState | null>(null);

const commentReactionCount = computed(() => resolveReactionTotal(comment.value as ReactionAggregate));
const commentReplyCount = computed(() => resolveReplyTotal(comment.value as CommentAggregate));
const reactionCountLabel = computed(() =>
  t("blog.reactions.comment.reactions", { count: formatNumber(commentReactionCount.value) }),
);
const replyCountLabel = computed(() =>
  t("blog.reactions.comment.replies", { count: formatNumber(commentReplyCount.value) }),
);
const isReacted = computed(() => Boolean(comment.value.isReacted));
const commentReactionButtonText = computed(() =>
  isReacted.value
    ? t("blog.reactions.comments.unlikeAction")
    : t("blog.reactions.comments.likeAction"),
);
const commentReactionButtonAriaLabel = computed(() => t("blog.reactions.comments.toggleReaction"));
const commentReactionIcon = computed(() => "👍");

watch(
  () => comment.value.id,
  () => {
    replying.value = false;
    submittingReply.value = false;
    replyContent.value = "";
    replyFeedback.value = null;
    reactionError.value = null;
    reacting.value = false;
  },
);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

function toggleReply() {
  replying.value = !replying.value;

  if (!replying.value) {
    replyContent.value = "";
    replyFeedback.value = null;
  }
}

function handleFollow() {
  if (!props.followComment) {
    return;
  }

  void props.followComment(comment.value.id);
}

function handleEdit(event: Event) {
  if (!props.editComment) {
    return;
  }

  void props.editComment(comment.value.id, event);
}

function handleDelete(event: Event) {
  if (!props.deleteComment) {
    return;
  }

  void props.deleteComment(comment.value.id, event);
}

function cancelReply() {
  replying.value = false;
  replyContent.value = "";
  replyFeedback.value = null;
}

async function handleReact() {
  if (reacting.value) {
    return;
  }

  if (!props.reactToComment) {
    reactionError.value = t("blog.comments.reactionUnavailable");
    return;
  }

  reacting.value = true;
  reactionError.value = null;

  try {
    const action: ReactionAction = isReacted.value ? "dislike" : "like";
    await props.reactToComment(comment.value.id, action);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    reactionError.value = message || t("blog.comments.reactionError");
  } finally {
    reacting.value = false;
  }
}

async function handleReplySubmit() {
  replyFeedback.value = null;

  const content = replyContent.value.trim();

  if (!content) {
    replyFeedback.value = {
      type: "error",
      message: t("blog.comments.replyValidation"),
    };
    return;
  }

  if (!props.replyToComment) {
    replyFeedback.value = {
      type: "error",
      message: t("blog.comments.replyUnavailable"),
    };
    return;
  }

  submittingReply.value = true;

  try {
    await props.replyToComment(comment.value.id, content);
    replyFeedback.value = {
      type: "success",
      message: t("blog.comments.replySuccess"),
    };
    replyContent.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    replyFeedback.value = {
      type: "error",
      message: message || t("blog.comments.replyError"),
    };
  } finally {
    submittingReply.value = false;
  }
}
</script>
