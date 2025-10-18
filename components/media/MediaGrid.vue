<template>
  <div class="media-grid" role="grid" :aria-label="t('media.grid.ariaLabel')">
    <VRow v-if="loading" dense class="media-grid__skeleton">
      <VCol v-for="index in 8" :key="index" cols="12" sm="6" md="4" lg="3">
        <VSkeletonLoader type="image, paragraph" class="media-grid__skeleton-tile" />
      </VCol>
    </VRow>

    <VRow v-else-if="items.length" dense class="media-grid__list">
      <VCol
        v-for="file in items"
        :key="file.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard
          :elevation="isSelected(file.id) ? 6 : 0"
          class="media-grid__item"
          tabindex="0"
          role="gridcell"
          :aria-selected="isSelected(file.id)"
          @click="handleClick($event, file)"
          @dblclick.prevent="handleDblClick(file)"
          @keydown.enter.prevent="handleDblClick(file)"
          @contextmenu="handleContext($event, file)"
        >
          <VImg
            v-if="file.thumbnails?.medium"
            :src="file.thumbnails.medium"
            :alt="file.name"
            class="media-grid__thumb"
            aspect-ratio="1"
            cover
          />
          <div v-else class="media-grid__placeholder" aria-hidden="true">
            <VIcon icon="mdi-file" size="48" />
          </div>
          <VCardTitle class="media-grid__title" :title="file.name">{{ file.name }}</VCardTitle>
          <VCardSubtitle class="media-grid__meta">
            <span>{{ file.mime }}</span>
            <span>•</span>
            <span>{{ formatFileSize(file.size) }}</span>
          </VCardSubtitle>
        </VCard>
      </VCol>
    </VRow>

    <div v-else class="media-grid__empty" role="status">
      <VIcon icon="mdi-folder-open" size="48" class="mb-2" />
      <p class="text-medium-emphasis">{{ gridEmptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MediaFile } from "~/types/media";

const props = defineProps<{
  items: MediaFile[];
  selection: string[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (event: "select", id: string, shift: boolean, ctrl: boolean): void;
  (event: "open", file: MediaFile): void;
  (event: "context", payload: { id: string; event: MouseEvent }): void;
}>();

const { t } = useI18n();

const gridEmptyMessage = computed(() => t("media.grid.empty"));

function isSelected(id: string) {
  return props.selection.includes(id);
}

function formatFileSize(size: number) {
  if (!size || Number.isNaN(size)) {
    return "-";
  }

  const thresholds = [
    { unit: "TB", value: 1024 ** 4 },
    { unit: "GB", value: 1024 ** 3 },
    { unit: "MB", value: 1024 ** 2 },
    { unit: "KB", value: 1024 },
  ];

  for (const threshold of thresholds) {
    if (size >= threshold.value) {
      return `${(size / threshold.value).toFixed(1)} ${threshold.unit}`;
    }
  }

  return `${size} B`;
}

function handleClick(event: MouseEvent, file: MediaFile) {
  emit("select", file.id, event.shiftKey, event.ctrlKey || event.metaKey);
}

function handleDblClick(file: MediaFile) {
  emit("open", file);
}

function handleContext(event: MouseEvent, file: MediaFile) {
  event.preventDefault();
  emit("context", { id: file.id, event });
}
</script>

<style scoped>
.media-grid {
  min-height: 320px;
}

.media-grid__item {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.media-grid__item:hover,
.media-grid__item:focus-visible {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.media-grid__thumb,
.media-grid__placeholder {
  border-bottom: 1px solid rgba(var(--v-theme-outline-variant), 0.5);
}

.media-grid__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}

.media-grid__title {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-grid__meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.media-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  border: 2px dashed rgba(var(--v-theme-outline-variant), 0.5);
  border-radius: 12px;
}
</style>
