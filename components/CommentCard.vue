<template>
  <article
    class="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsla(var(--primary-hue,221),100%,72%,0.22),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-90"
    />
    <div class="relative flex items-start gap-4">
      <div
        class="relative h-12 w-12 rounded-2xl border border-white/10 bg-slate-900/60 p-[2px] shadow-[0_10px_25px_-15px_rgba(15,23,42,0.9)] sm:h-14 sm:w-14"
      >
        <div class="h-full w-full overflow-hidden rounded-[18px]">
          <img
            :src="comment.user.photo ?? defaultAvatar"
            :alt="`${comment.user.firstName} ${comment.user.lastName}`"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
  <article class="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.9)] sm:p-6">
    <div class="flex items-center gap-4">
      <div class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:h-12 sm:w-12">
        <img
          :src="comment.user.photo ?? defaultAvatar"
          :alt="`${comment.user.firstName} ${comment.user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-white">
          {{ comment.user.firstName }} {{ comment.user.lastName }}
        </p>
        <p class="mt-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
          {{ formatDateTime(comment.publishedAt) }}
        </p>
      </div>
    </div>
    <blockquote class="relative rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm leading-relaxed text-slate-200/90">
      <span class="absolute -left-3 -top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-2xl text-primary/80">“</span>
      {{ comment.content }}
    </blockquote>
    <div class="relative mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300/90">
      <span
        :aria-label="reactionsAriaLabel"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3.5 py-1.5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.9)]"
      >
        <span aria-hidden="true" class="text-base">👍</span>
        <span aria-hidden="true">{{ reactionsDisplay }}</span>
      </span>
      <span
        :aria-label="repliesAriaLabel"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/30 px-3.5 py-1.5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.9)]"
      >
        <span aria-hidden="true" class="text-base">💬</span>
        <span aria-hidden="true">{{ repliesDisplay }}</span>
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { BlogCommentPreview } from "~/lib/mock/blog";

const props = defineProps<{ comment: BlogCommentPreview }>();

const defaultAvatar = "https://bro-world-space.com/img/person.png";

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

const reactionsDisplay = computed(() => formatNumber(props.comment.reactions_count));
const repliesDisplay = computed(() => formatNumber(props.comment.totalComments));

const reactionsAriaLabel = computed(() =>
  t("blog.reactions.comments.reactionCount", {
    count: reactionsDisplay.value,
  }),
);

const repliesAriaLabel = computed(() =>
  t("blog.reactions.comments.replyCount", {
    count: repliesDisplay.value,
  }),
);

const comment = computed(() => props.comment);
</script>
