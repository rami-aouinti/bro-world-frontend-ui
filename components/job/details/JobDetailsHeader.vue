<template>
  <div>
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between">
      <div>
        <h3 class="text-h5 font-weight-semibold mb-2">
          {{ job.title }}
        </h3>
        <p class="text-body-1 text-medium-emphasis mb-1">
          {{ companyName }}
        </p>
        <p class="text-body-2 text-medium-emphasis">
          {{ job.company?.description }}
        </p>
      </div>
      <v-chip
        color="primary"
        variant="tonal"
        class="mt-4 mt-md-0"
      >
        {{ salary }}
      </v-chip>
    </div>

    <v-row
      class="mt-4"
      dense
    >
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center"
      >
        <v-icon
          class="mr-2"
          color="primary"
          icon="mdi-map-marker-outline"
        />
        <span>{{ location }}</span>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center"
      >
        <v-icon
          class="mr-2"
          color="primary"
          icon="mdi-briefcase-outline"
        />
        <span>{{ workType }}</span>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center"
      >
        <v-icon
          class="mr-2"
          color="primary"
          icon="mdi-school-outline"
        />
        <span>
          {{ experience }}<span v-if="contractType"> • {{ contractType }}</span>
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface JobHeader {
  title?: string;
  company?: { name?: string; description?: string };
  workLocation?: string;
  salaryRange?: string | number;
  workType?: string;
  experience?: string | number;
  contractType?: string;
}

const props = defineProps<{ job: JobHeader }>();

const { t } = useI18n();

const companyName = computed(() => props.job.company?.name ?? t("job.unknownCompany"));
const location = computed(() => props.job.workLocation || t("job.locationUnknown"));
const salary = computed(() => props.job.salaryRange ?? t("job.salaryUnknown"));
const workType = computed(() => props.job.workType ?? "");
const experience = computed(() => props.job.experience ?? "");
const contractType = computed(() => props.job.contractType ?? "");
</script>
