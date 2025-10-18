<template>
  <v-alert
    v-if="hasError"
    type="error"
    variant="tonal"
    border="start"
    border-color="error"
    density="comfortable"
    class="mb-4"
    role="alert"
  >
    {{ error }}
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    error?: string | null;
  }>(),
  {
    error: null,
  },
);

const hasError = computed(() => typeof props.error === "string" && props.error.trim().length > 0);
</script>
