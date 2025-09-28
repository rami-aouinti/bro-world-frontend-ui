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
        <div v-if="bodyParagraphs.length" class="space-y-3 leading-relaxed">
          <p
            v-for="(paragraph, index) in bodyParagraphs"
            :key="index"
            class="whitespace-pre-line"
          >
            {{ paragraph }}
          </p>
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

    <div class="flex flex-wrap items-center gap-2 border-t border-slate-200 px-6 py-3 text-sm font-medium text-slate-500">
      <button
        v-for="action in postActions"
        :key="action.id"
        type="button"
        class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden="true" class="text-lg">{{ action.icon }}</span>
        <span>{{ action.label }}</span>
      </button>
    </div>

    <div
      v-if="post.reactions_preview.length"
      class="space-y-3 border-t border-slate-200 bg-slate-50 px-6 py-5"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {{ t("blog.reactions.post.reactionSpotlight") }}
      </p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="reaction in post.reactions_preview.slice(0, 4)"
          :key="reaction.id"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 shadow-sm"
        >
          <span class="sr-only">{{ reactionLabels[reaction.type] }}</span>
          <span aria-hidden="true" class="text-lg">{{ reactionEmojis[reaction.type] }}</span>
        </div>
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
import type { BlogPost, ReactionType } from "~/lib/mock/blog";
import {BaseCard} from "~/components/ui";

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
};

const { locale, t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
}));

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

const reactionCountDisplay = computed(() => formatNumber(props.post.reactions_count));
const commentCountDisplay = computed(() => formatNumber(props.post.totalComments));

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

const bodyParagraphs = computed(() => {
  const paragraphs = (props.post.content ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (props.post.summary) {
    paragraphs.unshift(props.post.summary);
  }

  return paragraphs;
});

const postActions = computed(() => [
  { id: "like", icon: "👍", label: t("blog.reactions.reactionTypes.like") },
  { id: "comment", icon: "💬", label: t("blog.comments.reply") },
]);
</script>
