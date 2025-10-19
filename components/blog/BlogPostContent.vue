<template>
  <section class="space-y-2 py-4 my-3 px-2 w-full">
    <h4 class="text font-semibold leading-tight text-foreground">
      {{ props.title }}
    </h4>
    <p
      v-if="props.summary"
      class="text-base leading-relaxed text-slate-500 mx-2"
    >
      {{ props.summary }}
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string;
  summary?: string;
  content?: string;
}>();
</script>

<style scoped></style>
