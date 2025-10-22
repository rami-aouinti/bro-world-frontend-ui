<template>
  <CrmIndexPage />
</template>

<script setup lang="ts">
import CrmIndexPage from "~/components/crm/CrmIndexPage.vue";

definePageMeta({
  alias: ["/crm"],
  showRightWidgets: true,
  requiresPlugin: "crm",
});
</script>
