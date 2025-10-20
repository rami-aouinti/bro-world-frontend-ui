<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title class="text-h6 font-weight-semibold">Task timeline</v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Historical and upcoming deliverables associated with this CRM project.
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pt-4">
      <v-alert
        v-if="loadError"
        type="error"
        variant="tonal"
        border="start"
        border-color="error"
        density="comfortable"
        class="mb-4"
        role="alert"
      >
        {{ loadError }}
      </v-alert>

      <div
        v-if="isLoading"
        class="py-6"
      >
        <v-progress-linear
          indeterminate
          color="primary"
          height="6"
          rounded="lg"
        />
      </div>

      <v-alert
        v-else-if="tasks.length === 0"
        type="info"
        variant="tonal"
        border="start"
        border-color="primary"
        density="comfortable"
        role="status"
      >
        No tasks are scheduled for this project yet. Start planning in the CRM workspace.
      </v-alert>

      <ClientOnly>
        <VDataTable
          v-else
          :headers="headers"
          :items="tableItems"
          :item-value="'id'"
          density="comfortable"
          class="crm-project-tasks-table"
          hover
        >
          <template #[`item.name`]="{ item }">
            <div class="d-flex flex-column gap-1">
              <span class="text-body-1 font-weight-semibold">{{ item.name }}</span>
              <span
                v-if="item.brief"
                class="text-body-2 text-medium-emphasis"
                >{{ item.brief }}</span
              >
            </div>
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip
              :color="statusMeta(item.status).color"
              variant="tonal"
              size="small"
              class="text-uppercase"
            >
              {{ statusMeta(item.status).label }}
            </v-chip>
          </template>

          <template #[`item.schedule`]="{ item }">
            <div class="d-flex flex-column">
              <span class="text-body-2 font-weight-medium">{{ item.schedule }}</span>
              <span
                v-if="item.duration"
                class="text-caption text-medium-emphasis"
                >{{ item.duration }}</span
              >
            </div>
          </template>
        </VDataTable>
      </ClientOnly>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

import { useCrmTasksStore } from "~/stores/crm-tasks";

const props = defineProps<{
  projectId: string;
}>();

const { locale } = useI18n();
const tasksStore = useCrmTasksStore();

const VDataTable = defineAsyncComponent(() =>
  import("vuetify/labs/VDataTable").then((mod) => mod.VDataTable),
);

await tasksStore.listTasks(props.projectId);

const tasks = computed(() => tasksStore.tasks.value[props.projectId] ?? []);
const isLoading = computed(() => tasksStore.pending.value[props.projectId] ?? false);
const loadError = computed(() => tasksStore.error.value?.[props.projectId] ?? null);

const headers = computed(() => [
  { title: "Task", key: "name", sortable: false },
  { title: "Status", key: "status", sortable: false, width: 140 },
  { title: "Schedule", key: "schedule", sortable: false, width: 220 },
]);

const tableItems = computed(() =>
  tasks.value.map((task) => ({
    id: task.id,
    name: task.name,
    brief: task.brief,
    status: task.status ?? "todo",
    schedule: formatDateRange(task.startDate, task.finishDate),
    duration: formatDuration(task.startDate, task.finishDate),
  })),
);

function statusMeta(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
      return { color: "success", label: "Completed" };
    case "in-progress":
      return { color: "warning", label: "In progress" };
    case "blocked":
      return { color: "error", label: "Blocked" };
    default:
      return { color: "primary", label: "To do" };
  }
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
  const startText = formatDate(start);
  const endText = formatDate(end);

  if (startText && endText) {
    return `${startText} → ${endText}`;
  }

  return startText || endText || "—";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(parsed);
  }

  return value;
}

function formatDuration(start: string | null | undefined, end: string | null | undefined) {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (
    !startDate ||
    !endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "";
  }

  const diff = Math.max(endDate.getTime() - startDate.getTime(), 0);
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(days) || days <= 0) {
    return "";
  }

  if (days === 1) {
    return "1 day";
  }

  return `${days} days`;
}
</script>

<style scoped>
.crm-project-tasks-table :deep(thead th) {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
