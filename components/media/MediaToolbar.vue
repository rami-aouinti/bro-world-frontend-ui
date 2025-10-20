<template>
  <div
    class="media-toolbar d-flex align-center flex-wrap gap-3"
    role="toolbar"
    :aria-busy="loading"
  >
    <VBtn
      color="primary"
      variant="flat"
      size="small"
      prepend-icon="mdi-folder-plus"
      :disabled="disableCreate || loading"
      @click="emit('create-folder')"
    >
      {{ t("media.toolbar.newFolder") }}
    </VBtn>

    <VBtn
      color="primary"
      variant="outlined"
      size="small"
      prepend-icon="mdi-upload"
      :disabled="disableUpload || loading"
      @click="emit('upload')"
    >
      {{ t("media.toolbar.upload") }}
    </VBtn>

    <VDivider
      vertical
      class="mx-2"
      role="presentation"
    />

    <VBtnToggle
      density="comfortable"
      rounded="pill"
      variant="outlined"
      color="primary"
      class="media-toolbar__view-toggle"
      :model-value="view"
      :aria-label="viewLabel"
      @update:model-value="(value) => emit('change-view', value as MediaViewMode)"
    >
      <VBtn
        value="grid"
        icon="mdi-view-grid"
        :aria-label="t('media.toolbar.gridView')"
      />
      <VBtn
        value="list"
        icon="mdi-view-list"
        :aria-label="t('media.toolbar.listView')"
      />
    </VBtnToggle>

    <VDivider
      vertical
      class="mx-2"
      role="presentation"
    />

    <VBtn
      :color="trashMode ? 'primary' : 'default'"
      variant="text"
      size="small"
      prepend-icon="mdi-delete"
      :aria-pressed="trashMode"
      @click="emit('toggle-trash')"
    >
      {{ t(trashMode ? "media.toolbar.hideTrash" : "media.toolbar.showTrash") }}
    </VBtn>

    <VSpacer />

    <VBtn
      icon
      size="small"
      variant="text"
      :title="t('media.toolbar.refresh')"
      :aria-label="t('media.toolbar.refresh')"
      @click="emit('refresh')"
    >
      <VIcon
        icon="mdi-refresh"
        :class="{ 'media-toolbar__spinner--spinning': loading }"
      />
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MediaViewMode } from "~/types/media";

const props = defineProps<{
  view: MediaViewMode;
  trashMode: boolean;
  loading?: boolean;
  disableCreate?: boolean;
  disableUpload?: boolean;
}>();

const emit = defineEmits<{
  (event: "create-folder"): void;
  (event: "upload"): void;
  (event: "toggle-trash"): void;
  (event: "change-view", view: MediaViewMode): void;
  (event: "refresh"): void;
}>();

const { t } = useI18n();

const viewLabel = computed(() =>
  props.view === "grid" ? t("media.toolbar.gridView") : t("media.toolbar.listView"),
);
</script>

<style scoped>
.media-toolbar {
  gap: 0.5rem;
}

.media-toolbar__view-toggle {
  min-width: 96px;
}

.media-toolbar__spinner--spinning {
  animation: media-toolbar-spin 1s linear infinite;
}

@keyframes media-toolbar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
