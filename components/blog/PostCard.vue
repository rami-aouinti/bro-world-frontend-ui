<template>
  <article
    class="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)]"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    />
    <div class="relative flex flex-col gap-8 p-8 sm:p-10">
      <header class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-4">
          <div
            class="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10"
          >
            <img
              :src="post.user.photo ?? defaultAvatar"
              :alt="`${post.user.firstName} ${post.user.lastName}`"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-200">
              {{ post.user.firstName }} {{ post.user.lastName }}
            </p>
            <p class="text-xs text-slate-400">
              {{ t("blog.post.publishedOn", { date: formatDateTime(post.publishedAt) }) }}
            </p>
          </div>
        </div>
        <div class="ms-auto flex flex-wrap gap-3 text-sm text-slate-200">
          <span
            :aria-label="t('blog.post.reactions', { count: formatNumber(post.reactions_count) })"
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
          >
            <span
              aria-hidden="true"
              class="text-base"
              >{{ reactionEmojis.like }}</span
            >
            <span aria-hidden="true">{{ formatNumber(post.reactions_count) }}</span>
          </span>
          <span
            :aria-label="t('blog.post.comments', { count: formatNumber(post.totalComments) })"
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
          >
            <span
              aria-hidden="true"
              class="text-base"
              >💬</span
            >
            <span aria-hidden="true">{{ formatNumber(post.totalComments) }}</span>
          </span>
        </div>
      </header>

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

      <div
        v-if="post.comments_preview.length"
        class="rounded-2xl border border-white/10 bg-black/20 p-6"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
            {{ t("blog.post.recentComments") }}
          </p>
          <p class="text-xs text-slate-400">
            {{
              t("blog.post.commentPreviews", { count: formatNumber(post.comments_preview.length) })
            }}
          </p>
        </div>
        <div class="mt-4 space-y-4">
          <CommentCard
            v-for="comment in post.comments_preview.slice(0, 4)"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </div>

      <footer
        v-if="post.reactions_preview.length"
        class="flex flex-wrap items-center gap-3 text-sm"
      >
        <span class="text-xs uppercase tracking-wide text-slate-400">
          {{ t("blog.post.reactionSpotlight") }}
        </span>
        <div class="flex flex-wrap gap-3">
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
  like: t("blog.reactionTypes.like"),
  love: t("blog.reactionTypes.love"),
  wow: t("blog.reactionTypes.wow"),
  haha: t("blog.reactionTypes.haha"),
  sad: t("blog.reactionTypes.sad"),
  angry: t("blog.reactionTypes.angry"),
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

const post = computed(() => props.post);
</script>
