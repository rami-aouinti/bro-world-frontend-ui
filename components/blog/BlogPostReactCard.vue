<!-- components/ReactionBar.vue -->
<template>
  <div class="reaction-bar">
    <!-- Gauche : bulles de réactions + total -->
    <div class="left">
      <div
        class="bubbles"
        role="img"
        :aria-label="reactionListLabel"
      >
        <v-avatar
          v-for="(r, i) in topReactions"
          :key="`${r.type}-${i}`"
          size="22"
          class="bubble"
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

      <span
        v-if="reacts > 0"
        class="total"
        >{{ reacts }}</span
      >
    </div>

    <div class="right">
      <Icon
        name="mdi-chat-outline"
        size="18"
      ></Icon>
      <span
        v-if="(comments ?? 0) > 0"
        class="ml-1"
        >{{ comments }}</span
      >
      <Icon
        class="ml-2"
        name="mdi-share-outline"
        size="18"
      ></Icon>
      <span
        v-if="(shares ?? 0) > 0"
        class="ml-1"
        >{{ shares }}</span
      >
    </div>
  </div>
  <ClientOnly>
    <div
      v-if="showAuthUi"
      class="reaction-bar"
    >
      <!-- Actions -->
      <div class="actions">
        <ReactionPicker
          class="like-size-lg"
          @like="onToggleLike"
          @select="handleSelect"
        />
        <v-btn
          variant="text"
          density="comfortable"
          class="action-btn"
          @click="$emit('comment')"
        >
          <Icon
            name="mdi-chat-outline"
            start
          ></Icon>
          {{ t("blog.posts.actions.comment") }}
        </v-btn>
        <v-btn
          variant="text"
          @click="$emit('share')"
        >
          <Icon
            name="mdi-share-outline"
            start
          ></Icon>
          {{ t("blog.posts.actions.share") }}
        </v-btn>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Reaction as PickerReaction } from "~/components/blog/ReactionPicker.vue";
import { useAuthSession } from "~/stores/auth-session";
import type { BlogPost } from "~/lib/mock/blog";

const ReactionPicker = defineAsyncComponent({
  loader: () => import("~/components/blog/ReactionPicker.vue"),
  suspensible: false,
});

type Reaction = PickerReaction;

const auth = useAuthSession();
const canRenderAuthUi = computed(() => auth.isReady.value && auth.isAuthenticated.value);
const isHydrated = ref(false);
const showAuthUi = computed(() => isHydrated.value && canRenderAuthUi.value);
onMounted(() => {
  isHydrated.value = true;
});
type ReactionNode = Pick<BlogPost, "id"> | { id?: string | number } | null;

const props = defineProps<{
  counts: Record<Reaction, number>;
  reacts?: number;
  comments?: number;
  shares?: number;
  liked?: boolean;
  node?: ReactionNode;
}>();

const emit = defineEmits<{
  (e: "toggle-like", value: boolean): void;
  (e: "comment"): void;
  (e: "share"): void;
  (e: "react", payload: { id?: string; type: PickerReaction }): void;
}>();

const isLiked = ref(!!props.liked);

const { t } = useI18n();

// Choisit les 3 réactions les plus fréquentes (ordre “Facebook-ish”)
const bubbleOrder: Reaction[] = ["like", "sad", "angry"];
const topReactions = computed(() =>
  bubbleOrder
    .map((type) => ({ type, count: props.counts?.[type] ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3),
);

function onToggleLike() {
  isLiked.value = !isLiked.value;
  emit("toggle-like", isLiked.value);
}

const likeBtnRef = ref<HTMLElement | null>(null);
const pickerOpen = ref(false);
const anchor = ref<{ x: number; y: number; width: number; height: number } | null>(null);
let openTimer: number | null = null;
let longPressTimer: number | null = null;

function calcAnchor() {
  const el = likeBtnRef.value;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: r.left + window.scrollX,
    y: r.top + window.scrollY,
    width: r.width,
    height: r.height,
  };
}

function onMouseEnter() {
  if (pickerOpen.value) return;
  if (openTimer) {
    window.clearTimeout(openTimer);
    openTimer = null;
  }
  openTimer = window.setTimeout(() => {
    anchor.value = calcAnchor();
    pickerOpen.value = true;
  }, 250); // petit délai comme Facebook
}
function onMouseLeave() {
  if (openTimer) {
    window.clearTimeout(openTimer);
    openTimer = null;
  }
  // la fermeture se fait dans le picker (click dehors) + petit délai pour permettre d'atteindre le popover
  window.setTimeout(() => {
    // si la souris n'est pas au-dessus du picker, il se fermera via doc listener
  }, 150);
}

// Mobile : appui long
function onPointerDown() {
  longPressTimer = window.setTimeout(() => {
    anchor.value = calcAnchor();
    pickerOpen.value = true;
  }, 350);
}
function onPointerUp() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function handleSelect(r: PickerReaction) {
  pickerOpen.value = false;
  emit("react", { id: props.node?.id, type: r });
}

const reactionListLabel = computed(() => {
  const total = props.reacts ?? 0;

  if (total > 0) {
    return t("blog.reactions.posts.reactionCount", { count: total });
  }

  return t("blog.reactions.posts.reactLabel");
});
</script>

<style scoped>
.reaction-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 3px;
}

.left {
  display: flex;
  align-items: center;
  min-width: 80px;
}
.bubbles {
  position: relative;
  height: 22px;
  width: 60px; /* s’adapte à 3 bulles chevauchées */
}
.bubble {
  position: absolute;
  top: 0;
  border: 2px solid var(--v-theme-surface); /* anneau blanc */
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.total {
  font-weight: 600;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
}
.action-btn {
  text-transform: none;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  justify-content: flex-end;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.comment-actions {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
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
</style>
