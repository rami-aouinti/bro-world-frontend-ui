<template>
  <article
    class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.75)] backdrop-blur"
  >
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <img
          :src="comment.user.photo ?? defaultAvatar"
          :alt="`${comment.user.firstName} ${comment.user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-100">
          {{ comment.user.firstName }} {{ comment.user.lastName }}
        </p>
        <p class="text-[11px] uppercase tracking-wide text-slate-400">
          {{ formatDateTime(comment.publishedAt) }}
        </p>
      </div>
    </div>
    <p class="text-sm leading-relaxed text-slate-200/90">
      {{ comment.content }}
    </p>
    <div
      class="mt-1 flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-xs text-slate-400"
    >
      <span
        :aria-label="
          t('blog.reactions.comment.reactions', { count: formatNumber(comment.reactions_count) })
        "
        class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-slate-200 shadow-[0_10px_25px_-20px_rgba(15,23,42,1)]"
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
        class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-slate-200 shadow-[0_10px_25px_-20px_rgba(15,23,42,1)]"
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

defineOptions({
  name: "BlogCommentCard",
});

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
