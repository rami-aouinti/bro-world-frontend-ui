<template>
  <div class="relative flex h-96 flex-col items-center justify-center">
    <FallingStarsBg
      class="bg-white dark:bg-black"
      :color="isDark ? '#FFF' : '#555'"
    />
    <div class="z-[1] flex items-center">
      <span class="text-6xl font-bold text-black dark:text-white">Inspira UI</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCookieColorMode } from "#imports";

const colorMode = useCookieColorMode();
const isDark = computed(() => colorMode.value === "dark");
</script>
