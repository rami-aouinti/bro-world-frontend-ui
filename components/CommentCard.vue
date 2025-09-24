<template>
  <article class="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 sm:p-6">
    <div class="flex items-center gap-4">
      <div class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:h-12 sm:w-12">
        <img
          :src="comment.user.photo ?? defaultAvatar"
          :alt="`${comment.user.firstName} ${comment.user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-sm font-medium text-slate-200">
          {{ comment.user.firstName }} {{ comment.user.lastName }}
        </p>
        <p class="text-[11px] uppercase tracking-wide text-slate-400">
          {{ formatDateTime(comment.publishedAt) }}
        </p>
      </div>
    </div>
    <p class="text-sm leading-relaxed text-slate-200/80">
      {{ comment.content }}
    </p>
    <div class="mt-auto flex items-center justify-between text-xs text-slate-400">
      <span
        :aria-label="reactionsAriaLabel"
        class="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5"
      >
        <span aria-hidden="true" class="text-base">👍</span>
        <span aria-hidden="true">{{ reactionsDisplay }}</span>
      </span>
      <span
        :aria-label="repliesAriaLabel"
        class="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5"
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
