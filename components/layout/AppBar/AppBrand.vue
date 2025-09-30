<template>
  <NuxtLink
    :to="to ?? '/'"
    class="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold text-xl"
  >
    <h1 class="z-2 relative text-center font-sans font-bold">
      Bro
      <ColourfulText
        :colors="colors"
        text="World"
      />
    </h1>
  </NuxtLink>
</template>

<script setup lang="ts">
import { usePrimaryGradient } from "~/composables/usePrimaryGradient";

defineProps<{ to?: string }>();
const { colors } = usePrimaryGradient({ steps: 5, lightDark: [0.88, 0.3] });
</script>
