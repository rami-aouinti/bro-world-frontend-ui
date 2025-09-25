<template>
  <article class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-transparent p-4">
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
      <span
        :aria-label="
          t('blog.reactions.comment.reactions', { count: formatNumber(comment.reactions_count) })
        "
        class="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1"
      >
        <span
          aria-hidden="true"
          class="text-base"
          >👍</span
        >
        <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
      </span>
      <span
        :aria-label="
          t('blog.reactions.comment.replies', { count: formatNumber(comment.totalComments) })
        "
        class="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1"
      >
        <span
          aria-hidden="true"
          class="text-base"
          >💬</span
        >
        <span aria-hidden="true">{{ formatNumber(comment.totalComments) }}</span>
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BlogCommentPreview } from "~/lib/mock/blog";

import { computed } from "vue";

const props = defineProps<{ comment: BlogCommentPreview }>();

const defaultAvatar = "https://bro-world-space.com/img/person.png";

const { locale, t } = useI18n();

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

const comment = computed(() => props.comment);
</script>
