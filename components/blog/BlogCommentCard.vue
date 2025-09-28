<template>
  <BaseCard
      as="article"
      variant="solid"
      padding="md"
      rounded="lg"
      spacing="sm"
      :class="[
      'w-full border border-slate-200 bg-white text-slate-800 shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
    ]"
      header-class="items-center gap-3"
      body-class="space-y-3 text-sm text-slate-700"
      :footer-divider="false"
  >
    <div class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
      <header class="flex items-center justify-between gap-3">
        <div class="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          <img
              :src="comment.user.photo ?? defaultAvatar"
              :alt="`${comment.user.firstName} ${comment.user.lastName}`"
              class="h-full w-full object-cover"
              loading="lazy"
          />
        </div>
        <p class="text-sm font-semibold text-slate-900">
          {{ comment.user.firstName }} {{ comment.user.lastName }}
        </p>
        <p class="text-xs text-slate-500">
          {{ publishedDisplay }}
        </p>
      </header>
      <p class="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
        {{ comment.content }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
        <span
          :aria-label="t('blog.reactions.comment.reactions', { count: formatNumber(comment.reactions_count) })"
          class="inline-flex items-center gap-1 font-medium"
        >
          <span aria-hidden="true" class="text-base">👍</span>
          <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
        </span>
        <span
          :aria-label="t('blog.reactions.comment.replies', { count: formatNumber(comment.totalComments) })"
          class="inline-flex items-center gap-1 font-medium"
        >
          <span aria-hidden="true" class="text-base">💬</span>
          <span aria-hidden="true">{{ formatNumber(comment.totalComments) }}</span>
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { BlogCommentPreview } from "~/lib/mock/blog";

import { computed } from "vue";
import {BaseCard} from "~/components/ui";


defineOptions({
  name: "BlogCommentCard",
});

const props = defineProps<{ comment: BlogCommentPreview }>();

const defaultAvatar = "https://bro-world-space.com/img/person.png";

const { locale, t } = useI18n();

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diff = date.getTime() - now;
  const intervals: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
  ];

  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: "auto" });

  for (const { unit, ms } of intervals) {
    const valueInUnit = diff / ms;
    if (Math.abs(valueInUnit) >= 1 || unit === "minute") {
      return rtf.format(Math.round(valueInUnit), unit);
    }
  }

  return rtf.format(0, "second");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

const comment = computed(() => props.comment);
const publishedDisplay = computed(() => {
  const relative = formatRelativeTime(comment.value.publishedAt);
  return relative || formatDateTime(comment.value.publishedAt);
});
</script>
