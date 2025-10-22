<template>
  <MessengerPage />
</template>

<script setup lang="ts">
import MessengerPage from "~/pages/messenger/index.vue";

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
  requiresPlugin: "messenger",
});
</script>
