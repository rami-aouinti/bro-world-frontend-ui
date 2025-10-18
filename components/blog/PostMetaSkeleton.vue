<template>
  <div
    class="post-meta-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <v-skeleton-loader
      class="post-meta-skeleton__avatar"
      type="avatar"
    />
    <div class="post-meta-skeleton__details">
      <v-skeleton-loader
        type="text"
        width="140"
      />
      <v-skeleton-loader
        type="text"
        width="200"
      />
    </div>
    <v-skeleton-loader
      class="post-meta-skeleton__action"
      type="chip"
      width="96"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>

<style scoped>
.post-meta-skeleton {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.post-meta-skeleton__avatar {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.post-meta-skeleton__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-meta-skeleton__action {
  min-width: 96px;
}
</style>
