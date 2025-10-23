<template>
  <JobPage />
</template>

<script setup lang="ts">
import JobPage from "~/pages/job.vue";

definePageMeta({
  description: "Job page",
  breadcrumb: "disabled",
  requiresPlugin: "job",
  showRightWidgets: true,
});
</script>
