<template>
  <div class="flex items-center gap-3 sm:gap-6">
    <LayoutSearchButton
      v-if="!props.isMobile"
      :class="desktopSearchClasses"
    />
  </div>
</template>

<script setup lang="ts">
import LayoutSearchButton from "../LayoutSearchButton.vue";

const props = withDefaults(
  defineProps<{
    isMobile: boolean;
    iconTriggerClasses: string;
    navigationLabel: string;
    goBackLabel: string;
    refreshLabel: string;
    refreshing?: boolean;
  }>(),
  {
    refreshing: false,
  },
);
const desktopSearchClasses = "hidden md:inline-flex";
</script>
