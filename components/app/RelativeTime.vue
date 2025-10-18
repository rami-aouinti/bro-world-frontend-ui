<template>
  <p
    v-if="label"
    class="text-caption d-inline-flex align-center gap-1 text-medium-emphasis"
  >
    <slot name="prepend" />
    <span>{{ label }}</span>
    <slot name="append" />
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRelativeTime } from "~/composables/useRelativeTime";

const props = defineProps({
  date: {
    type: [String, Number, Date],
    required: true,
  },
});

const { formatRelativeTime } = useRelativeTime();

const label = computed(() => {
  const value = props.date;

  return value ? formatRelativeTime(value) : "";
});
</script>
