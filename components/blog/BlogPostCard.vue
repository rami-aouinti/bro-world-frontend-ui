<template>
  <BaseCard
      as="article"
      variant="solid"
      padding="lg"
      rounded="xl"
      spacing="lg"
      class="group relative w-full max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-xl"
      header-class="gap-4"
      body-class="space-y-6 text-slate-700"
      footer-class="flex flex-wrap items-center gap-3 text-sm text-slate-600"
      :footer-divider="false"
  >
    <template #header>
      <PostMeta
          :user="post.user"
          :default-avatar="defaultAvatar"
          :published-label="publishedLabel"
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
          @edit="openEditModal"
          @delete="openDeleteDialog"
      />
    </template>

    <section class="space-y-3">
      <RadiantText
          class="inline-flex items-center justify-start px-2 py-1 text-balance text-slate-600 transition-colors duration-300 hover:text-primary"
          :duration="5"
      >
        <span class="text-2xl font-semibold text-slate-900 sm:text-[1.75rem]">{{ post.title }}</span>
      </RadiantText>
      <p class="text-base leading-relaxed text-slate-600">
        {{ post.summary }}
      </p>
    </section>

    <section
        ref="commentsSectionRef"
        class="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
    >
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          {{ reactionPromptLabel }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <button
              type="button"
              data-test="post-like-button"
              :aria-label="postReactionButtonAriaLabel"
              :aria-pressed="isPostReacted"
              class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              :class="isPostReacted
              ? 'border-primary bg-primary text-white hover:border-primary hover:bg-primary/90'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary'"
              :disabled="postReacting || !isAuthenticated"
              @click="handleTogglePostReaction"
          >
            <span aria-hidden="true">{{ postReactionIcon }}</span>
            <span>{{ postReactionButtonText }}</span>
          </button>
        </div>
        <p v-if="!isAuthenticated" class="text-xs text-slate-500">
          {{ loginToReactMessage }}
        </p>
        <p v-if="postReactionError" class="text-xs text-rose-500">
          {{ postReactionError }}
        </p>
      </div>

      <form
          v-if="isAuthenticated"
          class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          @submit.prevent="handleCommentSubmit"
      >
        <div class="flex items-start gap-3">
          <div class="hidden h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:block">
            <img
                :src="post.user.photo ?? defaultAvatar"
                :alt="`${post.user.firstName} ${post.user.lastName}`"
                class="h-full w-full object-cover"
                loading="lazy"
            />
          </div>
          <label class="flex w-full flex-col gap-2 text-sm text-slate-600">
            <span class="font-semibold text-slate-700">
              {{ commentComposerLabel }}
            </span>
            <textarea
                v-model="commentContent"
                class="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                :placeholder="commentPlaceholder"
            />
          </label>
        </div>
        <div class="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p
              v-if="commentFeedback"
              :class="commentFeedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ commentFeedback.message }}
          </p>
          <div class="flex items-center gap-3 sm:justify-end">
            <span class="text-slate-500">{{ commentCharacterCountLabel }}</span>
            <button
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="submittingComment"
            >
              <span v-if="submittingComment">{{ t("blog.comments.submitting") }}</span>
              <span v-else>{{ t("blog.comments.submit") }}</span>
            </button>
          </div>
        </div>
      </form>
      <div
          v-else
          class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm"
      >
        <p>{{ loginToCommentMessage }}</p>
      </div>
    </section>

    <div
        v-if="hasReactionPreview"
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      <div class="flex flex-wrap gap-2">
        <div
            v-for="reaction in topReactions"
            :key="reaction.id"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-slate-700 shadow-sm"
        >
          <span class="sr-only">{{ reactionLabels[reaction.type] }}</span>
          <span aria-hidden="true" class="text-lg">{{ reactionEmojis[reaction.type] }}</span>
        </div>
      </div>
    </div>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <header class="flex items-center justify-between border-b border-slate-200 pb-3">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">
          {{ recentCommentsLabel }}
        </p>
        <p class="text-xs text-slate-500">
          {{ commentPreviewCountLabel }}
        </p>
      </header>
      <div
          v-if="commentsActivationPending"
          class="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600"
          data-test="comments-activation-placeholder"
          role="status"
          aria-live="polite"
      >
        <p>{{ commentsActivationHint }}</p>
        <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-primary bg-white px-4 py-2 font-semibold text-primary shadow-sm transition-colors duration-200 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            data-test="load-comments-button"
            @click="handleManualCommentsLoad"
        >
          {{ loadCommentsLabel }}
        </button>
      </div>
      <div v-else-if="commentsLoading" class="w-full space-y-4 pt-3">
        <div class="px-2 text-sm text-slate-500">
          {{ t('blog.comments.loading') }}
        </div>
      </div>
      <div v-else-if="commentsError" class="space-y-3 px-2 text-sm text-rose-500">
        <p>{{ commentsError }}</p>
        <button
            type="button"
            class="inline-flex w-max items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-600 shadow-sm transition-colors duration-200 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            data-test="load-comments-button"
            @click="handleManualCommentsLoad"
        >
          {{ loadCommentsLabel }}
        </button>
      </div>
      <div v-else-if="hasCommentPreview" class="w-full space-y-4 pt-3">
        <CommentCard
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            :default-avatar="defaultAvatar"
            :reaction-emojis="reactionEmojis"
            :reaction-labels="reactionLabels"
            :react-to-comment="handleCommentReaction"
            :reply-to-comment="handleCommentReply"
            class="w-full"
        />
      </div>
      <p v-else class="px-2 text-sm text-slate-500">
        {{ t('blog.comments.empty') }}
      </p>
    </section>

    <template #footer>
      <div
          class="flex flex-wrap items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
          :aria-label="metaAriaLabel"
          aria-live="polite"
          data-test="post-meta-bar"
      >
        <span class="inline-flex items-center gap-1">
          <span aria-hidden="true">❤️</span>
          <span>{{ reactionCountDisplay }}</span>
        </span>
        <span aria-hidden="true" class="text-slate-400">•</span>
        <span class="inline-flex items-center gap-1">
          <span aria-hidden="true">💬</span>
          <span>{{ commentCountDisplay }}</span>
        </span>
      </div>
    </template>
  </BaseCard>

  <teleport to="body">
    <transition name="fade-scale">
      <div
          v-if="editModalOpen"
          class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"
          aria-modal="true"
          role="dialog"
          :aria-label="editModalTitle"
          @keydown="handleEditKeydown"
      >
        <div
            ref="editDialogRef"
            class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-left text-slate-100 shadow-xl"
            tabindex="-1"
        >
          <header class="space-y-1">
            <h2 class="text-xl font-semibold">{{ editModalTitle }}</h2>
            <p class="text-sm text-slate-400">{{ editModalDescription }}</p>
          </header>
          <form class="mt-6 space-y-5" @submit.prevent="handleSaveEdit">
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{ t('blog.posts.actions.fields.title') }}</span>
              <input
                  ref="editTitleRef"
                  v-model="editForm.title"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{ t('blog.posts.actions.fields.summary') }}</span>
              <textarea
                  ref="editSummaryRef"
                  v-model="editForm.summary"
                  class="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{ t('blog.posts.actions.fields.content') }}</span>
              <textarea
                  v-model="editForm.content"
                  class="min-h-[180px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  @click="closeEditModal"
              >
                {{ editModalCancelLabel }}
              </button>
              <button
                  type="submit"
                  class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="saveLoading"
              >
                <span v-if="saveLoading" class="inline-flex items-center gap-2">
                  <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  <span>{{ editModalSaveLabel }}</span>
                </span>
                <span v-else>{{ editModalSaveLabel }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>

  <teleport to="body">
    <transition name="fade-scale">
      <div
          v-if="deleteDialogOpen"
          class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"
          role="alertdialog"
          :aria-label="deleteDialogTitle"
          aria-modal="true"
          @keydown="handleDeleteKeydown"
      >
        <div
            ref="deleteDialogRef"
            class="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-left text-slate-100 shadow-xl"
            tabindex="-1"
        >
          <header class="space-y-2">
            <h2 class="text-xl font-semibold text-rose-200">{{ deleteDialogTitle }}</h2>
            <p class="text-sm text-slate-400">{{ deleteDialogDescription }}</p>
          </header>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click="closeDeleteDialog"
            >
              {{ deleteDialogCancelLabel }}
            </button>
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="deleteLoading"
                @click="handleDeletePost"
            >
              <span v-if="deleteLoading" class="inline-flex items-center gap-2">
                <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                <span>{{ deleteDialogConfirmLabel }}</span>
              </span>
              <span v-else>{{ deleteDialogConfirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, shallowRef, watch } from "vue";
import { useElementVisibility } from "@vueuse/core";

import CommentCard from "~/components/blog/BlogCommentCard.vue";
import { BaseCard } from "~/components/ui";
import PostMeta from "~/components/blog/PostMeta.vue";
import { formatMetricNumber, resolveCommentTotal, resolveReactionTotal } from "~/lib/blogMetrics";
import type { CommentAggregate, ReactionAggregate } from "~/lib/blogMetrics";
import type { BlogCommentWithReplies, BlogPost, ReactionAction, ReactionType } from "~/lib/mock/blog";
import { usePostsStore } from "~/composables/usePostsStore";
import { useAuthStore } from "~/composables/useAuthStore";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const props = defineProps<{
  post: BlogPost;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: Record<ReactionType, string>;
}>();

const { locale, t } = useI18n();
const { $notify } = useNuxtApp();
const {
  reactToPost,
  addComment,
  reactToComment,
  getComments,
  updatePost,
  deletePost,
} = usePostsStore();
const {
  currentUser,
  isAuthenticated: isAuthenticatedComputed,
  following,
  followPending,
  followAuthor,
  resetFollowError,
} = useAuthStore();

const post = computed(() => props.post);
const reactionLabels = computed(() => props.reactionLabels);

const postReacting = ref(false);
const postReactionError = ref<string | null>(null);
const commentContent = ref("");
const submittingComment = ref(false);
const commentFeedback = ref<FeedbackState | null>(null);
const loadedComments = ref<BlogCommentWithReplies[] | null>(null);
const commentsLoading = ref(false);
const commentsError = ref<string | null>(null);
const activeCommentsRequest = shallowRef<Promise<void> | null>(null);
const commentsSectionRef = ref<HTMLElement | null>(null);
const isCommentsSectionVisible = useElementVisibility(commentsSectionRef);
const commentsActivated = ref(false);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value ?? "fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return formatMetricNumber(value, locale.value ?? "fr-FR");
}

const publishedLabel = computed(() =>
    t("blog.reactions.posts.publishedOn", { date: formatDateTime(post.value.publishedAt) }),
);

const isAuthenticated = computed(() => isAuthenticatedComputed.value);
const isAuthor = computed(() => isAuthenticated.value && currentUser.value?.id === post.value.user.id);
const isFollowing = computed(() => Boolean(following.value?.[post.value.user.id]));
const followLoading = computed(() => Boolean(followPending.value?.[post.value.user.id]));

const followLabel = computed(() => t("blog.posts.actions.follow"));
const followLoadingLabel = computed(() => t("blog.posts.actions.following"));
const followAriaLabel = computed(() =>
    t("blog.posts.actions.followAria", {
      name: `${post.value.user.firstName} ${post.value.user.lastName}`,
    }),
);
const followingLabel = computed(() => t("blog.posts.actions.following"));
const followingAriaLabel = computed(() =>
    t("blog.posts.actions.followingAria", {
      name: `${post.value.user.firstName} ${post.value.user.lastName}`,
    }),
);
const actionsAriaLabel = computed(() => t("blog.posts.actions.openMenu"));
const editLabel = computed(() => t("blog.posts.actions.edit"));
const deleteLabel = computed(() => t("blog.posts.actions.delete"));

const metaAriaLabel = computed(() =>
    t("blog.posts.actions.statistics", {
      reactions: reactionCountDisplay.value,
      comments: commentCountDisplay.value,
    }),
);

const postReactionCount = computed(() => resolveReactionTotal(post.value as ReactionAggregate));
const loadedCommentCount = computed(() => {
  if (!Array.isArray(loadedComments.value)) {
    return null;
  }

  return countComments(loadedComments.value);
});

const postCommentCount = computed(() => {
  if (typeof loadedCommentCount.value === "number") {
    return loadedCommentCount.value;
  }

  return resolveCommentTotal(post.value as CommentAggregate);
});

const reactionCountDisplay = computed(() => formatNumber(postReactionCount.value));
const commentCountDisplay = computed(() => formatNumber(postCommentCount.value));
const isPostReacted = computed(() => Boolean(post.value.isReacted));
const postReactionButtonText = computed(() =>
    isPostReacted.value
        ? t("blog.reactions.posts.unlikeAction")
        : t("blog.reactions.posts.likeAction"),
);
const postReactionButtonAriaLabel = computed(() => t("blog.reactions.posts.toggleReaction"));
const postReactionIcon = computed(() => "👍");

const recentCommentsLabel = computed(() => t("blog.reactions.posts.recentComments"));

const commentPreviewCountLabel = computed(() =>
    t("blog.reactions.posts.previewCount", {
      count: formatNumber(postCommentCount.value),
    }),
);

const comments = computed(() => {
  if (Array.isArray(loadedComments.value)) {
    return loadedComments.value;
  }

  if (Array.isArray(post.value.comments_preview) && post.value.comments_preview.length > 0) {
    return post.value.comments_preview;
  }

  const directComments = (post.value as Record<string, unknown>).comments;

  if (Array.isArray(directComments) && directComments.length > 0) {
    return directComments as typeof post.value.comments_preview;
  }

  const childComments = (post.value as Record<string, unknown>).children;

  if (Array.isArray(childComments) && childComments.length > 0) {
    return childComments as typeof post.value.comments_preview;
  }

  return post.value.comments_preview ?? [];
});
const topReactions = computed(() => post.value.reactions_preview.slice(0, 4));
const hasCommentPreview = computed(() => comments.value.length > 0);
const hasReactionPreview = computed(() => topReactions.value.length > 0);

const reactionPromptLabel = computed(() => t("blog.reactions.posts.reactLabel"));
const loginToReactMessage = computed(() => t("blog.auth.reactionRequired"));
const commentPlaceholder = computed(() => t("blog.comments.placeholder"));
const commentComposerLabel = computed(() => t("blog.comments.label"));
const commentCharacterCountLabel = computed(() => {
  const length = commentContent.value.trim().length;
  return t("blog.comments.characterCount", { count: formatNumber(length) });
});
const loginToCommentMessage = computed(() => t("blog.auth.commentRequired"));
const loadCommentsLabel = computed(() => t("blog.comments.load"));
const commentsActivationHint = computed(() => t("blog.comments.activationHint"));
const commentsActivationPending = computed(() => !commentsActivated.value && !commentsLoading.value);

const editModalOpen = ref(false);
const deleteDialogOpen = ref(false);
const editForm = reactive({
  title: post.value.title,
  summary: post.value.summary,
  content: post.value.content,
});
const saveLoading = ref(false);
const deleteLoading = ref(false);
const editDialogRef = ref<HTMLDivElement | null>(null);
const deleteDialogRef = ref<HTMLDivElement | null>(null);
const editTitleRef = ref<HTMLInputElement | null>(null);
const previousFocusedElement = ref<HTMLElement | null>(null);

const editModalTitle = computed(() => t("blog.posts.actions.editTitle"));
const editModalDescription = computed(() => t("blog.posts.actions.editDescription"));
const editModalSaveLabel = computed(() => t("blog.posts.actions.save"));
const editModalCancelLabel = computed(() => t("blog.posts.actions.cancel"));
const deleteDialogTitle = computed(() => t("blog.posts.actions.deleteTitle"));
const deleteDialogDescription = computed(() => t("blog.posts.actions.deleteDescription"));
const deleteDialogConfirmLabel = computed(() => t("blog.posts.actions.deleteConfirm"));
const deleteDialogCancelLabel = computed(() => t("blog.posts.actions.cancel"));

watch(
    post,
    () => {
      if (!editModalOpen.value) {
        editForm.title = post.value.title;
        editForm.summary = post.value.summary;
        editForm.content = post.value.content;
      }
    },
    { immediate: true },
);

watch(editModalOpen, (open) => {
  if (open) {
    previousFocusedElement.value = document.activeElement as HTMLElement | null;

    nextTick(() => {
      editTitleRef.value?.focus();
    });

    return;
  }

  if (previousFocusedElement.value) {
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
});

watch(deleteDialogOpen, (open) => {
  if (open) {
    previousFocusedElement.value = document.activeElement as HTMLElement | null;

    nextTick(() => {
      deleteDialogRef.value?.focus();
    });

    return;
  }

  if (previousFocusedElement.value) {
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
});

watch(
    () => post.value.id,
    () => {
      commentContent.value = "";
      commentFeedback.value = null;
      submittingComment.value = false;
      postReacting.value = false;
      postReactionError.value = null;
    },
);

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container || event.key !== "Tab") {
    return;
  }

  const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
  );

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !active) {
      event.preventDefault();
      last.focus();
    }

    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

function closeEditModal() {
  editModalOpen.value = false;
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false;
}

function openEditModal() {
  editForm.title = post.value.title;
  editForm.summary = post.value.summary;
  editForm.content = post.value.content;
  editModalOpen.value = true;
}

function openDeleteDialog() {
  deleteDialogOpen.value = true;
}

async function handleSaveEdit() {
  if (saveLoading.value) {
    return;
  }

  saveLoading.value = true;

  try {
    const payload = {
      title: editForm.title,
      summary: editForm.summary,
      content: editForm.content,
    };

    await updatePost(post.value.id, payload);

    $notify({
      type: "success",
      title: t("blog.posts.actions.editSuccessTitle"),
      message: t("blog.posts.actions.editSuccessDescription"),
    });

    closeEditModal();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.posts.actions.editErrorTitle"),
      message: message || t("blog.posts.actions.editErrorDescription"),
      timeout: null,
    });
  } finally {
    saveLoading.value = false;
  }
}

async function handleDeletePost() {
  if (deleteLoading.value) {
    return;
  }

  deleteLoading.value = true;

  try {
    await deletePost(post.value.id);

    $notify({
      type: "success",
      title: t("blog.posts.actions.deleteSuccessTitle"),
      message: t("blog.posts.actions.deleteSuccessDescription"),
    });

    closeDeleteDialog();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.posts.actions.deleteErrorTitle"),
      message: message || t("blog.posts.actions.deleteErrorDescription"),
      timeout: null,
    });
  } finally {
    deleteLoading.value = false;
  }
}

async function handleFollow() {
  if (followLoading.value) {
    return;
  }

  try {
    resetFollowError();
    await followAuthor(post.value.user.id);

    $notify({
      type: "success",
      title: t("blog.posts.actions.followSuccessTitle"),
      message: t("blog.posts.actions.followSuccessDescription", {
        name: `${post.value.user.firstName} ${post.value.user.lastName}`,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.posts.actions.followErrorTitle"),
      message: message || t("blog.posts.actions.followErrorDescription"),
      timeout: null,
    });
  }
}

function handleEditKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeEditModal();
    return;
  }

  trapFocus(event, editDialogRef.value);
}

function handleDeleteKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeDeleteDialog();
    return;
  }

  trapFocus(event, deleteDialogRef.value);
}

async function handleTogglePostReaction() {
  if (postReacting.value) {
    return;
  }

  if (!isAuthenticated.value) {
    postReactionError.value = loginToReactMessage.value;
    return;
  }

  postReacting.value = true;
  postReactionError.value = null;

  try {
    const action: ReactionAction = isPostReacted.value ? "dislike" : "like";
    await reactToPost(post.value.id, action);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    postReactionError.value = message || t("blog.reactions.posts.reactionError");
  } finally {
    postReacting.value = false;
  }
}

async function handleCommentSubmit() {
  commentFeedback.value = null;

  const content = commentContent.value.trim();

  if (!isAuthenticated.value) {
    commentFeedback.value = {
      type: "error",
      message: loginToCommentMessage.value,
    };
    return;
  }

  if (!content) {
    commentFeedback.value = {
      type: "error",
      message: t("blog.comments.validation"),
    };
    return;
  }

  submittingComment.value = true;

  try {
    await addComment(post.value.id, content);
    commentFeedback.value = {
      type: "success",
      message: t("blog.comments.success"),
    };
    commentContent.value = "";
    await loadComments({ force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    commentFeedback.value = {
      type: "error",
      message: message || t("blog.comments.error"),
    };
  } finally {
    submittingComment.value = false;
  }
}

async function handleCommentReaction(commentId: string, reactionType: ReactionAction) {
  if (!isAuthenticated.value) {
    throw new Error(loginToReactMessage.value);
  }

  try {
    await reactToComment(post.value.id, commentId, reactionType);
    await loadComments({ force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    throw new Error(message || t("blog.comments.reactionError"));
  }
}

async function handleCommentReply(commentId: string, content: string) {
  if (!isAuthenticated.value) {
    throw new Error(loginToCommentMessage.value);
  }

  try {
    await addComment(post.value.id, content, commentId);
    await loadComments({ force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    throw new Error(message || t("blog.comments.replyError"));
  }
}

function countComments(comments: BlogCommentWithReplies[]): number {
  let total = 0;

  for (const comment of comments) {
    if (!comment || typeof comment !== "object") {
      continue;
    }

    total += 1;

    const nestedCandidates = [comment.comments, comment.replies, comment.children];
    const aggregatedChildren: BlogCommentWithReplies[] = [];
    const seenIds = new Set<string>();

    for (const candidate of nestedCandidates) {
      if (!Array.isArray(candidate)) {
        continue;
      }

      for (const child of candidate) {
        if (!child || typeof child !== "object") {
          continue;
        }

        const childId = typeof child.id === "string" ? child.id : "";

        if (childId) {
          if (seenIds.has(childId)) {
            continue;
          }
          seenIds.add(childId);
        }

        aggregatedChildren.push(child as BlogCommentWithReplies);
      }
    }

    if (aggregatedChildren.length > 0) {
      total += countComments(aggregatedChildren);
    }
  }

  return total;
}

async function loadComments(options: { force?: boolean } = {}) {
  const postId = post.value.id?.trim();

  if (!postId) {
    loadedComments.value = [];
    commentsError.value = null;
    commentsLoading.value = false;
    return;
  }

  if (activeCommentsRequest.value && !options.force) {
    return activeCommentsRequest.value;
  }

  commentsLoading.value = true;
  commentsError.value = null;

  const request = (async () => {
    try {
      const response = await getComments(postId);
      loadedComments.value = Array.isArray(response) ? response : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      commentsError.value = message || t("blog.comments.error");
    } finally {
      commentsLoading.value = false;
      activeCommentsRequest.value = null;
    }
  })();

  activeCommentsRequest.value = request;

  return request;
}

function requestComments(options: { force?: boolean } = {}) {
  if (!post.value.id) {
    return;
  }

  if (!commentsActivated.value) {
    commentsActivated.value = true;
  }

  const hasLoadedComments = Array.isArray(loadedComments.value);
  const shouldForce = Boolean(options.force || commentsError.value);

  if (!shouldForce && hasLoadedComments) {
    return;
  }

  void loadComments({ force: shouldForce });
}

function handleManualCommentsLoad() {
  requestComments({ force: true });
}

watch(
    isCommentsSectionVisible,
    (visible) => {
      if (visible) {
        requestComments();
      }
    },
    { immediate: true },
);

watch(
    () => post.value.id,
    () => {
      loadedComments.value = null;
      commentsError.value = null;
      commentsLoading.value = false;
      activeCommentsRequest.value = null;
      commentsActivated.value = false;

      if (post.value.id && isCommentsSectionVisible.value) {
        requestComments();
      }
    },
    { immediate: true },
);
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
