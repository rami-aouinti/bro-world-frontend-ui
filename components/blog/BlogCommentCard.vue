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
            :aria-label="t('blog.reactions.comment.reactions', { count: formatNumber(commentReactionCount) })"
            class="inline-flex items-center gap-1 font-medium"
        >
          <span aria-hidden="true" class="text-base">👍</span>
          <span aria-hidden="true">{{ formatNumber(commentReactionCount) }}</span>
        </span>
      <span
          :aria-label="t('blog.reactions.comment.replies', { count: formatNumber(commentReplyCount) })"
          class="inline-flex items-center gap-1 font-medium"
      >
          <span aria-hidden="true" class="text-base">💬</span>
          <span aria-hidden="true">{{ formatNumber(commentReplyCount) }}</span>
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

interface ReactionAggregate {
  reactions_count?: number | null;
  likes_count?: number | null;
  likes?: unknown[] | null;
  reactions?: unknown[] | null;
}

interface CommentAggregate {
  totalComments?: number | null;
  children?: unknown;
  comments?: unknown;
  replies?: unknown;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function resolveReactionTotal(entity: ReactionAggregate): number {
  const candidates: Array<number | null> = [
    toFiniteNumber(entity.likes_count ?? null),
    toFiniteNumber(entity.reactions_count ?? null),
  ];

  for (const candidate of candidates) {
    if (candidate !== null) {
      return candidate;
    }
  }

  if (Array.isArray(entity.likes)) {
    return entity.likes.length;
  }

  if (Array.isArray(entity.reactions)) {
    return entity.reactions.length;
  }

  return 0;
}

function resolveReplyTotal(entity: CommentAggregate): number {
  const directTotal = toFiniteNumber(entity.totalComments ?? null);

  if (directTotal !== null) {
    return directTotal;
  }

  const collections = [entity.children, entity.comments, entity.replies];

  for (const candidate of collections) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  return 0;
}

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
const commentReactionCount = computed(() => resolveReactionTotal(comment.value as ReactionAggregate));
const commentReplyCount = computed(() => resolveReplyTotal(comment.value as CommentAggregate));
</script>
