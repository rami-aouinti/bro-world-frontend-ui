<template>
  <div class="w-100">
    <div class="d-flex justify-space-between mb-1">
      <span class="text-caption text-medium-emphasis">{{ label }}</span>
      <span class="text-caption font-weight-medium">{{ formatted }}</span>
    </div>
    <v-progress-linear :model-value="value" height="8" color="primary" rounded background-opacity="0.2" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  value: number;
  label: string;
}>();

const formatted = computed(() => `${Math.round(props.value)}%`);
</script>
