<template>
  <section
      class="rounded-3xl py-4 my-3 px-2 border border-white/5 bg-white/5 p-6 text-slate-200 shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] backdrop-blur-xl"
  >
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
    <BlogPostContent :title="post.title" :summary="post.summary" :content="post.content" />
    <BlogPostReactCard
        :counts="{ like: 4, sad: 2, angry: 1 }"
        :node="post"
        :reacts="post.reactions_count"
        :comments="post.totalComments"
        :shares="1"
        :liked="false"
        @toggle-like="handleTogglePostReaction"
        @comment="handleCommentButtonClick"
    />
    <div v-if="post.totalComments > 2" class="header">
      <CommentSortMenu v-model="sortBy" />
    </div>
    <div ref="commentsSectionRef">
      <CommentThread
          :counts="{haha: 0, like: 4, sad: 2, angry: 1 }"
          :nodes="post.comments_preview || []"
          :current-user="currentUser || []"
          @like="handleCommentLike"
          @reply="openReply"
      />
    </div>
  </section>

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
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, shallowRef, watch } from "vue";
import { useElementVisibility } from "@vueuse/core";

import PostMeta from "~/components/blog/PostMeta.vue";
import { formatMetricNumber, resolveCommentTotal, resolveReactionTotal } from "~/lib/blogMetrics";
import type { CommentAggregate, ReactionAggregate } from "~/lib/blogMetrics";
import type { BlogCommentWithReplies, BlogPost, ReactionAction, ReactionType } from "~/lib/mock/blog";
import { usePostsStore } from "~/composables/usePostsStore";
import { useAuthStore } from "~/composables/useAuthStore";
import BlogPostReactCard from "~/components/blog/BlogPostReactCard.vue";
import CommentThread, { type CommentNode } from '~/components/blog/CommentThread.vue'
import BlogPostContent from "~/components/blog/BlogPostContent.vue";
import CommentSortMenu from "~/components/blog/CommentSortMenu.vue";

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
type Comment = {
  id:string; author:string; message:string;
  createdAt:number; // timestamp ms
  likes:number; replies:number; isFriend?:boolean
}
const sortBy = ref<'relevant'|'newest'|'all'>('relevant')

const sorted = computed(() => {
  const arr = [...comments.value]

  if (sortBy.value === 'newest') {
    return arr.sort((a, b) => b.createdAt - a.createdAt)
  }

  if (sortBy.value === 'relevant') {
    function score(comment: Comment) {
      return (comment.isFriend ? 1000 : 0) + comment.likes * 5 + comment.replies * 8
    }

    return arr.sort((a, b) => score(b) - score(a))
  }

  return arr
})
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

function openReply(id: string){ /* TODO */ }
const loginToReactMessage = computed(() => t("blog.auth.reactionRequired"));
const loginToCommentMessage = computed(() => t("blog.auth.commentRequired"));
const editModalOpen = ref(false);
const deleteDialogOpen = ref(false);
const previousFocusedElement = ref<HTMLElement | null>(null);

const tree = ref<CommentNode[]>([
  {
    id: 'c1',
    user: { firstName: 'عبد السلام المرخي', lastName: 'عبد السلام المرخي', photo: 'https://i.pravatar.cc/80?img=12' },
    message: 'سلكناها حفيدة الحسن…',
    createdAt: Date.now() - 11*3600*1000,
    children: [
      {
        id: 'c1-1',
        user: { firstName: 'عبد السلام المرخي', lastName: 'عبد السلام المرخي', photo: 'https://i.pravatar.cc/80?img=12' },
        message: '… خلي العالم يعرف',
        createdAt: Date.now() - 11*3600*1000,
        children: [
          {
            id: 'c1-1-1',
            user: { firstName: 'عبد السلام المرخي', lastName: 'عبد السلام المرخي', photo: 'https://i.pravatar.cc/80?img=12' },
            message: 'Aly Bouzwida Ben Ammar 😭',
            createdAt: Date.now() - 10*3600*1000
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    user: { firstName: 'عبد السلام المرخي', lastName: 'عبد السلام المرخي', photo: 'https://i.pravatar.cc/80?img=12' },
    message: 'هيهات منا الذلة',
    createdAt: Date.now() - 11*3600*1000
  }
])

function handleCommentLike(commentId: string) {
  void handleCommentReaction(commentId, "like").catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? "")

    $notify({
      type: "error",
      title: t("blog.comments.reactionError"),
      message: message || t("blog.comments.reactionError"),
      timeout: null,
    })
  })
}
const BlogPostEditDialog = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostEditDialog.vue"),
  suspensible: false,
});

const BlogPostDeleteDialog = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostDeleteDialog.vue"),
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

function openEditModal() {
  previousFocusedElement.value = document.activeElement as HTMLElement | null;
  editModalOpen.value = true;
}

function openDeleteDialog() {
  previousFocusedElement.value = document.activeElement as HTMLElement | null;
  deleteDialogOpen.value = true;
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

function handleCommentButtonClick() {
  requestComments();

  nextTick(() => {
    commentsSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
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
