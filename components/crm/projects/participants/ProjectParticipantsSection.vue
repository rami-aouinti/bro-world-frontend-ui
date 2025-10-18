<template>
  <section class="d-flex flex-column gap-4">
    <header>
      <h2 class="text-h5 text-md-h4 font-weight-semibold mb-1">Project participants</h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Manage the delivery team and keep track of pending seats for this opportunity.
      </p>
    </header>

    <Suspense>
      <AsyncProjectParticipants :key="queryStore.getHash" :project-id="projectId" />
      <template #fallback>
        <div class="py-10 text-center">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>
      </template>
    </Suspense>
  </section>
</template>

<script setup lang="ts">
import AsyncProjectParticipants from "~/components/crm/projects/participants/AsyncProjectParticipants.vue";
import { useCrmQueryStore } from "~/stores/crm-query";

defineProps<{
  projectId: string;
}>();

const queryStore = useCrmQueryStore();
</script>

<style scoped>
.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
