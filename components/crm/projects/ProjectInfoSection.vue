<template>
  <section class="d-flex flex-column gap-6">
    <header>
      <h2 class="text-h5 text-md-h4 font-weight-semibold mb-1">Project overview</h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Key metadata and delivery milestones for this CRM opportunity.
      </p>
    </header>

    <v-alert
      v-if="!project"
      type="warning"
      variant="tonal"
      border="start"
      border-color="warning"
      density="comfortable"
      role="status"
    >
      The project details are not available. Try refreshing the CRM workspace.
    </v-alert>

    <v-card v-else variant="outlined">
      <v-card-item>
        <v-card-title class="text-h6 font-weight-semibold">
          Delivery timeline
        </v-card-title>
        <v-card-subtitle class="text-body-2 text-medium-emphasis">
          Estimated schedule pulled from the shared CRM dataset.
        </v-card-subtitle>
      </v-card-item>

      <v-divider />

      <v-card-text>
        <v-row class="gap-y-4" dense>
          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Client</span>
              <span class="text-body-1 font-weight-medium">{{ project.clientName || '—' }}</span>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Pipeline</span>
              <span class="text-body-1 font-weight-medium">{{ project.pipeline || '—' }}</span>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Budget</span>
              <span class="text-body-1 font-weight-medium">{{ formattedBudget }}</span>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Win rate</span>
              <span class="text-body-1 font-weight-medium">{{ formattedProbability }}</span>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Kickoff</span>
              <span class="text-body-1 font-weight-medium">{{ formatDate(project.startDate) }}</span>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="d-flex flex-column gap-1">
              <span class="text-caption text-uppercase text-medium-emphasis">Target delivery</span>
              <span class="text-body-1 font-weight-medium">{{ formatDate(project.dueDate || project.finishDate) }}</span>
            </div>
          </v-col>

          <v-col cols="12">
            <v-divider class="my-3" />
          </v-col>

          <v-col cols="12">
            <div class="d-flex flex-column gap-2">
              <span class="text-caption text-uppercase text-medium-emphasis">Tags</span>
              <div v-if="project.tags?.length" class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="tag in project.tags"
                  :key="`tag-${tag}`"
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="text-capitalize font-weight-medium"
                >
                  {{ tag }}
                </v-chip>
              </div>
              <span v-else class="text-body-2 text-medium-emphasis">No tags yet.</span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="project?.description" variant="tonal" color="primary">
      <v-card-item>
        <v-card-title class="text-h6 font-weight-semibold">Narrative</v-card-title>
        <v-card-subtitle class="text-body-2 text-primary-darken-1">
          Summary shared by the account team.
        </v-card-subtitle>
      </v-card-item>
      <v-card-text class="text-body-2">{{ project.description }}</v-card-text>
    </v-card>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useCrmProjectsStore, type CrmProject } from "~/stores/crm-projects";

const props = defineProps<{
  projectId: string;
}>();

const projectsStore = useCrmProjectsStore();
const { locale } = useI18n();

const project = computed<CrmProject | null>(() => projectsStore.getProject(props.projectId));

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }),
);

const probabilityFormatter = computed(() => new Intl.NumberFormat(locale.value, { style: "percent", maximumFractionDigits: 0 }));

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(parsed);
  }

  return value;
}

const formattedBudget = computed(() => {
  if (!project.value?.budget || !Number.isFinite(project.value.budget)) {
    return "—";
  }

  return currencyFormatter.value.format(project.value.budget);
});

const formattedProbability = computed(() => {
  if (typeof project.value?.probability === "number" && Number.isFinite(project.value.probability)) {
    return probabilityFormatter.value.format(Math.max(Math.min(project.value.probability, 1), 0));
  }

  return "—";
});
</script>

<style scoped>
.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
