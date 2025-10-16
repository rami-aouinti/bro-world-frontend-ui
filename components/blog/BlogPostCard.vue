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
    />
    <div
      v-if="post.totalComments > 2"
      class="header"
    >
      <CommentSortMenu v-model="sortBy" />
    </div>
    <div ref="commentsSectionRef">
      <CommentThread
        v-if="shouldRenderCommentThread"
        v-model:composer-visible="isCommentComposerVisible"
        :counts="{ care: 0, love: 0, wow: 0, haha: 0, like: 4, sad: 2, angry: 1 }"
        :nodes="commentThreadNodes"
        :current-user="currentUserForThread"
        @like="handleCommentLike"
        @reply="openReply"
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
      <button
        v-if="!commentsActivated && !commentsLoading"
        type="button"
        class="load-comments"
        data-test="load-comments-button"
        @click="loadCommentsManually"
      >
        {{ loadCommentsLabel }}
      </button>
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
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, shallowRef, watch } from "vue";
import { useElementVisibility } from "@vueuse/core";
import { useAuthStore } from "~/composables/useAuthStore";
import { usePostsStore } from "~/composables/usePostsStore";
import { useRelativeTime } from "~/composables/useRelativeTime";
import type {
  BlogCommentWithReplies,
  BlogPost,
  ReactionAction,
  ReactionType,
} from "~/lib/mock/blog";
import type { CommentNode } from "~/components/blog/CommentThread.vue";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});
const PostMeta = defineAsyncComponent({
  loader: () => import("~/components/blog/PostMeta.vue"),
  suspensible: false,
});
const BlogPostContent = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostContent.vue"),
  suspensible: false,
});

const BlogPostReactCard = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostReactCard.vue"),
  suspensible: false,
});

const CommentThread = defineAsyncComponent({
  loader: () => import("~/components/blog/CommentThread.vue"),
  suspensible: false,
});

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
  () => postUserDisplayName.value || postUser.value?.username || postUser.value?.email || t("blog.posts.actions.follow"),
);
const { $notify } = useNuxtApp();
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
type Comment = {
  id: string;
  author: string;
  message: string;
  createdAt: number; // timestamp ms
  likes: number;
  replies: number;
  isFriend?: boolean;
};
const sortBy = ref<"relevant" | "newest" | "all">("relevant");

const sorted = computed(() => {
  const arr = [...commentThreadNodes.value];

  if (sortBy.value === "newest") {
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (sortBy.value === "relevant") {
    function score(comment: Comment) {
      return (comment.isFriend ? 1000 : 0) + comment.likes * 5 + comment.replies * 8;
    }

    return arr.sort((a, b) => score(b) - score(a));
  }

  return arr;
});
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
const currentUserForThread = computed(() => currentUser.value ?? undefined);

function openReply(id: string) {
  /* TODO */
}
const loginToReactMessage = computed(() => t("blog.auth.reactionRequired"));
const loginToViewCommentsMessage = computed(() => t("blog.auth.commentRequired"));
const loginDialogTitle = computed(() => t("auth.signIn"));
const loginDialogDescription = loginToViewCommentsMessage;
const editModalOpen = ref(false);
const deleteDialogOpen = ref(false);
const previousFocusedElement = ref<HTMLElement | null>(null);

const placeholderAvatar = "/images/placeholders/avatar-1.svg";

const tree = ref<CommentNode[]>([
  {
    id: "c1",
    user: {
      firstName: "عبد السلام المرخي",
      lastName: "عبد السلام المرخي",
      photo: placeholderAvatar,
    },
    message: "سلكناها حفيدة الحسن…",
    createdAt: Date.now() - 11 * 3600 * 1000,
    children: [
      {
        id: "c1-1",
        user: {
          firstName: "عبد السلام المرخي",
          lastName: "عبد السلام المرخي",
          photo: placeholderAvatar,
        },
        message: "… خلي العالم يعرف",
        createdAt: Date.now() - 11 * 3600 * 1000,
        children: [
          {
            id: "c1-1-1",
            user: {
              firstName: "عبد السلام المرخي",
              lastName: "عبد السلام المرخي",
              photo: placeholderAvatar,
            },
            message: "Aly Bouzwida Ben Ammar 😭",
            createdAt: Date.now() - 10 * 3600 * 1000,
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    user: {
      firstName: "عبد السلام المرخي",
      lastName: "عبد السلام المرخي",
      photo: placeholderAvatar,
    },
    message: "هيهات منا الذلة",
    createdAt: Date.now() - 11 * 3600 * 1000,
  },
]);

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
const CommentSortMenu = defineAsyncComponent({
  loader: () => import("~/components/blog/CommentSortMenu.vue"),
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

const editModalTitle = computed(() => t("blog.posts.actions.editTitle"));
const editModalDescription = computed(() => t("blog.posts.actions.editDescription"));
const editModalSaveLabel = computed(() => t("blog.posts.actions.save"));
const editModalCancelLabel = computed(() => t("blog.posts.actions.cancel"));
const deleteDialogTitle = computed(() => t("blog.posts.actions.deleteTitle"));
const deleteDialogDescription = computed(() => t("blog.posts.actions.deleteDescription"));
const deleteDialogConfirmLabel = computed(() => t("blog.posts.actions.deleteConfirm"));
const deleteDialogCancelLabel = computed(() => t("blog.posts.actions.cancel"));
const loadCommentsLabel = computed(() => t("blog.comments.load"));

watch(
  postId,
  () => {
    commentContent.value = "";
    commentFeedback.value = null;
    submittingComment.value = false;
    postReacting.value = false;
    postReactionError.value = null;
  },
);

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
  requestComments();

  isCommentComposerVisible.value = !isCommentComposerVisible.value;

  if (isCommentComposerVisible.value) {
    nextTick(() => {
      commentsSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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

function loadCommentsManually() {
  commentsActivated.value = true;
  const shouldForce = !Array.isArray(loadedComments.value);

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

  void loadComments();
}

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
    loadedComments.value = null;
    commentsError.value = null;
    commentsLoading.value = false;
    activeCommentsRequest.value = null;
    commentsActivated.value = false;

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
      void loadComments({ force: true });
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
