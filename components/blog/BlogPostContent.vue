<template>
  <section class="space-y-2 py-4 my-3 px-2 w-full">
    <h2 class="text font-semibold leading-tight text-foreground">
      {{ props.title }}
    </h2>
    <p
      v-if="displaySummary"
      class="text-base leading-relaxed text-foreground mx-2 summary-clamp"
    >
      {{ displaySummary }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  title?: string;
  summary?: string;
  content?: string;
}>();

const displaySummary = computed(() => {
  const trimmedSummary = props.summary?.trim();

  if (trimmedSummary) {
    return trimmedSummary;
  }

  const rawContent = props.content;

  if (!rawContent) {
    return "";
  }

  const textContent = rawContent.replace(/<[^>]*>/g, " ");

  return textContent.replace(/\s+/g, " ").trim();
});
</script>

<style scoped>
.summary-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
