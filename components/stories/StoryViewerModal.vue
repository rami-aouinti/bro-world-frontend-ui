<template>
  <v-dialog
    v-model="model"
    class="story-viewer"
    content-class="story-viewer__content"
    transition="dialog-bottom-transition"
    persistent
    :scrim="true"
    width="480"
  >
    <v-card
      class="story-viewer__card"
      elevation="12"
      rounded="xl"
    >
      <div
        class="story-viewer__progress"
        :class="{ active: isStoryVisible }"
        :style="progressStyle"
      ></div>
      <header class="story-viewer__header">
        <div class="story-viewer__profile">
          <v-avatar
            v-if="story?.avatar"
            size="40"
          >
            <v-img
              :src="story?.avatar"
              :alt="story?.name || t('stories.viewer.avatarAlt')"
              cover
            />
          </v-avatar>
          <div class="story-viewer__meta">
            <p class="story-viewer__name">{{ story?.name }}</p>
            <p
              v-if="story?.duration"
              class="story-viewer__duration"
            >
              {{ story?.duration }}
            </p>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          class="story-viewer__close"
          :aria-label="t('stories.viewer.close')"
          @click="close"
        >
          <Icon name="mdi-close" />
        </v-btn>
      </header>

      <main class="story-viewer__body">
        <transition name="story-fade">
          <v-img
            v-if="isStoryVisible && story?.image"
            :key="story?.id || story?.image"
            :src="story?.image"
            class="story-viewer__image"
            cover
            :alt="story?.name || t('stories.viewer.imageAlt')"
          />
        </transition>
        <div
          v-if="!isStoryVisible"
          class="story-viewer__expired"
        >
          <Icon
            name="mdi-timer-off"
            class="mr-2"
          />
          <span>{{ t("stories.viewer.expired") }}</span>
        </div>
      </main>

      <footer class="story-viewer__footer">
        <div class="story-viewer__reactions">
          <p class="story-viewer__prompt">{{ t("stories.viewer.reactPrompt") }}</p>
          <div class="story-viewer__reaction-buttons">
            <v-btn
              v-for="reaction in reactions"
              :key="reaction.id"
              class="story-viewer__reaction-btn"
              variant="text"
              @click="onReact(reaction)"
            >
              <span class="story-viewer__reaction-emoji">{{ reaction.emoji }}</span>
              <span class="story-viewer__reaction-label">{{ reaction.label }}</span>
            </v-btn>
          </div>
        </div>
        <div class="story-viewer__message">
          <v-text-field
            v-model="message"
            :label="t('stories.viewer.messageLabel')"
            hide-details
            density="comfortable"
            variant="outlined"
            color="primary"
            @keyup.enter="sendMessage"
          />
          <v-btn
            color="primary"
            class="story-viewer__send"
            :disabled="!canSendMessage"
            @click="sendMessage"
          >
            {{ t("stories.viewer.send") }}
          </v-btn>
        </div>
      </footer>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

interface Story {
  id?: string | number;
  image?: string;
  name?: string;
  avatar?: string;
  duration?: string;
}

interface ReactionOption {
  id: string;
  emoji: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    story?: Story | null;
    duration?: number;
    reactions?: ReactionOption[];
  }>(),
  {
    story: null,
    duration: 1000,
    reactions: () => [
      { id: "like", emoji: "👍", label: "Like" },
      { id: "love", emoji: "❤️", label: "Love" },
      { id: "haha", emoji: "😂", label: "Haha" },
      { id: "wow", emoji: "😮", label: "Wow" },
      { id: "sad", emoji: "😢", label: "Sad" },
      { id: "angry", emoji: "😡", label: "Angry" },
    ],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "react", payload: { story: Story | null; reaction: ReactionOption }): void;
  (e: "message", payload: { story: Story | null; message: string }): void;
}>();

const { t } = useI18n();

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit("update:modelValue", value);
    if (!value) {
      emit("close");
    }
  },
});

const message = ref("");
const isStoryVisible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const canSendMessage = computed(() => message.value.trim().length > 0 && Boolean(props.story));
const progressStyle = computed(() => ({ "--story-duration": `${props.duration}ms` }));

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function startTimer() {
  clearTimer();

  if (!props.modelValue || !props.story) {
    isStoryVisible.value = false;
    return;
  }

  isStoryVisible.value = true;
  timer = setTimeout(() => {
    isStoryVisible.value = false;
  }, props.duration);
}

function close() {
  model.value = false;
}

function onReact(reaction: ReactionOption) {
  if (!props.story) {
    return;
  }

  emit("react", { story: props.story, reaction });
}

function sendMessage() {
  if (!canSendMessage.value || !props.story) {
    return;
  }

  emit("message", { story: props.story, message: message.value.trim() });
  message.value = "";
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      startTimer();
    } else {
      clearTimer();
      isStoryVisible.value = false;
      message.value = "";
    }
  },
);

watch(
  () => props.story,
  () => {
    if (props.modelValue) {
      startTimer();
    } else {
      isStoryVisible.value = false;
    }
  },
);

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped>
.story-viewer :deep(.v-overlay__scrim) {
  backdrop-filter: blur(12px);
}

.story-viewer__card {
  background: rgba(20, 24, 38, 0.9);
  color: white;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.story-viewer__progress {
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.story-viewer__progress::after {
  content: "";
  display: block;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #60a5fa, #a855f7);
  transform-origin: left;
  transform: scaleX(0);
  transition: transform var(--story-duration, 3000ms) linear;
}

.story-viewer__progress.active::after {
  transform: scaleX(1);
}

.story-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.story-viewer__profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.story-viewer__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.story-viewer__name {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.story-viewer__duration {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.story-viewer__body {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  background: rgba(0, 0, 0, 0.35);
}

.story-viewer__image {
  width: 100%;
  max-height: 360px;
  border-radius: 16px;
}

.story-viewer__expired {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  opacity: 0.85;
}

.story-viewer__footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(12, 15, 24, 0.65);
}

.story-viewer__reactions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.story-viewer__prompt {
  margin: 0;
  font-weight: 500;
}

.story-viewer__reaction-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-viewer__reaction-btn {
  color: white;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding-inline: 12px;
  text-transform: none;
}

.story-viewer__reaction-emoji {
  font-size: 1.1rem;
  margin-right: 6px;
}

.story-viewer__reaction-label {
  font-size: 0.9rem;
}

.story-viewer__message {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-viewer__send {
  align-self: flex-end;
}

.story-fade-enter-active,
.story-fade-leave-active {
  transition: opacity 0.35s ease;
}

.story-fade-enter-from,
.story-fade-leave-to {
  opacity: 0;
}
</style>
