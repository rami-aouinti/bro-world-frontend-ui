<template>
  <ProjectTasksSection :project-id="projectId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import ProjectTasksSection from "~/components/crm/projects/tasks/ProjectTasksSection.vue";

const route = useRoute();
const projectId = computed(() => route.params.id?.toString() ?? "");

definePageMeta({
  requiresPlugin: "crm",
});
</script>
