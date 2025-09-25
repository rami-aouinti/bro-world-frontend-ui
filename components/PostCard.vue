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
      <section
        v-if="hasCommentPreview"
        class="rounded-3xl p-6 sm:p-7"
      >

        <div class="w-full max-w-2xl space-y-5 px-1.5 pt-1 sm:px-2 px-2">
          <CommentCard
            v-for="comment in topComments"
            :key="comment.id"
            :comment="comment"
            class="mx-1.5 w-full sm:mx-2"
          />
        </div>
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

const topComments = computed(() => props.post.comments_preview.slice(0, 4));
const topReactions = computed(() => props.post.reactions_preview.slice(0, 4));
const hasCommentPreview = computed(() => topComments.value.length > 0);
const hasReactionPreview = computed(() => topReactions.value.length > 0);
</script>
