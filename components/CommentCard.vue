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

    <p class="leading-relaxed text-slate-700">
      {{ comment.content }}
    </p>

    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="type in reactionTypes"
            :key="type"
            type="button"
            :aria-label="reactionLabels[type]"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-600 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!!reactingType"
            @click="handleReact(type)"
          >
            <span aria-hidden="true">{{ reactionEmojis[type] }}</span>
          </button>

          <div
            v-if="hasReactionPreview"
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span v-for="reaction in comment.reactions_preview" :key="reaction.id" class="text-sm" aria-hidden="true">
              {{ reactionEmojis[reaction.type] }}
            </span>
            <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span aria-hidden="true">👍</span>
            <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
          </span>
          <span
            :aria-label="replyCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm"
          >
            <span aria-hidden="true">💬</span>
            <span aria-hidden="true">{{ formatNumber(comment.totalComments) }}</span>
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
import type { BlogCommentWithReplies, ReactionType } from "~/lib/mock/blog";

defineOptions({ name: "CommentCard" });

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const props = defineProps<{
  comment: BlogCommentWithReplies;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: Record<ReactionType, string>;
  depth?: number;
  reactToComment?: (commentId: string, reactionType: ReactionType) => Promise<void> | void;
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
const depth = computed(() => props.depth ?? 0);
const avatarFallback = computed(() => props.defaultAvatar || "https://bro-world-space.com/img/person.png");
const reactionTypes = computed(() => Object.keys(props.reactionEmojis) as ReactionType[]);
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

const reactingType = ref<ReactionType | null>(null);
const reactionError = ref<string | null>(null);
const replying = ref(false);
const submittingReply = ref(false);
const replyContent = ref("");
const replyFeedback = ref<FeedbackState | null>(null);

const reactionCountLabel = computed(() =>
  t("blog.reactions.comment.reactions", { count: formatNumber(comment.value.reactions_count) }),
);
const replyCountLabel = computed(() =>
  t("blog.reactions.comment.replies", { count: formatNumber(comment.value.totalComments) }),
);

watch(
  () => comment.value.id,
  () => {
    replying.value = false;
    submittingReply.value = false;
    replyContent.value = "";
    replyFeedback.value = null;
    reactionError.value = null;
    reactingType.value = null;
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

async function handleReact(type: ReactionType) {
  if (reactingType.value) {
    return;
  }

  if (!props.reactToComment) {
    reactionError.value = t("blog.comments.reactionUnavailable");
    return;
  }

  reactingType.value = type;
  reactionError.value = null;

  try {
    await props.reactToComment(comment.value.id, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    reactionError.value = message || t("blog.comments.reactionError");
  } finally {
    reactingType.value = null;
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
