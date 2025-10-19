<template>
  <SidebarCard
    v-bind="$attrs"
    class="text-card-foreground px-3 py-3"
    glow
  >
    <PostMeta
      :user="postUser"
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
      :prefer-eager-media-loading="preferEagerMediaLoading"
      @follow="handleFollow"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />
    <BlogPostContent
      :title="post.title"
      :summary="post.summary"
      :content="post.content"
    />
    <BlogPostReactCard
      :counts="{ care: 0, haha: 0, love: 0, wow: 0, like: 4, sad: 2, angry: 1 }"
      :node="post"
      :reacts="post.reactions_count"
      :comments="post.totalComments"
      :shares="1"
      :liked="false"
      @toggle-like="handleTogglePostReaction"
      @comment="handleCommentButtonClick"
      @share="handleShareRequest"
    />
    <div
      v-if="post.totalComments > 2 && shouldRenderCommentThread"
      class="header"
    >
      <CommentSortMenu v-model="sortBy" />
    </div>
    <div ref="commentsSectionRef">
      <CommentThreadSkeleton
        v-if="commentsLoading && shouldRenderCommentThread"
        class="mb-4"
        :show-composer="isAuthenticated"
      />
      <CommentThread
        v-else-if="shouldRenderCommentThread"
        v-model:composer-visible="isCommentComposerVisible"
        :counts="{ care: 0, love: 0, wow: 0, haha: 0, like: 4, sad: 2, angry: 1 }"
        :nodes="sortedCommentThreadNodes"
        :current-user="currentUserForThread"
        :composer-submitting="submittingComment"
        :pending-replies="pendingReplies"
        @like="handleCommentLike"
        @reply="openReply"
        @submit="handleCommentSubmit"
      />
      <button
        v-if="commentsError === loginToViewCommentsMessage && !commentsLoading"
        ref="loginPromptRef"
        type="button"
        class="comments-error comments-error--action"
        aria-live="polite"
        aria-haspopup="dialog"
        @click="openLoginDialog"
      >
        {{ commentsError }}
      </button>
      <p
        v-else-if="commentsError && !commentsLoading"
        class="comments-error"
        role="status"
      >
        {{ commentsError }}
      </p>
    </div>
  </SidebarCard>

  <component
    :is="BlogPostEditDialog"
    v-if="editModalOpen"
    :post="post"
    :title="editModalTitle"
    :description="editModalDescription"
    :save-label="editModalSaveLabel"
    :cancel-label="editModalCancelLabel"
    @close="handleEditDialogClose"
    @saved="handleEditDialogClose"
  />

  <component
    :is="BlogPostDeleteDialog"
    v-if="deleteDialogOpen"
    :post="post"
    :title="deleteDialogTitle"
    :description="deleteDialogDescription"
    :confirm-label="deleteDialogConfirmLabel"
    :cancel-label="deleteDialogCancelLabel"
    @close="handleDeleteDialogClose"
    @deleted="handleDeleteDialogClose"
  />

  <component
    :is="AuthLoginDialog"
    v-if="loginDialogOpen"
    v-model="loginDialogOpen"
    :title="loginDialogTitle"
    :description="loginDialogDescription"
    @close="handleLoginDialogClose"
  />

  <component
    :is="BlogPostShareDialog"
    v-if="shareDialogOpen"
    v-model:open="shareDialogOpen"
    :post="post"
    :current-user-name="currentUserDisplayName"
    :current-user-avatar="currentUserAvatar"
    :max-length="shareDialogMaxLength"
    @close="handleShareDialogClose"
    @share="handleShareSubmit"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, reactive, ref, shallowRef, watch } from "vue";
import { useElementVisibility } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { onNuxtReady, useNuxtApp } from "#app";
import { useAuthStore } from "~/composables/useAuthStore";
import { usePostsStore } from "~/composables/usePostsStore";
import { useNonBlockingTask } from "~/composables/useNonBlockingTask";
import { useRelativeTime } from "~/composables/useRelativeTime";
import type {
  BlogCommentWithReplies,
  BlogPost,
  ReactionAction,
  ReactionType,
} from "~/lib/mock/blog";
import type { CommentNode } from "~/components/blog/CommentThread.vue";
import { optimizeAvatarUrl } from "~/lib/images/avatar";
import CommentThreadSkeleton from "./CommentThreadSkeleton.vue";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  post: BlogPost;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: Record<ReactionType, string>;
  preferEagerMediaLoading?: boolean;
}>();

const { t } = useI18n();
const postUserAriaName = computed(
  () =>
    postUserDisplayName.value ||
    postUser.value?.username ||
    postUser.value?.email ||
    t("blog.posts.actions.follow"),
);
const { $notify } = useNuxtApp();
const isHydrated = ref(false);

if (import.meta.client) {
  onNuxtReady(() => {
    isHydrated.value = true;
  });
}
const { reactToPost, addComment, reactToComment, getComments } = usePostsStore();
const {
  currentUser,
  isAuthenticated: isAuthenticatedComputed,
  following,
  followPending,
  followAuthor,
  resetFollowError,
} = useAuthStore();
const post = computed(() => props.post);
const postId = computed(() => post.value.id?.trim() ?? "");
const postUser = computed(() => post.value.user);
const postUserDisplayName = computed(() => {
  const user = postUser.value;
  const parts = [user?.firstName, user?.lastName].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user?.username || user?.email || "";
});
const postReacting = ref(false);
const postReactionError = ref<string | null>(null);
const commentContent = ref("");
const isCommentComposerVisible = ref(false);
const submittingComment = ref(false);
const commentFeedback = ref<FeedbackState | null>(null);
const pendingReplies = reactive<Record<string, boolean>>({});
const loadedComments = ref<BlogCommentWithReplies[] | null>(null);
const commentsLoading = ref(false);
const commentsError = ref<string | null>(null);
const activeCommentsRequest = shallowRef<Promise<void> | null>(null);
const commentsSectionRef = ref<HTMLElement | null>(null);
const isCommentsSectionVisible = useElementVisibility(commentsSectionRef);
const commentsActivated = ref(false);
const shouldRenderCommentThread = computed(() => commentsActivated.value);
const loginDialogOpen = ref(false);
const loginPromptRef = ref<HTMLButtonElement | null>(null);
const loginDialogPreviousFocusedElement = ref<HTMLElement | null>(null);
const { formatRelativeTime } = useRelativeTime();
const sortBy = ref<"relevant" | "newest" | "all">("relevant");
const publishedLabel = computed(() => formatRelativeTime(post.value.publishedAt));

const isAuthenticated = computed(() => isAuthenticatedComputed.value);
const isAuthor = computed(
  () => isAuthenticated.value && currentUser.value?.id === postUser.value.id,
);
const isFollowing = computed(() => Boolean(following.value?.[postUser.value.id]));
const followLoading = computed(() => Boolean(followPending.value?.[postUser.value.id]));

const followLabel = computed(() => t("blog.posts.actions.follow"));
const followLoadingLabel = computed(() => t("blog.posts.actions.following"));
const followAriaLabel = computed(() =>
  t("blog.posts.actions.followAria", {
    name: postUserAriaName.value,
  }),
);
const followingLabel = computed(() => t("blog.posts.actions.following"));
const followingAriaLabel = computed(() =>
  t("blog.posts.actions.followingAria", {
    name: postUserAriaName.value,
  }),
);
const actionsAriaLabel = computed(() => t("blog.posts.actions.openMenu"));
const editLabel = computed(() => t("blog.posts.actions.edit"));
const deleteLabel = computed(() => t("blog.posts.actions.delete"));
const preferEagerMediaLoading = computed(() => Boolean(props.preferEagerMediaLoading));
const isPostReacted = computed(() => Boolean(post.value.isReacted));

const emptyCommentNodes: BlogCommentWithReplies[] = [];
const commentThreadNodes = computed(() => {
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

  return post.value.comments_preview ?? emptyCommentNodes;
});
const sortedCommentThreadNodes = computed(() => {
  if (sortBy.value === "newest") {
    return sortCommentsByPublishedAt(commentThreadNodes.value);
  }

  return commentThreadNodes.value;
});

function sortCommentsByPublishedAt(nodes: BlogCommentWithReplies[]): BlogCommentWithReplies[] {
  return nodes
    .map((node) => {
      const sortedChildren = resolveSortedChildren(node);
      const baseNode: BlogCommentWithReplies = sortedChildren
        ? {
            ...node,
            children: sortedChildren,
          }
        : { ...node };

      if (sortedChildren) {
        if (Array.isArray(node.comments)) {
          baseNode.comments = sortedChildren;
        }

        if (Array.isArray(node.replies)) {
          baseNode.replies = sortedChildren;
        }
      }

      return {
        node: baseNode,
        publishedTimestamp: getPublishedTimestamp(node.publishedAt),
      };
    })
    .sort((a, b) => b.publishedTimestamp - a.publishedTimestamp)
    .map(({ node }) => node);
}

function resolveSortedChildren(node: BlogCommentWithReplies): BlogCommentWithReplies[] | undefined {
  const collections = [node.children, node.comments, node.replies];

  for (const collection of collections) {
    if (Array.isArray(collection) && collection.length > 0) {
      return sortCommentsByPublishedAt(collection);
    }
  }

  return undefined;
}

function getPublishedTimestamp(input: BlogCommentWithReplies["publishedAt"]): number {
  if (typeof input === "number") {
    return input;
  }

  if (input instanceof Date) {
    return input.getTime();
  }

  if (typeof input === "string") {
    const parsed = Date.parse(input);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}
const currentUserForThread = computed(() => currentUser.value ?? undefined);
const currentUserDisplayName = computed(() => {
  const user = currentUser.value;

  if (!user) {
    return "";
  }

  const parts = [user.firstName, user.lastName].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user.username || user.email || "";
});
const currentUserAvatar = computed(
  () =>
    optimizeAvatarUrl(currentUser.value?.photo ?? null, 48) ??
    currentUser.value?.photo ??
    props.defaultAvatar,
);
const shareDialogOpen = ref(false);
const shareDialogMaxLength = computed(() => 500);
const { schedule: scheduleNonBlockingTask } = useNonBlockingTask({ timeout: 400 });

async function openReply(id: string, text: string) {
  const trimmedId = id.trim();
  const trimmedText = text.trim();

  if (!trimmedId || !trimmedText) {
    return;
  }

  if (!isAuthenticated.value) {
    openLoginDialog();

    return;
  }

  const currentPostId = postId.value;

  if (!currentPostId) {
    $notify({
      type: "error",
      title: t("blog.comments.label"),
      message: t("blog.comments.replyError"),
      timeout: null,
    });

    return;
  }

  if (pendingReplies[trimmedId]) {
    return;
  }

  pendingReplies[trimmedId] = true;

  try {
    await addComment(currentPostId, trimmedText, trimmedId);
    await loadComments({ force: true });

    $notify({
      type: "success",
      title: t("blog.comments.label"),
      message: t("blog.comments.replySuccess"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.comments.label"),
      message: message || t("blog.comments.replyError"),
      timeout: null,
    });
  } finally {
    delete pendingReplies[trimmedId];
  }
}
const loginToReactMessage = computed(() => t("blog.auth.reactionRequired"));
const loginToViewCommentsMessage = computed(() => t("blog.auth.commentRequired"));
const loginDialogTitle = computed(() => t("auth.signIn"));
const loginDialogDescription = loginToViewCommentsMessage;
const editModalOpen = ref(false);
const deleteDialogOpen = ref(false);
const previousFocusedElement = ref<HTMLElement | null>(null);

const placeholderAvatar = "/images/placeholders/avatar-1.svg";

function handleCommentLike(commentId: string) {
  void handleCommentReaction(commentId, "like").catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.comments.reactionError"),
      message: message || t("blog.comments.reactionError"),
      timeout: null,
    });
  });
}
const BlogPostContent = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostContent.vue"),
  suspensible: false,
});
const BlogPostReactCard = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostReactCard.vue"),
  suspensible: false,
});
const CommentSortMenu = defineAsyncComponent({
  loader: () => import("~/components/blog/CommentSortMenu.vue"),
  suspensible: false,
});

const CommentThread = defineAsyncComponent({
  loader: () => import("~/components/blog/CommentThread.vue"),
  suspensible: false,
});

const BlogPostEditDialog = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostEditDialog.vue"),
  suspensible: false,
});

const BlogPostDeleteDialog = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostDeleteDialog.vue"),
  suspensible: false,
});

const AuthLoginDialog = defineAsyncComponent({
  loader: () => import("~/components/auth/LoginDialog.vue"),
  suspensible: false,
});

const BlogPostShareDialog = defineAsyncComponent({
  loader: () => import("~/components/blog/PostShareDialog.vue"),
  suspensible: false,
});

const editModalTitle = computed(() => t("blog.posts.actions.editTitle"));
const editModalDescription = computed(() => t("blog.posts.actions.editDescription"));
const editModalSaveLabel = computed(() => t("blog.posts.actions.save"));
const editModalCancelLabel = computed(() => t("blog.posts.actions.cancel"));
const deleteDialogTitle = computed(() => t("blog.posts.actions.deleteTitle"));
const deleteDialogDescription = computed(() => t("blog.posts.actions.deleteDescription"));
const deleteDialogConfirmLabel = computed(() => t("blog.posts.actions.deleteConfirm"));
const deleteDialogCancelLabel = computed(() => t("blog.posts.actions.cancel"));

function resetPostInteractionState() {
  commentContent.value = "";
  commentFeedback.value = null;
  submittingComment.value = false;
  postReacting.value = false;
  postReactionError.value = null;
}

function openEditModal() {
  previousFocusedElement.value = document.activeElement as HTMLElement | null;
  editModalOpen.value = true;
}

function openDeleteDialog() {
  previousFocusedElement.value = document.activeElement as HTMLElement | null;
  deleteDialogOpen.value = true;
}

function openLoginDialog() {
  if (loginDialogOpen.value) {
    return;
  }

  loginDialogPreviousFocusedElement.value =
    (document.activeElement as HTMLElement | null) ?? loginPromptRef.value;
  loginDialogOpen.value = true;
}

function handleShareRequest() {
  if (!isAuthenticated.value) {
    openLoginDialog();

    return;
  }

  shareDialogOpen.value = true;
}

function handleShareDialogClose() {
  shareDialogOpen.value = false;
}

function handleShareSubmit(_payload: { message: string }) {
  shareDialogOpen.value = false;

  $notify({
    type: "success",
    title: t("blog.posts.shareDialog.successTitle"),
    message: t("blog.posts.shareDialog.successMessage"),
  });
}

async function handleFollow() {
  if (followLoading.value) {
    return;
  }

  try {
    resetFollowError();
    await followAuthor(postUser.value.id);

    $notify({
      type: "success",
      title: t("blog.posts.actions.followSuccessTitle"),
      message: t("blog.posts.actions.followSuccessDescription", {
        name: postUserAriaName.value,
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
    const id = postId.value;

    if (!id) {
      throw new Error(t("blog.reactions.posts.reactionError"));
    }

    await reactToPost(id, action);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    postReactionError.value = message || t("blog.reactions.posts.reactionError");
  } finally {
    postReacting.value = false;
  }
}

function handleCommentButtonClick() {
  const nextActive = !commentsActivated.value;

  commentsActivated.value = nextActive;
  isCommentComposerVisible.value = nextActive;

  if (!nextActive) {
    return;
  }

  requestComments();

  nextTick(() => {
    commentsSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

async function handleCommentSubmit(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  if (!isAuthenticated.value) {
    openLoginDialog();

    return;
  }

  if (submittingComment.value) {
    return;
  }

  const currentPostId = postId.value;

  if (!currentPostId) {
    $notify({
      type: "error",
      title: t("blog.comments.label"),
      message: t("blog.comments.error"),
      timeout: null,
    });

    return;
  }

  submittingComment.value = true;

  try {
    await addComment(currentPostId, trimmedText);
    await loadComments({ force: true });

    $notify({
      type: "success",
      title: t("blog.comments.label"),
      message: t("blog.comments.success"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    $notify({
      type: "error",
      title: t("blog.comments.label"),
      message: message || t("blog.comments.error"),
      timeout: null,
    });
  } finally {
    submittingComment.value = false;
  }
}

async function handleCommentReaction(commentId: string, reactionType: ReactionAction) {
  if (!isAuthenticated.value) {
    throw new Error(loginToReactMessage.value);
  }

  try {
    const id = postId.value;

    if (!id) {
      throw new Error(t("blog.comments.reactionError"));
    }

    await reactToComment(id, commentId, reactionType);
    await loadComments({ force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    throw new Error(message || t("blog.comments.reactionError"));
  }
}

async function loadComments(options: { force?: boolean } = {}) {
  const id = postId.value;

  if (!id) {
    loadedComments.value = [];
    commentsError.value = null;
    commentsLoading.value = false;
    return;
  }

  if (!isAuthenticated.value) {
    commentsError.value = loginToViewCommentsMessage.value;
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
      const response = await getComments(id);
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

function resetCommentsState() {
  loadedComments.value = null;
  commentsError.value = null;
  commentsLoading.value = false;
  activeCommentsRequest.value = null;
  commentsActivated.value = false;
  for (const key of Object.keys(pendingReplies)) {
    delete pendingReplies[key];
  }
}

function requestComments(options: { force?: boolean } = {}) {
  if (!postId.value) {
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

function prefetchComments() {
  if (!isCommentsSectionVisible.value) {
    return;
  }

  if (commentsActivated.value || commentsLoading.value) {
    return;
  }

  if (!isAuthenticated.value) {
    return;
  }

  if (Array.isArray(loadedComments.value)) {
    return;
  }

  scheduleNonBlockingTask(() => loadComments());
}

watch(sortBy, (value) => {
  if (value === "all" || value === "newest") {
    requestComments();
  }
});

watch(
  isCommentsSectionVisible,
  (visible) => {
    if (visible) {
      prefetchComments();
    }
  },
  { immediate: true },
);

watch(
  postId,
  (id) => {
    resetPostInteractionState();
    resetCommentsState();

    if (id) {
      prefetchComments();
    }
  },
  { immediate: true },
);

watch(isAuthenticated, (value) => {
  if (value && loginDialogOpen.value) {
    handleLoginDialogClose();
  }

  if (value && commentsActivated.value) {
    const shouldReload = commentsError.value === loginToViewCommentsMessage.value;

    commentsError.value = null;

    if (shouldReload) {
      scheduleNonBlockingTask(() => loadComments({ force: true }));
    }
  }

  if (value) {
    prefetchComments();
  }
});

function handleEditDialogClose() {
  editModalOpen.value = false;

  if (previousFocusedElement.value) {
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
}

function handleDeleteDialogClose() {
  deleteDialogOpen.value = false;

  if (previousFocusedElement.value) {
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
}

function handleLoginDialogClose() {
  if (loginDialogOpen.value) {
    loginDialogOpen.value = false;
  }

  const target = loginDialogPreviousFocusedElement.value ?? loginPromptRef.value;

  if (target) {
    nextTick(() => {
      target.focus();
    });
  }

  loginDialogPreviousFocusedElement.value = null;
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.comments-manual {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.comments-manual__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(var(--v-theme-primary), 0.35);
  background: transparent;
  color: rgb(var(--v-theme-primary));
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.comments-manual__button:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.comments-manual__button:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.7);
  outline-offset: 3px;
}

.comments-error {
  margin: 0.75rem 0 0;
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  text-align: center;
}

.comments-error--action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.25rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  color: inherit;
}

.comments-error--action:hover {
  text-decoration: underline;
}

.comments-error--action:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
</style>
