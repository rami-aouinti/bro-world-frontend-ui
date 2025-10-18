<template>
  <div class="d-flex flex-column gap-4">
    <v-text-field
      v-model="task.name"
      label="Task name"
      variant="outlined"
      density="comfortable"
      color="primary"
      prepend-inner-icon="mdi:checkbox-marked-circle-outline"
      :rules="nameRules"
      required
    />

    <v-textarea
      v-model="task.brief"
      label="Brief summary"
      variant="outlined"
      density="comfortable"
      color="primary"
      auto-grow
      rows="2"
      prepend-inner-icon="mdi:file-document-edit-outline"
    />

    <v-textarea
      v-model="task.description"
      label="Detailed description"
      variant="outlined"
      density="comfortable"
      color="primary"
      auto-grow
      rows="4"
      prepend-inner-icon="mdi:text-box-edit-outline"
    />

    <v-row
      dense
      class="g-4"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-date-input
          v-model="task.startDate"
          label="Start date"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-icon="mdi:calendar-start"
          :min="startDateMin"
          :max="startDateMax"
          :rules="startDateRules"
          required
          clearable
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-date-input
          v-model="task.finishDate"
          label="Finish date"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-icon="mdi:calendar-check"
          :min="finishDateMin"
          :max="finishDateMax"
          :rules="finishDateRules"
          required
          clearable
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { CrmProject } from "~/stores/crm-projects";

export interface TaskFormState {
  name: string;
  brief: string;
  description: string;
  startDate: string | null;
  finishDate: string | null;
}

const task = defineModel<TaskFormState>({ required: true });

const props = defineProps<{
  project: CrmProject | null;
}>();

function parseDate(value: string | null | undefined): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function toIso(timestamp: number | null): string | null {
  if (typeof timestamp !== "number") {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function earliest(...values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => parseDate(value ?? null))
    .filter((value): value is number => typeof value === "number");

  if (timestamps.length === 0) {
    return null;
  }

  return toIso(Math.min(...timestamps));
}

function latest(...values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => parseDate(value ?? null))
    .filter((value): value is number => typeof value === "number");

  if (timestamps.length === 0) {
    return null;
  }

  return toIso(Math.max(...timestamps));
}

const nameRules = [
  (value: string | null) => {
    if (typeof value === "string" && value.trim().length > 0) {
      return true;
    }

    return "Please provide a task name.";
  },
];

const startDateMin = computed(() => latest(null, props.project?.startDate ?? null));
const startDateMax = computed(() =>
  earliest(task.value.finishDate, props.project?.finishDate ?? null),
);
const finishDateMin = computed(() =>
  latest(task.value.startDate, props.project?.startDate ?? null),
);
const finishDateMax = computed(() => earliest(null, props.project?.finishDate ?? null));

const startDateRules = [
  (value: string | null) => {
    if (!value) {
      return "Start date is required.";
    }

    const finishDate = task.value.finishDate;
    if (finishDate) {
      const start = parseDate(value);
      const finish = parseDate(finishDate);
      if (typeof start === "number" && typeof finish === "number" && start > finish) {
        return "Start date must be before the finish date.";
      }
    }

    const projectStart = props.project?.startDate ?? null;
    if (projectStart) {
      const start = parseDate(value);
      const min = parseDate(projectStart);
      if (typeof start === "number" && typeof min === "number" && start < min) {
        return "Start date must be within the project timeline.";
      }
    }

    return true;
  },
];

const finishDateRules = [
  (value: string | null) => {
    if (!value) {
      return "Finish date is required.";
    }

    const startDate = task.value.startDate;
    if (startDate) {
      const finish = parseDate(value);
      const start = parseDate(startDate);
      if (typeof finish === "number" && typeof start === "number" && finish < start) {
        return "Finish date cannot precede the start date.";
      }
    }

    const projectFinish = props.project?.finishDate ?? null;
    if (projectFinish) {
      const finish = parseDate(value);
      const max = parseDate(projectFinish);
      if (typeof finish === "number" && typeof max === "number" && finish > max) {
        return "Finish date must be within the project timeline.";
      }
    }

    return true;
  },
];
</script>
