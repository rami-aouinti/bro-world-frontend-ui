<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title class="text-h5 font-weight-semibold">
        Pipeline overview
      </v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Monitor revenue forecasts and identify deals that need attention.
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pt-4">
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        border="start"
        border-color="error"
        density="comfortable"
        class="mb-4"
        role="alert"
      >
        {{ errorMessage }}
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="tableItems"
        :item-value="'id'"
        :loading="loading"
        class="crm-projects-table"
        hover
      >
        <template #loading>
          <div class="py-8 text-body-2 text-medium-emphasis text-center">
            Loading projects…
          </div>
        </template>

        <template #[`item.name`]="{ item }">
          <div class="d-flex flex-column gap-1">
            <span class="text-body-1 font-weight-semibold">{{ item.name }}</span>
            <div class="d-flex flex-wrap align-center gap-2 text-medium-emphasis text-caption">
              <span v-if="item.pipeline">{{ item.pipeline }}</span>
              <span v-if="item.stage" class="d-flex align-center gap-1">
                <v-icon icon="mdi:chart-timeline-variant" size="16" />
                <span>{{ item.stage }}</span>
              </span>
            </div>
            <div
              v-if="item.tags.length"
              class="d-flex flex-wrap gap-1"
            >
              <v-chip
                v-for="tag in item.tags"
                :key="`${item.id}-tag-${tag}`"
                color="primary"
                size="x-small"
                variant="tonal"
                class="text-capitalize font-weight-medium"
              >
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #[`item.client`]="{ item }">
          <span class="text-body-2">{{ item.client || '—' }}</span>
        </template>

        <template #[`item.owner`]="{ item }">
          <span class="text-body-2">{{ item.owner || '—' }}</span>
        </template>

        <template #[`item.priority`]="{ item }">
          <v-chip
            v-if="item.priority"
            :color="priorityColor(item.priority)"
            size="small"
            variant="tonal"
            class="text-capitalize font-weight-medium"
          >
            {{ item.priority }}
          </v-chip>
          <span v-else class="text-body-2">—</span>
        </template>

        <template #[`item.budget`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ formatBudget(item.budget) }}</span>
        </template>

        <template #[`item.probability`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ formatProbability(item.probability) }}</span>
        </template>

        <template #[`item.dueDate`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.dueDate) }}</span>
        </template>

        <template #bottom>
          <div class="px-6 pb-4 text-body-2 text-medium-emphasis">
            <span v-if="!tableItems.length && !loading">
              Add a project to populate your CRM pipeline.
            </span>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { CrmProject } from "~/stores/crm-projects";

const props = withDefaults(
  defineProps<{
    projects?: CrmProject[];
    loading?: boolean;
    error?: string | null;
  }>(),
  {
    projects: () => [],
    loading: false,
    error: null,
  },
);

const { locale } = useI18n();

const headers = computed(() => [
  { title: "Project", key: "name", sortable: false },
  { title: "Client", key: "client", sortable: false },
  { title: "Owner", key: "owner", sortable: false },
  { title: "Priority", key: "priority", sortable: false },
  { title: "Budget", key: "budget" },
  { title: "Win rate", key: "probability" },
  { title: "Due date", key: "dueDate" },
]);

const tableItems = computed(() =>
  props.projects.map((project) => ({
    id: project.id,
    name: project.name,
    client: project.clientName ?? null,
    owner: project.ownerName ?? null,
    pipeline: project.pipeline ?? null,
    stage: project.stage ?? project.status ?? null,
    priority: project.priority ?? null,
    budget: project.budget ?? null,
    probability: project.probability ?? null,
    dueDate: project.dueDate ?? project.finishDate ?? null,
    tags: Array.isArray(project.tags) ? project.tags : [],
  })),
);

const errorMessage = computed(() => props.error?.trim() || "");

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }),
);

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
    }),
);

function formatBudget(value: number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return currencyFormatter.value.format(value);
  }
  return "—";
}

function formatProbability(value: number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const percent = Math.max(Math.min(value, 1), 0) * 100;
    return `${Math.round(percent)}%`;
  }
  return "—";
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return dateFormatter.value.format(parsed);
  }

  return value;
}

function priorityColor(priority: string | null) {
  switch ((priority ?? "").toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "primary";
  }
}
</script>

<style scoped>
.crm-projects-table :deep(thead th) {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}
</style>
