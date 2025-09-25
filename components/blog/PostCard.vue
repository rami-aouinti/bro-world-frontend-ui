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

      <div class="mx-auto py-4 space-y-2">
        <h4
          class="text-2xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-primary"
        >
          {{ post.title }}
        </h4>
        <p class="text-base text-slate-200/80">
          {{ post.summary }}
        </p>
      </div>

      <div
        v-if="post.comments_preview.length"
        class="rounded-2xl border border-white/10 bg-black/20 p-6"
      >
        <div class="flex items-center justify-between mx-auto py-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
            {{ t("blog.reactions.post.recentComments") }}
          </p>
          <p class="text-xs text-slate-400">
            {{
              t("blog.reactions.post.commentPreviews", {
                count: formatNumber(post.comments_preview.length),
              })
            }}
          </p>
        </div>
        <div class="mt-2 space-y-2 mx-auto py-2">
          <CommentCard
            v-for="comment in post.comments_preview.slice(0, 4)"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </div>

      <footer
        v-if="post.reactions_preview.length"
        class="flex flex-wrap items-center gap-3 text-sm mx-auto py-2"
      >
        <span class="text-xs uppercase tracking-wide text-slate-400">
          {{ t("blog.reactions.post.reactionSpotlight") }}
        </span>
        <div class="flex flex-wrap gap-3 mx-auto py-2">
          <div
            v-for="reaction in post.reactions_preview.slice(0, 4)"
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
import CommentCard from "./CommentCard.vue";
import PostMeta from "./PostMeta.vue";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

const props = defineProps<{ post: BlogPost }>();

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

const publishedLabel = computed(() =>
  t("blog.reactions.post.publishedOn", { date: formatDateTime(props.post.publishedAt) }),
);

const reactionBadge = computed(() => ({
  icon: reactionEmojis.like,
  display: formatNumber(props.post.reactions_count),
  ariaLabel: t("blog.reactions.post.reactions", {
    count: formatNumber(props.post.reactions_count),
  }),
}));

const commentBadge = computed(() => ({
  icon: "💬",
  display: formatNumber(props.post.totalComments),
  ariaLabel: t("blog.reactions.post.comments", {
    count: formatNumber(props.post.totalComments),
  }),
}));

const post = computed(() => props.post);
</script>
