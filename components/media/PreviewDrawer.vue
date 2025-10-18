<template>
  <VNavigationDrawer
    location="end"
    width="420"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #prepend>
      <div class="preview-drawer__header d-flex align-center justify-space-between px-4 pt-4 pb-2">
        <div>
          <h3 class="text-h6 mb-1">{{ file?.name }}</h3>
          <p class="text-caption text-medium-emphasis">{{ file?.mime }}</p>
        </div>
        <VBtn icon="mdi-close" variant="text" :aria-label="t('common.close')" @click="close" />
      </div>
    </template>

    <div class="preview-drawer__body px-4">
      <div v-if="loading" class="d-flex justify-center py-8">
        <VProgressCircular indeterminate color="primary" />
      </div>
      <div v-else-if="file" class="preview-drawer__preview" :aria-label="t('media.preview.ariaLabel')">
        <VImg v-if="isImage && previewSource" :src="previewSource" :alt="file.name" cover />
        <video v-else-if="isVideo && previewSource" controls :poster="file.thumbnails?.video">
          <source :src="file.thumbnails?.large ?? file.thumbnails?.medium ?? previewSource" :type="file.mime" />
        </video>
        <iframe v-else-if="isPdf && previewSource" :src="previewSource" class="preview-drawer__iframe" />
        <div v-else class="preview-drawer__fallback">
          <VIcon icon="mdi-file" size="48" class="mb-2" />
          <p class="text-body-2 text-medium-emphasis">{{ t('media.preview.unavailable') }}</p>
        </div>
      </div>
      <div v-else class="preview-drawer__empty text-medium-emphasis">
        {{ t('media.preview.empty') }}
      </div>
    </div>

    <template #append>
      <div class="preview-drawer__actions px-4 py-3 d-flex gap-3">
        <VBtn variant="outlined" block :disabled="!file" @click="triggerDownload">
          {{ t('media.preview.download') }}
        </VBtn>
      </div>
    </template>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MediaFile } from "~/types/media";

const props = defineProps<{
  modelValue: boolean;
  file: MediaFile | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "download", file: MediaFile): void;
}>();

const { t } = useI18n();

const previewSource = computed(() => {
  const file = props.file;

  if (!file) {
    return null;
  }

  if (file.kind === "image") {
    return file.thumbnails?.large ?? file.thumbnails?.medium ?? file.thumbnails?.small;
  }

  if (file.kind === "video") {
    return file.thumbnails?.video ?? file.thumbnails?.medium ?? file.thumbnails?.small;
  }

  if (file.mime?.includes("pdf")) {
    return file.thumbnails?.large ?? null;
  }

  return null;
});

const isVideo = computed(() => props.file?.kind === "video");
const isImage = computed(() => props.file?.kind === "image");
const isPdf = computed(() => props.file?.mime?.includes("pdf"));

function close() {
  emit("update:modelValue", false);
}

function triggerDownload() {
  if (props.file) {
    emit("download", props.file);
  }
}
</script>

<style scoped>
.preview-drawer__body {
  overflow-y: auto;
  flex: 1;
}

.preview-drawer__preview {
  min-height: 260px;
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.4);
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}

.preview-drawer__preview video,
.preview-drawer__preview :deep(img) {
  width: 100%;
  height: auto;
  display: block;
}

.preview-drawer__iframe {
  width: 100%;
  height: 420px;
  border: none;
}

.preview-drawer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}
</style>
