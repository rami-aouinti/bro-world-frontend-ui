<template>
  <div class="d-flex flex-column gap-4">
    <v-text-field
      v-model="project.name"
      label="Project name"
      variant="outlined"
      density="comfortable"
      color="primary"
      :rules="nameRules"
      required
      prepend-inner-icon="mdi:briefcase-outline"
    />

    <v-textarea
      v-model="project.description"
      label="Summary"
      variant="outlined"
      density="comfortable"
      color="primary"
      auto-grow
      rows="3"
      prepend-inner-icon="mdi:text-box-outline"
    />

    <v-row
      dense
      class="g-4"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="project.pipeline"
          :items="pipelineOptions"
          label="Pipeline"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:transit-connection"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="project.stage"
          :items="stageOptions"
          label="Stage"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:chart-timeline-variant"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="project.status"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:progress-clock"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="project.priority"
          :items="priorityOptions"
          label="Priority"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:flag"
          clearable
        />
      </v-col>
    </v-row>

    <v-row
      dense
      class="g-4"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="project.clientName"
          label="Client"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:account-tie"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="project.ownerName"
          label="Owner"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:account"
        />
      </v-col>
    </v-row>

    <v-row
      dense
      class="g-4"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model.number="project.budget"
          type="number"
          label="Budget"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:currency-usd"
          prefix="€"
          min="0"
          step="1000"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model.number="project.probability"
          type="number"
          label="Win probability"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-inner-icon="mdi:target"
          suffix="%"
          min="0"
          max="100"
          step="1"
        />
      </v-col>
    </v-row>

    <v-row
      dense
      class="g-4"
    >
      <v-col
        cols="12"
        md="4"
      >
        <v-date-input
          v-model="project.startDate"
          label="Start date"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-icon="mdi:calendar-start"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-date-input
          v-model="project.dueDate"
          label="Due date"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-icon="mdi:calendar-clock"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-date-input
          v-model="project.finishDate"
          label="Finish date"
          variant="outlined"
          density="comfortable"
          color="primary"
          prepend-icon="mdi:calendar-check"
          clearable
        />
      </v-col>
    </v-row>

    <v-combobox
      v-model="project.tags"
      label="Tags"
      variant="outlined"
      density="comfortable"
      color="primary"
      multiple
      chips
      closable-chips
      clearable
      prepend-inner-icon="mdi:tag"
      hint="Press enter to add a tag"
      persistent-hint
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

export interface ProjectFormState {
  name: string;
  description: string;
  pipeline: string | null;
  stage: string | null;
  status: string | null;
  priority: string | null;
  ownerName: string;
  clientName: string;
  budget: number | null;
  probability: number | null;
  startDate: string | null;
  dueDate: string | null;
  finishDate: string | null;
  tags: string[];
}

const project = defineModel<ProjectFormState>({ required: true });

const pipelineOptions = ["Enterprise", "Growth", "Scale-Up", "SMB"];

const stageOptions = ["Discovery", "Qualification", "Planning", "Execution", "Handover"];

const statusOptions = ["planning", "in-progress", "at-risk", "completed", "on-hold"];

const priorityOptions = ["low", "medium", "high"];

const nameRules = computed(() => [
  (value: string) => !!value?.trim() || "Please provide a project name.",
]);

const vuetifyComponentsPromise = import("vuetify/components");

const VCombobox = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VCombobox));
</script>
