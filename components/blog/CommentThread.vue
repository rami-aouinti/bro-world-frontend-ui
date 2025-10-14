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
            :src="node.user.photo || 'https://i.pravatar.cc/80?img=5'"
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
            <!-- remplace par tes propres images si tu en as -->
            <v-img
              :src="
                {
                  like: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f44d.png',
                  sad: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f62d.png',
                  angry:
                    'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f620.png',
                }[r.type]
              "
              alt=""
              cover
              width="22"
              height="22"
            />
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
          :avatar="props.currentUser?.photo"
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
        :avatar="props.currentUser?.photo"
        :disabled="!canRenderAuthUi"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  watch,
  defineAsyncComponent,
  onMounted,
} from "vue";
import { useI18n } from "vue-i18n";
import type { Reaction as PickerReaction } from "~/components/blog/ReactionPicker.vue";
import { useAuthSession } from "~/stores/auth-session";
import { useRelativeTime } from "~/composables/useRelativeTime";

const ReactionPicker = defineAsyncComponent({
  loader: () => import("~/components/blog/ReactionPicker.vue"),
  suspensible: false,
});
const PostCommentForm = defineAsyncComponent({
  loader: () => import("~/components/forms/PostCommentForm.vue"),
  suspensible: false,
});

type Reaction = PickerReaction;
const auth = useAuthSession();
const isHydrated = ref(import.meta.server);
const canRenderAuthUi = computed(() => {
  if (!isHydrated.value) {
    return false;
  }

  return auth.isReady.value && auth.isAuthenticated.value;
});

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}
const composerVisible = defineModel<boolean>("composerVisible", { default: false });

if (import.meta.client) {
  watch(
    canRenderAuthUi,
    (value) => {
      if (!value) {
        composerVisible.value = false;
      }
    },
    { immediate: true, flush: "post" },
  );
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
const commentLabel = computed(() => t("blog.posts.actions.comment"));
const bubbleOrder: Reaction[] = ["like", "sad", "angry"];
const topReactions = computed(() =>
  bubbleOrder
    .map((type) => ({ type, count: props.counts?.[type] ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3),
);
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
  return Object.values(node.reactions ?? {}).reduce((sum, count) => sum + (count ?? 0), 0);
}

function reactionAriaLabel(node: CommentNode) {
  const total = getReactionTotal(node);

  if (total <= 0) {
    return t("blog.reactions.posts.reactLabel");
  }

  return t("blog.reactions.comments.reactionCount", { count: total });
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
  padding: 0;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.85rem;
  font-weight: 600;
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
  border-radius: 18px;
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
