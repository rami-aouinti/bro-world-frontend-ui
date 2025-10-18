<template>
  <v-alert
    v-if="visible"
    type="success"
    variant="tonal"
    border="start"
    border-color="success"
    density="comfortable"
    class="mb-4"
    role="status"
  >
    <slot />
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    visible?: boolean;
  }>(),
  {
    visible: false,
  },
);

const visible = computed(() => Boolean(props.visible));
</script>
