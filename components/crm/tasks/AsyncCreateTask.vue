<template>
  <v-card variant="outlined" class="h-100">
    <v-card-item>
      <v-card-title class="text-h5 font-weight-semibold">
        Task coordination
      </v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Plan deliverables for each opportunity using the shared CRM dataset.
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text>
      <v-row class="g-8" align="stretch">
        <v-col cols="12" lg="5">
          <v-form ref="formRef" class="d-flex flex-column gap-4" @submit.prevent="handleSubmit">
            <v-select
              v-model="selectedProjectId"
              :items="projectOptions"
              label="Linked project"
              variant="outlined"
              density="comfortable"
              color="primary"
              prepend-inner-icon="mdi:briefcase-outline"
              :disabled="projectOptions.length === 0"
              :hint="projectHint"
              persistent-hint
              required
            />

            <FormError :error="formError" />

            <FormSuccess :visible="Boolean(successMessage)">
              {{ successMessage }}
            </FormSuccess>

            <CommonTaskFormFields v-model="formState" :project="selectedProject" />

            <div class="d-flex justify-end">
              <LockableButton
                color="primary"
                variant="flat"
                rounded="lg"
                size="large"
                type="submit"
                class="text-uppercase font-weight-semibold"
                :loading="isSubmitting"
                :disabled="!selectedProjectId"
              >
                Save task
              </LockableButton>
            </div>
          </v-form>
        </v-col>

        <v-col cols="12" lg="7">
          <v-sheet
            color="surface-variant"
            class="pa-6 h-100 d-flex flex-column"
            rounded="xl"
            border
          >
            <header class="d-flex flex-column gap-1 mb-6">
              <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                {{ boardTitle }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ boardSubtitle }}
              </p>
            </header>

            <div v-if="isLoadingTasks" class="py-6">
              <v-progress-linear indeterminate color="primary" height="6" rounded="lg" />
            </div>
            <v-alert
              v-else-if="listError"
              type="error"
              variant="tonal"
              border="start"
              border-color="error"
              density="comfortable"
              role="alert"
            >
              {{ listError }}
            </v-alert>
            <v-alert
              v-else-if="tasksForProject.length === 0"
              type="info"
              variant="tonal"
              border="start"
              border-color="primary"
              density="comfortable"
              class="mb-0"
              role="status"
            >
              No tasks are scheduled for this project yet.
            </v-alert>
            <v-list
              v-else
              lines="three"
              class="elevated-task-list"
            >
              <template v-for="(task, index) in tasksForProject" :key="task.id">
                <v-list-item>
                  <template #prepend>
                    <v-avatar size="36" color="primary" variant="tonal">
                      <v-icon :icon="resolveStatusMeta(task.status).icon" />
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-semibold">
                    {{ task.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDateRange(task.startDate, task.finishDate) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="task.brief">
                    {{ task.brief }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip
                      :color="resolveStatusMeta(task.status).color"
                      variant="tonal"
                      size="small"
                      class="font-weight-medium text-uppercase"
                    >
                      {{ resolveStatusMeta(task.status).label }}
                    </v-chip>
                  </template>
                </v-list-item>

                <v-divider v-if="index < tasksForProject.length - 1" inset />
              </template>
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { VForm } from "vuetify/components";
import { callOnce } from "#app";
import { useI18n } from "vue-i18n";

import LockableButton from "~/components/LockableButton.vue";
import FormError from "~/components/crm/FormError.vue";
import FormSuccess from "~/components/crm/FormSuccess.vue";
import CommonTaskFormFields, {
  type TaskFormState,
} from "~/components/crm/tasks/CommonTaskFormFields.vue";
import {
  useCrmProjectsStore,
  type CrmProject,
} from "~/stores/crm-projects";
import {
  useCrmTasksStore,
  type CrmTask,
  type CrmTaskCreatePayload,
} from "~/stores/crm-tasks";

const projectsStore = useCrmProjectsStore();
const tasksStore = useCrmTasksStore();
const formRef = ref<VForm | null>(null);
const selectedProjectId = ref<string | null>(null);
const successTask = ref<CrmTask | null>(null);

await callOnce(() => projectsStore.listProjects());

const { locale } = useI18n();

const formState = reactive<TaskFormState>({
  name: "",
  brief: "",
  description: "",
  startDate: null,
  finishDate: null,
});

const projects = computed(() => projectsStore.projects.value);

const projectOptions = computed(() =>
  projects.value.map((project) => ({
    value: project.id,
    title: project.name?.trim() || "Untitled project",
  })),
);

if (!selectedProjectId.value && projectOptions.value.length > 0) {
  selectedProjectId.value = projectOptions.value[0]?.value ?? null;
}

watch(
  projectOptions,
  (options) => {
    if (!options.some((option) => option.value === selectedProjectId.value)) {
      selectedProjectId.value = options[0]?.value ?? null;
    }
  },
  { deep: true },
);

const selectedProject = computed<CrmProject | null>(() => {
  const id = selectedProjectId.value;
  return id ? projectsStore.getProject(id) : null;
});

watch(
  selectedProjectId,
  async (projectId) => {
    if (!projectId) {
      return;
    }

    try {
      await tasksStore.listTasks(projectId);
    } catch {
      // Errors are surfaced via the store's error state
    }
  },
  { immediate: true },
);

const tasksRecord = computed(() => tasksStore.tasks.value);

const tasksForProject = computed(() => {
  const projectId = selectedProjectId.value;
  if (!projectId) {
    return [] as CrmTask[];
  }

  return tasksRecord.value[projectId] ?? [];
});

const isLoadingTasks = computed(() => tasksStore.isPending(selectedProjectId.value));
const listError = computed(() => tasksStore.getError(selectedProjectId.value));
const formError = computed(() => tasksStore.getCreateError(selectedProjectId.value));
const isSubmitting = computed(() => tasksStore.isCreating(selectedProjectId.value));

const projectHint = computed(() => {
  const project = selectedProject.value;
  if (!project) {
    return "Select a project to link the new task.";
  }

  const projectName = project.name?.trim();
  if (projectName) {
    return `Linked to ${projectName}`;
  }

  return "Linked to the selected project.";
});

const successMessage = computed(() => {
  const task = successTask.value;
  if (!task) {
    return "";
  }

  const taskName = task.name?.trim();
  const projectName = selectedProject.value?.name?.trim();
  if (taskName && projectName) {
    return `“${taskName}” has been added to ${projectName}.`;
  }
  if (taskName) {
    return `Task “${taskName}” saved successfully.`;
  }
  return "The task was saved successfully.";
});

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
    }),
);

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return dateFormatter.value.format(new Date(parsed));
}

function formatDateRange(start: string | null | undefined, finish: string | null | undefined): string {
  const startLabel = formatDate(start);
  const finishLabel = formatDate(finish);

  if (start && finish) {
    return `${startLabel} → ${finishLabel}`;
  }

  if (start) {
    return `Starts ${startLabel}`;
  }

  if (finish) {
    return `Due ${finishLabel}`;
  }

  return "Schedule to be defined";
}

function resolveStatusMeta(status: string | null | undefined) {
  const normalized = status?.toString().trim().toLowerCase();

  switch (normalized) {
    case "completed":
      return { label: "Completed", color: "success", icon: "mdi-check-circle" };
    case "in-progress":
      return { label: "In progress", color: "primary", icon: "mdi-progress-clock" };
    case "todo":
    case "to-do":
      return { label: "To do", color: "grey", icon: "mdi-checkbox-blank-circle-outline" };
    default:
      return { label: "Planned", color: "secondary", icon: "mdi-timeline-clock-outline" };
  }
}

const boardTitle = computed(() => {
  const project = selectedProject.value;
  if (!project) {
    return "Project tasks";
  }

  const name = project.name?.trim();
  if (name) {
    return `${name} timeline`;
  }

  return "Project tasks";
});

const boardSubtitle = computed(() => {
  const project = selectedProject.value;
  if (!project) {
    return "Choose a project to review its scheduled work.";
  }

  const start = project.startDate ? formatDate(project.startDate) : null;
  const finish = project.finishDate ? formatDate(project.finishDate) : null;

  if (start && finish) {
    return `Project window: ${start} → ${finish}`;
  }

  if (start) {
    return `Project starts ${start}`;
  }

  if (finish) {
    return `Project wraps ${finish}`;
  }

  return "Project timeline to be confirmed.";
});

function resetForm() {
  formState.name = "";
  formState.brief = "";
  formState.description = "";
  formState.startDate = null;
  formState.finishDate = null;
  formRef.value?.resetValidation();
}

function transformStateToPayload(state: TaskFormState): CrmTaskCreatePayload {
  const trimmedName = state.name?.trim() ?? "";
  const trimmedBrief = state.brief?.trim() ?? "";
  const trimmedDescription = state.description?.trim() ?? "";

  return {
    name: trimmedName,
    brief: trimmedBrief || null,
    description: trimmedDescription || null,
    startDate: state.startDate,
    finishDate: state.finishDate,
    status: "in-progress",
  };
}

async function handleSubmit() {
  if (!selectedProjectId.value || isSubmitting.value) {
    return;
  }

  const form = formRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }

  successTask.value = null;

  try {
    const payload = transformStateToPayload(formState);
    const task = await tasksStore.createTask(selectedProjectId.value, payload);
    successTask.value = task;
    resetForm();
  } catch {
    // Errors are propagated via the store
  }
}
</script>

<style scoped>
.elevated-task-list {
  border-radius: 16px;
  background: var(--v-theme-surface);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
</style>
