<template>
  <div
    class="blog-post-react-card-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="blog-post-react-card-skeleton__row blog-post-react-card-skeleton__row--metrics">
      <div class="blog-post-react-card-skeleton__left">
        <div class="blog-post-react-card-skeleton__bubbles">
          <v-skeleton-loader
            v-for="index in 3"
            :key="`bubble-${index}`"
            type="avatar"
            class="blog-post-react-card-skeleton__bubble"
            width="26"
            height="26"
          />
        </div>
        <v-skeleton-loader
          class="blog-post-react-card-skeleton__total"
          type="text"
          width="48"
          height="16"
        />
      </div>
      <div class="blog-post-react-card-skeleton__right">
        <v-skeleton-loader
          v-for="index in 2"
          :key="`metric-${index}`"
          type="chip"
          width="64"
          height="20"
        />
      </div>
    </div>
    <div class="blog-post-react-card-skeleton__row blog-post-react-card-skeleton__row--actions">
      <v-skeleton-loader
        type="avatar"
        width="44"
        height="44"
        class="blog-post-react-card-skeleton__picker"
      />
      <v-skeleton-loader
        v-for="index in 2"
        :key="`action-${index}`"
        type="button"
        width="128"
        height="40"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>

<style scoped>
.blog-post-react-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blog-post-react-card-skeleton__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.blog-post-react-card-skeleton__row--metrics {
  padding: 2px 0;
}

.blog-post-react-card-skeleton__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 96px;
}

.blog-post-react-card-skeleton__bubbles {
  position: relative;
  width: 60px;
  height: 26px;
}

.blog-post-react-card-skeleton__bubble {
  position: absolute;
  top: 0;
  border-radius: 9999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.blog-post-react-card-skeleton__bubble:nth-child(1) {
  left: 0;
  z-index: 3;
}

.blog-post-react-card-skeleton__bubble:nth-child(2) {
  left: 16px;
  z-index: 2;
}

.blog-post-react-card-skeleton__bubble:nth-child(3) {
  left: 32px;
  z-index: 1;
}

.blog-post-react-card-skeleton__right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 80px;
  justify-content: flex-end;
}

.blog-post-react-card-skeleton__row--actions {
  justify-content: flex-start;
  gap: 10px;
}

.blog-post-react-card-skeleton__picker {
  border-radius: 9999px;
}
</style>
