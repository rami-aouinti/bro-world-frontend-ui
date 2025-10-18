<template>
  <div
    class="comment-thread-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div
      v-for="index in count"
      :key="`comment-skeleton-${index}`"
      class="comment-thread-skeleton__item"
    >
      <div class="comment-thread-skeleton__comment">
        <v-skeleton-loader
          class="comment-thread-skeleton__avatar"
          type="avatar"
        />
        <div class="comment-thread-skeleton__bubble">
          <v-skeleton-loader type="text" width="180" />
          <v-skeleton-loader type="text" width="220" />
        </div>
      </div>
      <div class="comment-thread-skeleton__meta">
        <v-skeleton-loader type="text" width="80" />
        <v-skeleton-loader type="chip" width="70" />
        <v-skeleton-loader type="chip" width="70" />
      </div>
    </div>
    <div
      v-if="showComposer"
      class="comment-thread-skeleton__composer"
    >
      <v-skeleton-loader
        class="comment-thread-skeleton__avatar"
        type="avatar"
      />
      <v-skeleton-loader
        class="comment-thread-skeleton__composer-input"
        type="text"
        width="260"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    count?: number;
    showComposer?: boolean;
  }>(),
  {
    count: 3,
    showComposer: false,
  },
);

const loadingLabel = computed(() => t("common.loading"));
const count = computed(() => Math.max(1, props.count));
const showComposer = computed(() => props.showComposer);
</script>

<style scoped>
.comment-thread-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-thread-skeleton__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-thread-skeleton__comment {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.comment-thread-skeleton__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-thread-skeleton__bubble {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.comment-thread-skeleton__meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding-left: 46px;
}

.comment-thread-skeleton__composer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-thread-skeleton__composer-input {
  flex-grow: 1;
  border-radius: 9999px;
}
</style>
