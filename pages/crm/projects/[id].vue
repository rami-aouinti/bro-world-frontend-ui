<template>
  <main class="py-12" aria-labelledby="crm-project-detail-heading">
    <v-container>
      <Suspense>
        <ProjectDetailLayout :project-id="projectId">
          <template #default>
            <Suspense>
              <NuxtPage />
              <template #fallback>
                <div class="py-10 text-center">
                  <v-progress-circular indeterminate color="primary" size="40" />
                </div>
              </template>
            </Suspense>
          </template>
        </ProjectDetailLayout>
        <template #fallback>
          <div class="py-10 text-center">
            <v-progress-circular indeterminate color="primary" size="40" />
          </div>
        </template>
      </Suspense>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import ProjectDetailLayout from "~/components/crm/projects/ProjectDetailLayout.vue";

const route = useRoute();
const projectId = computed(() => route.params.id?.toString() ?? "");
</script>
