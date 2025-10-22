<template>
  <GamePage />
</template>

<script setup lang="ts">
import GamePage from "~/pages/game.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "game",
});
</script>
