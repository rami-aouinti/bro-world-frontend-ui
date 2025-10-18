<template>
  <VBreadcrumbs :items="normalizedItems" density="comfortable" class="media-breadcrumbs">
    <template #divider>
      <VIcon icon="mdi-chevron-right" />
    </template>
    <template #item="{ item, index }">
      <VBtn
        variant="text"
        size="small"
        class="text-none"
        :disabled="index === normalizedItems.length - 1"
        @click="emit('navigate', item.id as string | null)"
      >
        {{ item.title ?? item.label ?? item.text }}
      </VBtn>
    </template>
  </VBreadcrumbs>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface MediaBreadcrumbItem {
  id: string | null;
  label: string;
}

const props = defineProps<{
  items: MediaBreadcrumbItem[];
}>();

const emit = defineEmits<{
  (event: "navigate", id: string | null): void;
}>();

const { t } = useI18n();

const normalizedItems = computed(() => {
  const base: MediaBreadcrumbItem[] = [{ id: null, label: t("media.breadcrumbs.root") }];
  return [...base, ...props.items];
});
</script>

<style scoped>
.media-breadcrumbs {
  padding-inline: 0;
}
</style>
