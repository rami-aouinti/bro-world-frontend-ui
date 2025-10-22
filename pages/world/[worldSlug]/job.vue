<template>
  <JobPageContent />
</template>

<script setup lang="ts">
import JobPageContent from "~/components/job/JobPageContent.vue";

definePageMeta({
  alias: ["/job"],
  description: "Job page",
  breadcrumb: "disabled",
  requiresPlugin: "job-board",
  showRightWidgets: true,
});
</script>
