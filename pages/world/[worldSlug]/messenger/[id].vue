<template>
  <MessengerConversationPage />
</template>

<script setup lang="ts">
import MessengerConversationPage from "~/pages/messenger/[id].vue";

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
  requiresPlugin: "messenger",
});
</script>
