<template>
  <MessengerConversationPage />
</template>

<script setup lang="ts">
import MessengerConversationPage from "~/components/messenger/MessengerConversationPage.vue";

definePageMeta({
  alias: ["/messenger/:id"],
  documentDriven: false,
  showRightWidgets: true,
  requiresPlugin: "messenger",
});
</script>
