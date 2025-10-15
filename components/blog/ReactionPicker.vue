<template>
  <ClientOnly>
    <template #default>
      <v-menu
        v-model="open"
        open-on-hover
        close-on-content-click
        location="top"
        offset="8"
        :scrim="false"
        :eager="true"
        content-class="rx-menu-content rx-rounded"
      >
        <template #activator="{ props: activatorProps }">
          <button
            class="meta__btn"
            :class="`meta__btn--${props.btnSize}`"
            v-bind="activatorProps"
            @click.stop="
              () => {
                if (!open) emit('like');
              }
            "
            @pointerdown.passive="onPointerDown"
            @pointerup.passive="onPointerUp"
          >
            <Icon
              name="mdi-thumb-up-outline"
              start
            ></Icon>
            {{ t("blog.reactions.posts.likeAction") }}
          </button>
        </template>

        <div
          class="rx-bubble"
          role="listbox"
          :aria-label="t('blog.reactions.posts.reactLabel')"
        >
          <button
            v-for="it in items"
            :key="it.key"
            class="rx-item"
            :aria-label="it.label"
            role="option"
            @click.stop="emit('select', it.key)"
          >
            <span
              class="rx-emoji"
              aria-hidden="true"
            >
              {{ it.emoji }}
            </span>
          </button>
        </div>
      </v-menu>
    </template>

    <template #fallback>
      <button
        class="meta__btn"
        :class="`meta__btn--${props.btnSize}`"
        type="button"
        @click.stop="emit('like')"
      >
        <Icon
          name="mdi-thumb-up-outline"
          start
        ></Icon>
        {{ t("blog.reactions.posts.likeAction") }}
      </button>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

export type Reaction = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";
const emit = defineEmits<{ (e: "select", r: Reaction): void; (e: "like"): void }>();
const props = withDefaults(
  defineProps<{
    btnSize?: "sm" | "md" | "lg" | "xl";
  }>(),
  { btnSize: "md" },
);
const open = ref(false);
let longPressTimer: number | null = null;

const { t } = useI18n();

function onPointerDown() {
  if (!import.meta.client) {
    return;
  }

  longPressTimer = window.setTimeout(() => (open.value = true), 350);
}
function onPointerUp() {
  if (!import.meta.client) {
    return;
  }

  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

const items = computed(
  () =>
    [
      {
        key: "like",
        emoji: "👍",
        label: t("blog.reactions.reactionTypes.like"),
      },
      {
        key: "love",
        emoji: "❤️",
        label: t("blog.reactions.reactionTypes.love"),
      },
      {
        key: "care",
        emoji: "🤗",
        label: t("blog.reactions.reactionTypes.care"),
      },
      {
        key: "haha",
        emoji: "😂",
        label: t("blog.reactions.reactionTypes.haha"),
      },
      {
        key: "wow",
        emoji: "😮",
        label: t("blog.reactions.reactionTypes.wow"),
      },
      {
        key: "sad",
        emoji: "😢",
        label: t("blog.reactions.reactionTypes.sad"),
      },
      {
        key: "angry",
        emoji: "😡",
        label: t("blog.reactions.reactionTypes.angry"),
      },
    ] satisfies { key: Reaction; emoji: string; label: string }[],
);
</script>

<style scoped>
.meta__btn {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-weight: 600;
}
/* global/scoped */
.like-size-sm :deep(.meta__btn) {
  font-size: 0.8rem;
  padding: 2px 4px;
}
.like-size-md :deep(.meta__btn) {
  font-size: 0.95rem;
  padding: 4px 6px;
} /* défaut */
.like-size-lg :deep(.meta__btn) {
  font-size: 1.15rem;
  padding: 6px 8px;
}
.like-size-xl :deep(.meta__btn) {
  font-size: 1.35rem;
  padding: 8px 10px;
}

/* pour garder une bonne zone cliquable */
:deep(.meta__btn) {
  line-height: 1;
  min-height: 36px;
}
/* Popover */
:global(.rx-menu-content) {
  border-radius: 9999px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 8px 10px;
}
.rx-bubble {
  display: flex;
  gap: 8px;
}
.rx-item {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.12s ease;
}
.rx-emoji {
  font-size: 2.5rem;
  line-height: 1;
}
.rx-item:hover {
  transform: translateY(-4px) scale(1.05);
}
</style>
