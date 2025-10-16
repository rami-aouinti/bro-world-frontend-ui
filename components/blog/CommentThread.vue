<!-- components/CommentThread.vue -->
<template>
  <div>
    <div
      v-for="(node, index) in nodes"
      :key="node.id ?? `comment-${index}`"
      :style="{ marginLeft: depth > 0 ? `${46}px` : 0 }"
    >
      <div class="comment">
        <v-avatar
          size="34"
          class="mr-2"
        >
          <v-img
            :src="resolveCommentAvatar(node.user.photo)"
            alt=""
            width="34"
            height="34"
          />
        </v-avatar>
        <div class="bubble">
          <div class="bubble__inner">
            <div class="bubble__author">{{ node.user.firstName }} {{ node.user.lastName }}</div>
            <div
              class="bubble__message"
              dir="auto"
            >
              {{ node.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- meta -->
      <div
        class="meta"
        style="margin-top: 10px"
      >
        <span class="meta__time">{{ formatTime(node.publishedAt) }}</span>
        <ReactionPicker
          v-if="canRenderAuthUi"
          class="like-size-sm"
          @like="emit('like', node.id)"
          @select="(r) => emit('react', { id: node.id, type: r })"
        />
        <button
          v-if="canRenderAuthUi"
          class="meta__btn"
          @click="toggleReply(node.id)"
        >
          {{ t("blog.comments.reply") }}
        </button>
        <span
          v-if="getReactionTotal(node) > 0"
          class="total"
          >{{ getReactionTotal(node) }}</span
        >
        <div
          class="bubblesReacts"
          role="img"
          :aria-label="reactionAriaLabel(node)"
        >
          <v-avatar
            v-for="(r, i) in topReactions"
            :key="`${r.type}-${i}`"
            size="22"
            class="bubbleReacts"
            :style="{ left: `${i * 14}px`, zIndex: 10 - i }"
            variant="flat"
          >
            <span
              class="bubbleReactsEmoji"
              aria-hidden="true"
            >
              {{ reactionEmojiMap[r.type] }}
            </span>
          </v-avatar>
        </div>
      </div>
      <div class="meta py-2">
        <template v-if="(node.children?.length || 0) > 0">
          <button
            class="meta__btn"
            @click="toggleExpand(node.id)"
          >
            <Icon
              v-if="expanded[node.id]"
              name="mdi-message"
              >{{ `${node.children!.length} ` }}</Icon
            >
            {{
              expanded[node.id]
                ? t("blog.comments.thread.hideReplies")
                : t("blog.comments.thread.showReplies", { count: node.children!.length })
            }}
          </button>
        </template>
      </div>

      <div
        v-if="replying[node.id]"
        class="reply-composer"
      >
        <PostCommentForm
          :avatar="resolveComposerAvatar(props.currentUser?.photo)"
          :placeholder="t('blog.comments.replyPlaceholder')"
          :disabled="!canRenderAuthUi"
          @submit="(t) => emit('submit', t)"
        />
      </div>

      <!-- sous-commentaires (récursif) -->
      <CommentThread
        v-if="expanded[node.id] && (node.children?.length || 0) > 0"
        :counts="{ care: 0, love: 0, wow: 0, sad: 0, like: 4, haha: 2, angry: 1 }"
        :nodes="node.children!"
        :depth="(depth ?? 0) + 1"
        :current-user="props.currentUser"
        @like="(id) => emit('like', id)"
        @reply="(pid, text) => emit('reply', pid, text)"
        @more="(id) => emit('more', id)"
      />
    </div>
    <div
      v-if="canRenderAuthUi && composerVisible"
      class="mt-2"
    >
      <PostCommentForm
        :placeholder="commentPlaceholder"
        :avatar="resolveComposerAvatar(props.currentUser?.photo)"
        :disabled="!canRenderAuthUi"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  computed,
  watch,
  defineAsyncComponent,
  ref,
  onBeforeUnmount,
  type WatchStopHandle,
} from "vue";
import { onNuxtReady } from "#app";
import { useI18n } from "vue-i18n";
import type { Reaction as PickerReaction } from "~/components/blog/ReactionPicker.vue";
import { useAuthSession } from "~/stores/auth-session";
import { useRelativeTime } from "~/composables/useRelativeTime";
import { optimizeAvatarUrl } from "~/lib/images/avatar";

const ReactionPicker = defineAsyncComponent({
  loader: () => import("~/components/blog/ReactionPicker.vue"),
  suspensible: false,
});
const PostCommentForm = defineAsyncComponent({
  loader: () => import("~/components/forms/PostCommentForm.vue"),
  suspensible: false,
});

type Reaction = PickerReaction;
const fallbackAvatar = "/images/placeholders/avatar-2.svg";
const reactionEmojiMap: Record<Reaction, string> = {
  like: "👍",
  love: "❤️",
  care: "🤗",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};
const auth = useAuthSession();
const isHydrated = ref(false);

const canRenderAuthUi = computed(
  () => isHydrated.value && auth.isReady.value && auth.isAuthenticated.value,
);
const composerVisible = defineModel<boolean>("composerVisible", { default: false });

const avatarSize = 34;

function resolveCommentAvatar(src: string | null | undefined): string {
  return optimizeAvatarUrl(src ?? null, avatarSize) ?? fallbackAvatar;
}

function resolveComposerAvatar(src: string | null | undefined): string | undefined {
  return optimizeAvatarUrl(src ?? null, avatarSize) ?? undefined;
}

let stopAuthWatcher: WatchStopHandle | null = null;

if (import.meta.client) {
  onNuxtReady(() => {
    isHydrated.value = true;

    stopAuthWatcher = watch(
      canRenderAuthUi,
      (value) => {
        if (!value) {
          composerVisible.value = false;
        }
      },
      { immediate: true, flush: "post" },
    );
  });

  onBeforeUnmount(() => {
    stopAuthWatcher?.();
    stopAuthWatcher = null;
  });
}
export type CommentNode = {
  id: string;
  user: { firstName?: string; lastName?: string; photo?: string };
  content: string;
  publishedAt: Date | string | number;
  reactions?: Partial<Record<Reaction, number>>;
  children?: CommentNode[];
};

defineOptions({ name: "CommentThread" });

const props = defineProps<{
  counts: Record<Reaction, number>;
  nodes: CommentNode[];
  depth?: number;
  currentUser?: { firstName?: string; lastName?: string; photo?: string };
}>();

const emit = defineEmits<{
  (e: "like", id: string): void;
  (e: "reply", parentId: string, text: string): void;
  (e: "more", id: string): void;
  (e: "submit", text: string): void;
  (e: "react", payload: { id: string; type: Reaction }): void;
}>();

const { t } = useI18n();
const { formatRelativeTime } = useRelativeTime();

const depth = computed(() => props.depth ?? 0);
const bubbleOrder: Reaction[] = ["like", "sad", "angry"];
const topReactions = computed(() =>
  bubbleOrder
    .map((type) => ({ type, count: props.counts?.[type] ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3),
);

const reactionSummaries = computed(() => {
  const summaries = new Map<string, { total: number; ariaLabel: string }>();

  function computeForNode(node?: CommentNode) {
    if (!node) {
      return;
    }

    const total = Object.values(node.reactions ?? {}).reduce((sum, count) => sum + (count ?? 0), 0);
    const ariaLabel =
      total <= 0
        ? t("blog.reactions.posts.reactLabel")
        : t("blog.reactions.comments.reactionCount", { count: total });

    summaries.set(node.id, { total, ariaLabel });

    node.children?.forEach((child) => computeForNode(child));
  }

  props.nodes?.forEach((node) => computeForNode(node));

  return summaries;
});
// états UI par id
const expanded = reactive<Record<string, boolean>>({});
const replying = reactive<Record<string, boolean>>({});
const replyText = reactive<Record<string, string>>({});

const commentPlaceholder = computed(() => {
  const firstName = props.currentUser?.firstName ?? "";
  const lastName = props.currentUser?.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim();

  if (name) {
    return t("blog.comments.placeholderWithName", { name });
  }

  return t("blog.comments.placeholder");
});

function toggleExpand(id: string) {
  expanded[id] = !expanded[id];
}
function toggleReply(id: string) {
  replying[id] = !replying[id];
}

function handleSubmit(text: string) {
  emit("submit", text);
}
function formatTime(value: Date | string | number) {
  return formatRelativeTime(value);
}

function getReactionTotal(node: CommentNode) {
  return reactionSummaries.value.get(node.id)?.total ?? 0;
}

function reactionAriaLabel(node: CommentNode) {
  return reactionSummaries.value.get(node.id)?.ariaLabel ?? t("blog.reactions.posts.reactLabel");
}
</script>

<style scoped>
.comment {
  display: flex;
  align-items: flex-start;
  margin-top: 12px;
}
.bubblesReacts {
  position: relative;
  height: 22px;
  width: 60px; /* s’adapte à 3 bulles chevauchées */
}
.bubbleReacts {
  position: absolute;
  top: 0;
  border: 2px solid var(--v-theme-surface); /* anneau blanc */
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.bubbleReactsEmoji {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  line-height: 1;
}
.bubble {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.bubble__inner {
  border: 0 !important;
  box-shadow: 0 18px 40px -22px rgba(var(--v-theme-on-surface), 0.12);
  padding: 8px 12px;
  max-width: 680px;
}
.bubble__author {
  font-weight: 700;
  margin-bottom: 2px;
}
.bubble__message {
  white-space: pre-wrap;
  word-break: break-word;
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 46px;
  flex-wrap: wrap;
}
.meta__time {
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 0.8rem;
}
.meta__btn {
  background: none;
  border: 0;
  padding: 2px 4px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  line-height: 1;
}
.meta__btn.more {
  letter-spacing: 2px;
}
.reply-composer {
  align-items: flex-start;
  margin-left: 46px;
  margin-top: 6px;
}
.box {
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px));
  padding: 4px 6px;
}
.grow-input :deep(textarea) {
  padding-top: 8px !important;
  padding-bottom: 6px !important;
}
.toolbar {
  display: flex;
  align-items: center;
  padding: 0 4px 4px;
}
</style>
