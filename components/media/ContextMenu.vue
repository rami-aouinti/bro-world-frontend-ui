<template>
  <VMenu
    :model-value="props.modelValue"
    activator="parent"
    :close-on-content-click="true"
    :location="{ x: props.x, y: props.y }"
    location-strategy="connected"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VList density="compact">
      <VListItem v-for="item in props.items" :key="item.value" :disabled="item.disabled" @click="onSelect(item)">
        <template #prepend>
          <VIcon v-if="item.icon" :icon="item.icon" />
        </template>
        <VListItemTitle :class="{ 'text-error': item.danger }">
          {{ t(item.labelKey) }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

export interface ContextMenuItem {
  value: string;
  labelKey: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "select", value: string): void;
}>();

const { t } = useI18n();

function onSelect(item: ContextMenuItem) {
  if (item.disabled) {
    return;
  }

  emit("select", item.value);
  emit("update:modelValue", false);
}
</script>
