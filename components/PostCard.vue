<template>
  <article
    class="group relative overflow-hidden rounded-3xl p-6  shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] sm:p-8"
  >
    <div class="relative flex flex-col gap-2">
      <PostMeta
        :user="post.user"
        :default-avatar="defaultAvatar"
        :published-label="publishedLabel"
        :reaction-badge="reactionBadge"
        :comment-badge="commentBadge"
      />

      <div class="px-3 w-full max-w-2xl space-y-2">
        <RadiantText
            class="inline-flex items-center justify-center px-2 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400"
            :duration="5"
        >
          <span class="text-xl font-bold">{{ post.title }}</span>
        </RadiantText>
        <p class="text-base leading-relaxed text-slate-200/80">
          {{ post.summary }}
        </p>
      </div>

      <div class="px-3 w-full max-w-2xl space-y-5 py-3">
        <div class="flex flex-col gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {{ reactionPromptLabel }}
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="type in reactionTypes"
              :key="type"
              type="button"
              :aria-label="reactionLabels[type]"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-slate-100 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!!postReactingType"
              @click="handlePostReaction(type)"
            >
              <span aria-hidden="true">{{ reactionEmojis[type] }}</span>
            </button>
          </div>
          <p v-if="postReactionError" class="text-xs text-rose-300">
            {{ postReactionError }}
          </p>
        </div>

        <form
          class="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/20 p-5"
          @submit.prevent="handleCommentSubmit"
        >
          <div class="flex items-start gap-3">
            <div class="hidden h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:block">
              <img
                :src="post.user.photo ?? defaultAvatar"
                :alt="`${post.user.firstName} ${post.user.lastName}`"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <label class="flex w-full flex-col gap-2 text-sm text-slate-200">
              <span class="font-semibold text-slate-100">
                {{ commentComposerLabel }}
              </span>
              <textarea
                v-model="commentContent"
                class="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                :placeholder="commentPlaceholder"
              />
            </label>
          </div>
          <div class="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p
              v-if="commentFeedback"
              :class="commentFeedback.type === 'success' ? 'text-emerald-300' : 'text-rose-300'"
            >
              {{ commentFeedback.message }}
            </p>
            <div class="flex items-center gap-3 sm:justify-end">
              <span class="text-slate-400">{{ commentCharacterCountLabel }}</span>
              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="submittingComment"
              >
                <span v-if="submittingComment">{{ t('blog.comments.submitting') }}</span>
                <span v-else>{{ t('blog.comments.submit') }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <footer
        v-if="hasReactionPreview"
        class="flex flex-wrap items-center gap-4 rounded-2xl px-4 py-1 text-sm"
      >
        <div class="flex flex-wrap gap-4">
          <div
              v-for="reaction in topReactions"
              :key="reaction.id"
              class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-1.5 text-slate-100 shadow-[0_10px_25px_-15px_rgba(15,23,42,0.9)]"
          >
            <span class="sr-only">{{ reactionLabels[reaction.type] }}</span>
            <span
                aria-hidden="true"
                class="text-lg"
            >{{ reactionEmojis[reaction.type] }}</span
            >
          </div>
        </div>
      </footer>
      <section class="w-full max-w-2xl space-y-4 rounded-3xl px-3 pb-6">
        <header class="flex items-center justify-between px-1 pt-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
            {{ recentCommentsLabel }}
          </p>
          <p class="text-xs text-slate-400">
            {{ commentPreviewCountLabel }}
          </p>
        </header>
        <div v-if="hasCommentPreview" class="w-full space-y-5 px-1.5 pt-1 sm:px-2">
          <CommentCard
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            :default-avatar="defaultAvatar"
            :reaction-emojis="reactionEmojis"
            :reaction-labels="reactionLabels"
            :react-to-comment="handleCommentReaction"
            :reply-to-comment="handleCommentReply"
            class="mx-1.5 w-full sm:mx-2"
          />
        </div>
        <p v-else class="px-2 text-sm text-slate-400">
          {{ t('blog.comments.empty') }}
        </p>
      </section>
    </div>
    <BorderBeam
        :size="250"
        :duration="12"
        :delay="9"
        :border-width="2"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import CommentCard from "~/components/CommentCard.vue";
import PostMeta from "~/components/blog/PostMeta.vue";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";
import { usePostsStore } from "~/composables/usePostsStore";

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
const { reactToPost, addComment, reactToComment } = usePostsStore();

const post = computed(() => props.post);

const postReactingType = ref<ReactionType | null>(null);
const postReactionError = ref<string | null>(null);
const commentContent = ref("");
const submittingComment = ref(false);
const commentFeedback = ref<FeedbackState | null>(null);

const reactionTypes = computed(() => Object.keys(props.reactionEmojis) as ReactionType[]);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value ?? "fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value ?? "fr-FR").format(value ?? 0);
}

const publishedLabel = computed(() =>
  t("blog.reactions.posts.publishedOn", { date: formatDateTime(post.value.publishedAt) }),
);

const reactionBadge = computed(() => ({
  icon: props.reactionEmojis.like,
  display: formatNumber(post.value.reactions_count),
  ariaLabel: t("blog.reactions.posts.reactionCount", {
    count: formatNumber(post.value.reactions_count),
  }),
}));

const commentBadge = computed(() => ({
  icon: "💬",
  display: formatNumber(post.value.totalComments),
  ariaLabel: t("blog.reactions.posts.commentCount", {
    count: formatNumber(post.value.totalComments),
  }),
}));

const recentCommentsLabel = computed(() => t("blog.reactions.posts.recentComments"));

const commentPreviewCountLabel = computed(() =>
  t("blog.reactions.posts.previewCount", {
    count: formatNumber(post.value.comments_preview.length),
  }),
);

const comments = computed(() => post.value.comments_preview ?? []);
const topReactions = computed(() => post.value.reactions_preview.slice(0, 4));
const hasCommentPreview = computed(() => comments.value.length > 0);
const hasReactionPreview = computed(() => topReactions.value.length > 0);

const reactionPromptLabel = computed(() => t("blog.reactions.posts.reactLabel"));
const commentPlaceholder = computed(() => t("blog.comments.placeholder"));
const commentComposerLabel = computed(() => t("blog.comments.label"));
const commentCharacterCountLabel = computed(() => {
  const length = commentContent.value.trim().length;
  return t("blog.comments.characterCount", { count: formatNumber(length) });
});

watch(
  () => post.value.id,
  () => {
    commentContent.value = "";
    commentFeedback.value = null;
    submittingComment.value = false;
    postReactingType.value = null;
    postReactionError.value = null;
  },
);

async function handlePostReaction(type: ReactionType) {
  if (postReactingType.value) {
    return;
  }

  postReactingType.value = type;
  postReactionError.value = null;

  try {
    await reactToPost(post.value.id, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    postReactionError.value = message || t("blog.reactions.posts.reactionError");
  } finally {
    postReactingType.value = null;
  }
}

async function handleCommentSubmit() {
  commentFeedback.value = null;

  const content = commentContent.value.trim();

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

async function handleCommentReaction(commentId: string, reactionType: ReactionType) {
  try {
    await reactToComment(post.value.id, commentId, reactionType);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    throw new Error(message || t("blog.comments.reactionError"));
  }
}

async function handleCommentReply(commentId: string, content: string) {
  try {
    await addComment(post.value.id, content, commentId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    throw new Error(message || t("blog.comments.replyError"));
  }
}
</script>
