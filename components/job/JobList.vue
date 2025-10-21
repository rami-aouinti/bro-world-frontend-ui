<template>
  <div v-if="!filtered">
    <v-skeleton-loader
      v-for="n in 3"
      :key="`job-skeleton-${n}`"
      class="mb-4"
      height="180"
      rounded="xl"
      type="card"
    />
  </div>

  <template v-else>
    <div v-if="jobs.length">
      <SidebarCard
        v-for="job in jobs"
        :key="job.id"
        class="text-card-foreground px-3 py-3"
        glow
      >
        <JobDetails :job="job" />
        <v-btn
          class="mt-4"
          color="primary"
          variant="tonal"
          @click="emit('apply', job.id)"
        >
          {{ t("job.apply") }}
        </v-btn>
      </SidebarCard>
    </div>

    <v-alert
      v-else
      border="start"
      class="mt-10 mx-6"
      color="primary"
      type="info"
    >
      {{ t("job.noMatch") }}
    </v-alert>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import JobDetails from "~/components/job/JobDetails.vue";
import type { JobSummary } from "~/stores/useJobStore";

defineProps<{ jobs: JobSummary[]; filtered: boolean }>();

const emit = defineEmits<{ (e: "apply", jobId: string): void }>();

const { t } = useI18n();
</script>
