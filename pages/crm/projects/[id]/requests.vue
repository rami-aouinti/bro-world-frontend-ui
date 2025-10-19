<template>
  <ProjectRequestsSection :project-id="projectId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import ProjectRequestsSection from "~/components/crm/projects/requests/ProjectRequestsSection.vue";

const route = useRoute();
const projectId = computed(() => route.params.id?.toString() ?? "");

definePageMeta({
  requiresPlugin: "crm",
});
</script>
