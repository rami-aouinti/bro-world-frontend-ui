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
    <CommentMeta
        :user="comment.user"
        :default-avatar="defaultAvatar"
        :published-label="publishedDisplay"
    />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      class="mt-2 text-sm leading-relaxed text-slate-700 [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold"
      v-html="sanitizedContent"
    ></div>
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

  </BaseCard>
</template>

<script setup lang="ts">
import type { BlogCommentPreview } from "~/lib/mock/blog";

import { computed } from "vue";
import CommentMeta from "~/components/blog/CommentMeta.vue";
import { BaseCard } from "~/components/ui";
import { sanitizeRichText } from "~/lib/sanitize-html";


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
const sanitizedContent = computed(() => sanitizeRichText(comment.value.content));
const publishedDisplay = computed(() => {
  const relative = formatRelativeTime(comment.value.publishedAt);
  return relative || formatDateTime(comment.value.publishedAt);
});
</script>
