<template>
  <VDialog :model-value="modelValue" max-width="640" @update:model-value="emit('update:modelValue', $event)">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ t("media.upload.title") }}</span>
        <VBtn icon="mdi-close" variant="text" :aria-label="t('common.close')" @click="close" />
      </VCardTitle>
      <VCardText>
        <div
          class="upload-dialog__dropzone"
          :class="{ 'upload-dialog__dropzone--active': dragActive }"
          role="button"
          tabindex="0"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="openFilePicker"
          @keydown.enter.prevent="openFilePicker"
        >
          <VIcon icon="mdi-cloud-upload" size="48" class="mb-4" />
          <p class="text-h6 mb-2">{{ t("media.upload.dropTitle") }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ t("media.upload.dropSubtitle") }}</p>
          <VBtn class="mt-4" color="primary" variant="flat" size="small">
            {{ t("media.upload.browse") }}
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <VCardText>
        <p class="text-subtitle-2 mb-3">{{ t("media.upload.queue") }}</p>
        <div v-if="tasks.length" class="d-flex flex-column gap-3">
          <div v-for="task in tasks" :key="task.id" class="upload-dialog__task">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-body-2 text-truncate" :title="task.file.name">{{ task.file.name }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ task.progress }}%
              </span>
            </div>
            <VProgressLinear :model-value="task.progress" height="6" rounded color="primary" />
            <p v-if="task.error" class="text-caption text-error mt-1">{{ task.error }}</p>
          </div>
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          {{ t("media.upload.empty") }}
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="close">{{ t("common.close") }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { UploadTask } from "~/stores/useMediaStore";

const props = defineProps<{
  modelValue: boolean;
  tasks: UploadTask[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "upload", files: File[]): void;
}>();

const { t } = useI18n();
const dragActive = ref(false);

function close() {
  emit("update:modelValue", false);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragActive.value = false;
  const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];

  if (files.length) {
    emit("upload", files);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  dragActive.value = true;
}

function handleDragLeave(event: DragEvent) {
  if (event.currentTarget === event.target) {
    dragActive.value = false;
  }
}

function openFilePicker() {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = "*/*";
  input.addEventListener("change", () => {
    const files = input.files ? Array.from(input.files) : [];
    if (files.length) {
      emit("upload", files);
    }
  });
  input.click();
}
</script>

<style scoped>
.upload-dialog__dropzone {
  border: 2px dashed rgba(var(--v-theme-outline-variant), 0.5);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dialog__dropzone--active {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.upload-dialog__task {
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.4);
  border-radius: 8px;
  padding: 0.75rem;
}
</style>
