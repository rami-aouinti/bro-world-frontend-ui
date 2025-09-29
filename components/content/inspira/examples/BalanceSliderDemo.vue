<template>
  <div class="w-full p-4">
    <BalanceSlider
      :right-color="rightColor"
      left-content="COFFEE"
      right-content="MILK"
      :indicator-color="indicatorColor"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useCookieColorMode } from "#imports";

const isDark = computed(() => useCookieColorMode().value == "dark");
const rightColor = computed(() => (isDark.value ? "#FFFFFF" : "#000000"));
const indicatorColor = computed(() => (isDark.value ? "#FFFFFF" : "#000000"));
</script>
