<template>
  <article
    class="group relative overflow-hidden rounded-3xl p-6 shadow-[0_25px_55px_-25px_rgba(15,23,42,0.65)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] sm:p-8"
  >
    <div class="relative flex flex-col gap-12">
      <PostMeta
        :user="post.user"
        :default-avatar="defaultAvatar"
        :published-label="publishedLabel"
        :reaction-badge="reactionBadge"
        :comment-badge="commentBadge"
      />

      <div class="mx-auto w-full max-w-2xl space-y-6 py-2">
        <h2
          class="text-3xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-primary"
        >
          {{ post.title }}
        </h2>
        <p class="text-base leading-relaxed text-slate-200/80">
          {{ post.summary }}
        </p>
      </div>

      <section
        v-if="hasCommentPreview"
        class="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-7"
      >
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3 text-slate-200">
            <span class="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/20 text-lg">💬</span>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
              {{ recentCommentsLabel }}
            </p>
          </div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400/90">
            {{ commentPreviewCountLabel }}
          </p>
        </div>
        <div class="mx-auto mt-6 w-full max-w-2xl space-y-5 px-1.5 pt-1 sm:px-2">
          <CommentCard
            v-for="comment in topComments"
            :key="comment.id"
            :comment="comment"
            class="mx-1.5 w-full sm:mx-2"
          />
        </div>
      </section>

      <footer
        v-if="hasReactionPreview"
        class="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <span class="text-xs uppercase tracking-wide text-slate-300">
          {{ highlightedReactionsLabel }}
        </span>
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
