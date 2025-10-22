<template>
  <CrmPage />
</template>

<script setup lang="ts">
import CrmPage from "~/pages/crm/index.vue";

definePageMeta({
  showRightWidgets: true,
  requiresPlugin: "crm",
});
</script>
