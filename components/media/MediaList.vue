<template>
  <div class="media-list" role="region" :aria-busy="loading">
    <VTable density="comfortable" hover class="media-list__table">
      <thead>
        <tr>
          <th v-for="(header, index) in formattedHeaders" :key="index" scope="col">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody v-if="!loading && items.length">
        <tr
          v-for="file in items"
          :key="file.id"
          :class="{ 'media-list__row--selected': isSelected(file.id) }"
          tabindex="0"
          @click="handleClick($event, file)"
          @dblclick.prevent="handleDblClick(file)"
          @keydown.enter.prevent="handleDblClick(file)"
          @contextmenu="handleContext($event, file)"
        >
          <td data-title="name">
            <div class="d-flex align-center gap-2">
              <VIcon :icon="file.kind === 'image' ? 'mdi-image' : file.kind === 'video' ? 'mdi-video' : 'mdi-file'" />
              <span class="media-list__cell-text" :title="file.name">{{ file.name }}</span>
            </div>
          </td>
          <td data-title="type">{{ file.mime }}</td>
          <td data-title="size">{{ formatSize(file.size) }}</td>
          <td data-title="updated">
            <time :datetime="file.updatedAt">{{ dateFormatter.format(new Date(file.updatedAt)) }}</time>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="loading">
        <tr v-for="index in 5" :key="`skeleton-${index}`">
          <td colspan="4">
            <VSkeletonLoader type="text" class="media-list__skeleton" />
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="formattedHeaders.length">
            <div class="media-list__empty" role="status">
              <VIcon icon="mdi-file-search" size="40" class="mb-2" />
              <p class="text-medium-emphasis">{{ t("media.list.empty") }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
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

const { t, locale } = useI18n();

const formattedHeaders = computed(() => [
  t("media.list.columns.name"),
  t("media.list.columns.type"),
  t("media.list.columns.size"),
  t("media.list.columns.updatedAt"),
]);

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value || undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
);

function isSelected(id: string) {
  return props.selection.includes(id);
}

function formatSize(size: number) {
  if (!size) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let value = size;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
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
.media-list__table {
  width: 100%;
}

.media-list__row--selected {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.media-list__cell-text {
  max-width: 320px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.media-list__skeleton {
  height: 32px;
}

.media-list__empty {
  padding: 3rem 1rem;
  text-align: center;
}
</style>
