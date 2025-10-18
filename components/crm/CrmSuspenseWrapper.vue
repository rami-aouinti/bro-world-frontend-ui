<template>
  <Suspense>
    <RouterView :key="queryStore.getParams" />
    <template #fallback>
      <span class="crm-loading">
        <v-progress-circular
          :size="18"
          :width="2"
          indeterminate
          color="primary"
          class="me-2"
        />
        Loading...
      </span>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";

import { useQueryStore } from "~/stores/task/queryStore";

const queryStore = useQueryStore();
</script>

<style scoped>
.crm-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.9375rem;
}
</style>
