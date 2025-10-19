<template>
  <main
    class="py-12"
    aria-labelledby="crm-workspace-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="crm-workspace-subheading"
      >
        <h1
          id="crm-workspace-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          CRM workspace
        </h1>
        <p
          id="crm-workspace-subheading"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          Centralise your opportunities, track their progress, and collaborate with sales in real
          time using our mock data.
        </p>
      </section>

      <v-row
        class="mb-10"
        align="stretch"
        dense
      >
        <v-col
          cols="12"
          md="5"
        >
          <ProjectCreateForm @created="handleProjectCreated" />
        </v-col>

        <v-col
          cols="12"
          md="7"
        >
          <v-card
            variant="tonal"
            color="primary"
            class="h-100"
          >
            <v-card-item>
              <v-card-title class="text-h5 font-weight-semibold text-primary-darken-3">
                Pipeline snapshot
              </v-card-title>
              <v-card-subtitle class="text-body-2 text-primary-darken-1">
                Quick indicators generated from the current mock dataset.
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-row dense>
                <v-col
                  cols="12"
                  sm="6"
                  class="mb-4"
                >
                  <div class="d-flex flex-column">
                    <span class="text-subtitle-2 text-primary-darken-1">Total projects</span>
                    <span class="text-h4 font-weight-bold">{{ totalProjects }}</span>
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  class="mb-4"
                >
                  <div class="d-flex flex-column">
                    <span class="text-subtitle-2 text-primary-darken-1">Active pipeline</span>
                    <span class="text-h4 font-weight-bold">{{ activeProjects }}</span>
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  class="mb-4"
                >
                  <div class="d-flex flex-column">
                    <span class="text-subtitle-2 text-primary-darken-1">High priority</span>
                    <span class="text-h4 font-weight-bold">{{ highPriorityProjects }}</span>
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  class="mb-4"
                >
                  <div class="d-flex flex-column">
                    <span class="text-subtitle-2 text-primary-darken-1">Forecasted revenue</span>
                    <span class="text-h4 font-weight-bold">{{ formattedForecast }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row
        class="mb-12"
        align="stretch"
        dense
      >
        <v-col cols="12">
          <TaskCreateSection />
        </v-col>
      </v-row>

      <section aria-labelledby="crm-table-heading">
        <div class="d-flex flex-column gap-4 mb-6">
          <v-alert
            v-if="createdProjectMessage"
            type="success"
            variant="tonal"
            border="start"
            border-color="success"
            density="comfortable"
            closable
            role="status"
            @click:close="clearCreatedProject"
          >
            {{ createdProjectMessage }}
          </v-alert>
        </div>

        <h2
          id="crm-table-heading"
          class="text-h4 font-weight-semibold mb-4"
        >
          Opportunities
        </h2>

        <ProjectListTable
          :projects="projects"
          :loading="isLoading"
          :error="tableError"
        />
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { callOnce } from "#app";

import ProjectCreateForm from "~/components/crm/ProjectCreateForm.vue";
import TaskCreateSection from "~/components/crm/tasks/TaskCreateSection.vue";
import ProjectListTable from "~/components/crm/ProjectListTable.vue";
import { useCrmProjectsStore, type CrmProject } from "~/stores/crm-projects";

const { locale } = useI18n();
const store = useCrmProjectsStore();
const createdProject = ref<CrmProject | null>(null);
const loadError = ref<string | null>(null);

try {
  await callOnce("crm:projects:list", () => store.listProjects());
} catch (error) {
  const message = store.error.value || (error as { message?: string } | null)?.message || null;
  loadError.value = message;
}

const projects = computed(() => store.projects.value);
const isLoading = computed(() => store.pending.value);
const tableError = computed(() => loadError.value || store.error.value || null);

const totalProjects = computed(() => projects.value.length);
const activeProjects = computed(
  () =>
    projects.value.filter(
      (project) => (project.status ?? project.stage ?? "").toLowerCase() !== "completed",
    ).length,
);
const highPriorityProjects = computed(
  () =>
    projects.value.filter((project) => (project.priority ?? "").toLowerCase() === "high").length,
);
const forecastValue = computed(() =>
  projects.value.reduce((total, project) => {
    const budget =
      typeof project.budget === "number" && Number.isFinite(project.budget) ? project.budget : 0;
    const probability =
      typeof project.probability === "number" && Number.isFinite(project.probability)
        ? Math.min(Math.max(project.probability, 0), 1)
        : 0;
    return total + budget * probability;
  }, 0),
);

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }),
);

const formattedForecast = computed(() => {
  if (forecastValue.value <= 0) {
    return "€0";
  }
  return currencyFormatter.value.format(forecastValue.value);
});

const createdProjectMessage = computed(() => {
  const project = createdProject.value;
  if (!project) {
    return "";
  }

  const name = project.name?.trim();
  return name
    ? `The project “${name}” is now part of your pipeline.`
    : "A new project has been added to your pipeline.";
});

function handleProjectCreated(project: CrmProject) {
  createdProject.value = project;
}

function clearCreatedProject() {
  createdProject.value = null;
}
</script>
