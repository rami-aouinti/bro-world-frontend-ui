<template>
  <div class="media-tree" role="navigation" :aria-label="t('media.tree.ariaLabel')">
    <VTreeview
      v-model:selected="selectedIds"
      :items="normalizedItems"
      item-title="name"
      item-value="id"
      expand-icon="mdi-chevron-down"
      collapse-icon="mdi-chevron-right"
      :loading="loading"
      density="compact"
      open-on-click
    >
      <template #prepend="{ item }">
        <VIcon :icon="item.id === '__root' ? 'mdi-home' : 'mdi-folder-outline'" />
      </template>
      <template #item="{ item, props: slotProps }">
        <div
          class="media-tree__item"
          :class="{ 'media-tree__item--active': selectedIds.includes(item.id as string) }"
          v-bind="slotProps"
          @contextmenu="handleContext($event, item as TreeItem)"
        >
          <span class="media-tree__label">{{ item.raw?.name ?? item.name }}</span>
        </div>
      </template>
    </VTreeview>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface MediaTreeItem {
  id: string | null;
  name: string;
  children?: MediaTreeItem[];
  disabled?: boolean;
  isTrash?: boolean;
}

type TreeItem = MediaTreeItem;

const props = defineProps<{
  items: TreeItem[];
  activeId: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (event: "select", id: string | null): void;
  (event: "context", payload: { id: string | null; event: MouseEvent }): void;
  (event: "toggle", item: TreeItem): void;
}>();

const { t } = useI18n();

const selectedIds = computed({
  get: () => (props.activeId ? [props.activeId] : ["__root"]),
  set: (value: string[]) => {
    const id = value?.[0] ?? null;
    emit("select", id === "__root" ? null : id);
  },
});

function handleContext(event: MouseEvent, item: TreeItem) {
  event.preventDefault();
  emit("context", { id: item.id, event });
}

function normalizeItem(item: TreeItem) {
  return {
    ...item,
    id: item.id ?? "__root",
    name: item.name,
    children: (item.children ?? []).map((child) => normalizeItem(child)),
  };
}

const normalizedItems = computed(() => props.items.map((item) => normalizeItem(item)));
</script>

<style scoped>
.media-tree {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.media-tree__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.media-tree__item:hover,
.media-tree__item:focus-visible {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.media-tree__item--active {
  background-color: rgba(var(--v-theme-primary), 0.16);
}

.media-tree__label {
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
