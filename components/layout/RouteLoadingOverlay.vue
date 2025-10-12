<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-background/70 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="sr-only">Chargement de la page</span>
      <div
        class="size-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary/90 bg-white/40 p-4 shadow-lg backdrop-blur-sm dark:border-primary/30 dark:bg-neutral-900/60"
        aria-hidden="true"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>
