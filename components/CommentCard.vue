<template>
  <article
    :class="[
      'flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 px-5 py-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,1)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40',
      depth > 0 ? 'ml-6 border-l border-white/10 pl-5' : '',
    ]"
  >
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-[0_12px_25px_-20px_rgba(15,23,42,1)]">
        <img
          :src="comment.user.photo ?? avatarFallback"
          :alt="`${comment.user.firstName} ${comment.user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-100">
          {{ comment.user.firstName }} {{ comment.user.lastName }}
        </p>
        <p class="text-[11px] uppercase tracking-[0.35em] text-slate-400">
          {{ formatDateTime(comment.publishedAt) }}
        </p>
      </div>
    </div>

    <p class="text-sm leading-relaxed text-slate-200/90">
      {{ comment.content }}
    </p>

    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="type in reactionTypes"
            :key="type"
            type="button"
            :aria-label="reactionLabels[type]"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent text-base text-slate-100 shadow-[0_12px_25px_-20px_rgba(15,23,42,1)] transition-colors hover:border-primary/60 hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!!reactingType"
            @click="handleReact(type)"
          >
            <span aria-hidden="true">{{ reactionEmojis[type] }}</span>
          </button>

          <div
            v-if="hasReactionPreview"
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-slate-100 shadow-[0_15px_35px_-28px_rgba(15,23,42,1)]"
          >
            <span v-for="reaction in comment.reactions_preview" :key="reaction.id" class="text-sm" aria-hidden="true">
              {{ reactionEmojis[reaction.type] }}
            </span>
            <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span
            :aria-label="reactionCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-slate-100 shadow-[0_15px_35px_-28px_rgba(15,23,42,1)]"
          >
            <span aria-hidden="true">👍</span>
            <span aria-hidden="true">{{ formatNumber(comment.reactions_count) }}</span>
          </span>
          <span
            :aria-label="replyCountLabel"
            class="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-slate-100 shadow-[0_15px_35px_-28px_rgba(15,23,42,1)]"
          >
            <span aria-hidden="true">💬</span>
            <span aria-hidden="true">{{ formatNumber(comment.totalComments) }}</span>
          </span>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-semibold text-slate-100 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            @click="toggleReply"
          >
            <span v-if="replying">{{ t('blog.comments.cancelReply') }}</span>
            <span v-else>{{ t('blog.comments.reply') }}</span>
          </button>
        </div>
      </div>

      <p v-if="reactionError" class="text-xs text-rose-300">
        {{ reactionError }}
      </p>
    </div>

    <form
      v-if="replying"
      class="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.95)]"
      @submit.prevent="handleReplySubmit"
    >
      <label class="flex flex-col gap-2 text-xs text-slate-200">
        <span class="sr-only">{{ t('blog.comments.replyPlaceholder') }}</span>
        <textarea
          v-model="replyContent"
          class="min-h-[96px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          :placeholder="t('blog.comments.replyPlaceholder')"
        />
      </label>
      <div class="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p
          v-if="replyFeedback"
          :class="replyFeedback.type === 'success' ? 'text-emerald-300' : 'text-rose-300'"
        >
          {{ replyFeedback.message }}
        </p>
        <div class="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-slate-50"
            @click="cancelReply"
          >
            {{ t('blog.comments.cancelReply') }}
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 font-semibold text-white shadow-[0_18px_35px_-22px_hsl(var(--primary)/0.9)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submittingReply"
          >
            <span v-if="submittingReply">{{ t('blog.comments.replying') }}</span>
            <span v-else>{{ t('blog.comments.replySubmit') }}</span>
          </button>
        </div>
      </div>
    </form>

    <div v-if="hasChildren" class="space-y-3">
      <CommentCard
        v-for="child in childComments"
        :key="child.id"
        :comment="child"
        :default-avatar="avatarFallback"
        :reaction-emojis="reactionEmojis"
        :reaction-labels="reactionLabels"
        :react-to-comment="reactToComment"
        :reply-to-comment="replyToComment"
        :depth="depth + 1"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { BlogCommentWithReplies, ReactionType } from "~/lib/mock/blog";

defineOptions({ name: "CommentCard" });

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const props = defineProps<{
  comment: BlogCommentWithReplies;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: Record<ReactionType, string>;
  depth?: number;
  reactToComment?: (commentId: string, reactionType: ReactionType) => Promise<void> | void;
  replyToComment?: (commentId: string, content: string) => Promise<void> | void;
}>();

const { locale, t } = useI18n();

const comment = computed(() => props.comment);
const depth = computed(() => props.depth ?? 0);
const avatarFallback = computed(() => props.defaultAvatar || "https://bro-world-space.com/img/person.png");
const reactionTypes = computed(() => Object.keys(props.reactionEmojis) as ReactionType[]);
const hasReactionPreview = computed(() => (comment.value.reactions_preview ?? []).length > 0);
const childComments = computed(() => comment.value.comments ?? comment.value.replies ?? comment.value.children ?? []);
const hasChildren = computed(() => childComments.value.length > 0);

const reactingType = ref<ReactionType | null>(null);
const reactionError = ref<string | null>(null);
const replying = ref(false);
const submittingReply = ref(false);
const replyContent = ref("");
const replyFeedback = ref<FeedbackState | null>(null);

const reactionCountLabel = computed(() =>
  t("blog.reactions.comment.reactions", { count: formatNumber(comment.value.reactions_count) }),
);
const replyCountLabel = computed(() =>
  t("blog.reactions.comment.replies", { count: formatNumber(comment.value.totalComments) }),
);

watch(
  () => comment.value.id,
  () => {
    replying.value = false;
    submittingReply.value = false;
    replyContent.value = "";
    replyFeedback.value = null;
    reactionError.value = null;
    reactingType.value = null;
  },
);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

function toggleReply() {
  replying.value = !replying.value;

  if (!replying.value) {
    replyContent.value = "";
    replyFeedback.value = null;
  }
}

function cancelReply() {
  replying.value = false;
  replyContent.value = "";
  replyFeedback.value = null;
}

async function handleReact(type: ReactionType) {
  if (reactingType.value) {
    return;
  }

  if (!props.reactToComment) {
    reactionError.value = t("blog.comments.reactionUnavailable");
    return;
  }

  reactingType.value = type;
  reactionError.value = null;

  try {
    await props.reactToComment(comment.value.id, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    reactionError.value = message || t("blog.comments.reactionError");
  } finally {
    reactingType.value = null;
  }
}

async function handleReplySubmit() {
  replyFeedback.value = null;

  const content = replyContent.value.trim();

  if (!content) {
    replyFeedback.value = {
      type: "error",
      message: t("blog.comments.replyValidation"),
    };
    return;
  }

  if (!props.replyToComment) {
    replyFeedback.value = {
      type: "error",
      message: t("blog.comments.replyUnavailable"),
    };
    return;
  }

  submittingReply.value = true;

  try {
    await props.replyToComment(comment.value.id, content);
    replyFeedback.value = {
      type: "success",
      message: t("blog.comments.replySuccess"),
    };
    replyContent.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    replyFeedback.value = {
      type: "error",
      message: message || t("blog.comments.replyError"),
    };
  } finally {
    submittingReply.value = false;
  }
}
</script>
