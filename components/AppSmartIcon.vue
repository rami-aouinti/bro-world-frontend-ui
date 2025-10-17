<template>
  <Icon
    :icon="iconName"
    :width="iconSize"
    :height="iconSize"
    v-bind="attrs"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

const props = withDefaults(
  defineProps<{
    name?: string;
    size?: number | string;
  }>(),
  {
    size: 16,
  },
);

const attrs = useAttrs();

const iconName = computed(() => {
  const rawName = props.name?.trim() ?? "";

  if (!rawName) return rawName;

  if (rawName.startsWith("mdi:")) return rawName;

  if (rawName.startsWith("mdi-")) return `mdi:${rawName.slice(4)}`;

  return rawName;
});
const iconSize = computed(() => props.size);
</script>
