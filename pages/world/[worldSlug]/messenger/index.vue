<template>
  <MessengerIndexPage />
</template>

<script setup lang="ts">
import MessengerIndexPage from "~/components/messenger/MessengerIndexPage.vue";

definePageMeta({
  alias: ["/messenger"],
  documentDriven: false,
  showRightWidgets: true,
  requiresPlugin: "messenger",
});
</script>
