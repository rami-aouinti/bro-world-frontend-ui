<template>
  <ProjectParticipantsSection :project-id="projectId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import ProjectParticipantsSection from "~/components/crm/projects/participants/ProjectParticipantsSection.vue";

const route = useRoute();
const projectId = computed(() => route.params.id?.toString() ?? "");

definePageMeta({
  requiresPlugin: "crm",
});
</script>
