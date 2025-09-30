<template>
  <v-card
    class="post-skeleton"
    variant="tonal"
    elevation="6"
    rounded="xl"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <v-skeleton-loader
      type="list-item-avatar-two-line"
      class="mb-4"
    />
    <v-skeleton-loader
      type="paragraph@3"
      class="mb-6"
    />
    <div class="post-skeleton__actions">
      <v-skeleton-loader
        type="chip"
        width="140"
        class="me-2"
      />
      <v-skeleton-loader
        type="chip"
        width="120"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loadingLabel = computed(() => t('blog.posts.loading'))
</script>

<style scoped>
.post-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.post-skeleton__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
