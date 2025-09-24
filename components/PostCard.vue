<template>
  <article
    class="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)]"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    />
    <div class="relative flex flex-col gap-8 p-8 sm:p-10">
      <PostMeta
        :user="post.user"
        :default-avatar="defaultAvatar"
        :published-label="publishedLabel"
        :reaction-badge="reactionBadge"
        :comment-badge="commentBadge"
      />

      <div class="space-y-4">
        <h2
          class="text-3xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-primary"
        >
          {{ post.title }}
        </h2>
        <p class="text-base text-slate-200/80">
          {{ post.summary }}
        </p>
      </div>

      <section
        v-if="hasCommentPreview"
        class="rounded-2xl border border-white/10 bg-black/20 p-6"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
            {{ recentCommentsLabel }}
          </p>
          <p class="text-xs text-slate-400">
            {{ commentPreviewCountLabel }}
          </p>
        </div>
        <div class="mt-4 space-y-4">
          <CommentCard
            v-for="comment in topComments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </section>

      <footer
        v-if="hasReactionPreview"
        class="flex flex-wrap items-center gap-3 text-sm"
      >
        <span class="text-xs uppercase tracking-wide text-slate-400">
          {{ highlightedReactionsLabel }}
        </span>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="reaction in topReactions"
            :key="reaction.id"
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-slate-200 shadow-sm"
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
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

import CommentCard from "~/components/CommentCard.vue";
import PostMeta from "~/components/blog/PostMeta.vue";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

const props = defineProps<{
  post: BlogPost;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: Record<ReactionType, string>;
}>();

const { locale, t } = useI18n();

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
  t("blog.reactions.posts.publishedOn", { date: formatDateTime(props.post.publishedAt) }),
);

const reactionBadge = computed(() => ({
  icon: props.reactionEmojis.like,
  display: formatNumber(props.post.reactions_count),
  ariaLabel: t("blog.reactions.posts.reactionCount", {
    count: formatNumber(props.post.reactions_count),
  }),
}));

const commentBadge = computed(() => ({
  icon: "💬",
  display: formatNumber(props.post.totalComments),
  ariaLabel: t("blog.reactions.posts.commentCount", {
    count: formatNumber(props.post.totalComments),
  }),
}));

const recentCommentsLabel = computed(() => t("blog.reactions.posts.recentComments"));

const commentPreviewCountLabel = computed(() =>
  t("blog.reactions.posts.previewCount", {
    count: formatNumber(props.post.comments_preview.length),
  }),
);

const highlightedReactionsLabel = computed(() => t("blog.reactions.posts.highlightedReactions"));

const topComments = computed(() => props.post.comments_preview.slice(0, 4));
const topReactions = computed(() => props.post.reactions_preview.slice(0, 4));
const hasCommentPreview = computed(() => topComments.value.length > 0);
const hasReactionPreview = computed(() => topReactions.value.length > 0);
</script>
