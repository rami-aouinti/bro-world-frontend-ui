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
    <div class="flex flex-col gap-6 p-6 sm:p-8">
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
        @edit="openEdit"
        @delete="openDelete"
      />

      <div class="space-y-4 text-slate-700">
        <h4 v-if="post.title" class="text-xl font-semibold text-slate-900 sm:text-2xl">
          {{ post.title }}
        </h4>
        <div
          v-if="sanitizedSummary || sanitizedBody"
          class="space-y-4 leading-relaxed text-slate-700 [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="sanitizedSummary" v-html="sanitizedSummary"></div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="sanitizedBody" v-html="sanitizedBody"></div>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
      <div class="flex flex-wrap items-center justify-between gap-3" :aria-label="metaAriaLabel">
        <span class="inline-flex items-center gap-2">
          <span aria-hidden="true">❤️</span>
          <span>{{ reactionCountDisplay }}</span>
        </span>
        <span class="inline-flex items-center gap-2 text-slate-500">
          <span aria-hidden="true">💬</span>
          <span>{{ commentCountDisplay }}</span>
        </span>
      </div>
    </div>

    <div v-if="post.comments_preview.length" class="space-y-4 border-t border-slate-200 px-6 py-6">
      <header class="flex items-center justify-between gap-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ t("blog.reactions.post.recentComments") }}
        </p>
        <p class="text-xs text-slate-400">
          {{ t("blog.reactions.post.commentPreviews", { count: formatNumber(post.comments_preview.length) }) }}
        </p>
      </header>
      <div class="space-y-4">
        <BlogCommentCard
          v-for="comment in post.comments_preview.slice(0, 4)"
          :key="comment.id"
          :comment="comment"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BlogCommentCard from "./BlogCommentCard.vue";
import PostMeta from "./PostMeta.vue";
import { BaseCard } from "~/components/ui";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";
import { sanitizeRichText } from "~/lib/sanitize-html";

const props = defineProps<{ post: BlogPost }>();

defineOptions({
  name: "BlogPostCard",
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";

const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
  dislike: "👎",
};

const { locale, t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
  dislike: t("blog.reactions.reactionTypes.dislike"),
}));

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

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diff = date.getTime() - now;
  const intervals: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
  ];

  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: "auto" });

  for (const { unit, ms } of intervals) {
    const valueInUnit = diff / ms;
    if (Math.abs(valueInUnit) >= 1 || unit === "minute") {
      return rtf.format(Math.round(valueInUnit), unit);
    }
  }

  return rtf.format(0, "second");
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

const publishedLabel = computed(() => formatRelativeTime(props.post.publishedAt));

const reactionCountDisplay = computed(() => formatNumber(resolveReactionTotal(props.post as ReactionAggregate)));
const commentCountDisplay = computed(() => formatNumber(resolveReplyTotal(props.post as CommentAggregate)));

const followLabel = computed(() => t("blog.posts.actions.follow"));
const followLoadingLabel = computed(() => t("blog.posts.actions.following"));
const followAriaLabel = computed(() =>
  t("blog.posts.actions.followAria", {
    name: `${props.post.user.firstName} ${props.post.user.lastName}`,
  }),
);
const followingLabel = computed(() => t("blog.posts.actions.following"));
const followingAriaLabel = computed(() =>
  t("blog.posts.actions.followingAria", {
    name: `${props.post.user.firstName} ${props.post.user.lastName}`,
  }),
);
const actionsAriaLabel = computed(() => t("blog.posts.actions.openMenu"));
const editLabel = computed(() => t("blog.posts.actions.edit"));
const deleteLabel = computed(() => t("blog.posts.actions.delete"));

const isAuthenticated = computed(() => false);
const isAuthor = computed(() => false);
const isFollowing = computed(() => false);
const followLoading = computed(() => false);
const metaAriaLabel = computed(() =>
  t("blog.posts.actions.statistics", {
    reactions: reactionCountDisplay.value,
    comments: commentCountDisplay.value,
  }),
);

function handleFollow() {
  /* no-op for static cards */
}

function openEdit() {
  /* no-op */
}

function openDelete() {
  /* no-op */
}

const sanitizedSummary = computed(() => sanitizeRichText(props.post.summary ?? ""));
const sanitizedBody = computed(() => sanitizeRichText(props.post.content ?? ""));
</script>
