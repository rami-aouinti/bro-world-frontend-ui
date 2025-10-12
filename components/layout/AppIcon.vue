<template>
  <Icon
    v-if="resolved.type !== 'none'"
    v-bind="attrs"
    :name="resolved.value"
    :size="size"
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
    name: "",
    size: 24,
  },
);

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const resolved = computed(() => {
  const rawName = props.name?.trim() ?? "";

  if (!rawName) return { type: "none" as const, value: "" };

  if (rawName.startsWith("mdi:")) return { type: "mdi" as const, value: rawName };

  if (rawName.startsWith("mdi-")) return { type: "mdi" as const, value: `mdi:${rawName.slice(4)}` };

  return { type: "other" as const, value: rawName };
});

const size = computed(() => props.size);
</script>
