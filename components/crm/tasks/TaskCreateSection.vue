<template>
  <Suspense>
    <AsyncCreateTask />
    <template #fallback>
      <v-card
        variant="outlined"
        class="py-12 px-6 d-flex flex-column align-center justify-center gap-4"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          width="4"
          aria-label="Loading task creator"
        />
        <span class="text-body-2 text-medium-emphasis"> Preparing the task workspace… </span>
      </v-card>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const AsyncCreateTask = defineAsyncComponent(
  () => import("~/components/crm/tasks/AsyncCreateTask.vue"),
);
</script>
