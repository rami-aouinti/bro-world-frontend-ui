<template>
  <article class="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10">
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
      <span class="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1">
        <span class="text-base">{{ reactionEmojis.like }}</span>
        {{ reactionsLabel }}
      </span>
      <span class="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1">
        <span class="text-base">💬</span>
        {{ repliesLabel }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { BlogCommentPreview, ReactionType } from "~/lib/mock/blog";

type FormatDateTime = (value: string) => string;
type FormatNumber = (value: number | null | undefined) => string;

const props = defineProps<{
  comment: BlogCommentPreview;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  formatDateTime: FormatDateTime;
  formatNumber: FormatNumber;
}>();

const { t } = useI18n();

const reactionsLabel = computed(() =>
  t("blog.comments.reactionCount", {
    count: props.formatNumber(props.comment.reactions_count),
  }),
);

const repliesLabel = computed(() =>
  t("blog.comments.replyCount", {
    count: props.formatNumber(props.comment.totalComments),
  }),
);
</script>
