<template>
  <v-dialog v-model="isOpen" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h5 font-weight-semibold">Nouvelle tâche</v-card-title>
      <v-card-subtitle>Planifiez une tâche pour votre sprint courant.</v-card-subtitle>
      <v-divider />
      <v-card-text>
        <v-form ref="formRef" class="d-flex flex-column gap-4" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.title"
            label="Titre"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:check-circle-outline"
            :rules="titleRules"
            required
            autocomplete="off"
          />

          <v-textarea
            v-model="form.description"
            label="Description (optionnelle)"
            variant="outlined"
            density="comfortable"
            color="primary"
            auto-grow
            rows="3"
            prepend-inner-icon="mdi:file-document-edit-outline"
          />

          <v-select
            v-model="form.projectId"
            :items="projectItems"
            label="Projet"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:briefcase-outline"
            :rules="projectRules"
            required
          />

          <v-row class="g-4">
            <v-col cols="12" md="6">
              <v-select
                v-model="form.priority"
                :items="priorityItems"
                label="Priorité"
                variant="outlined"
                density="comfortable"
                color="primary"
                prepend-inner-icon="mdi:flag"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.assigneeId"
                :items="assigneeItems"
                label="Assignée"
                variant="outlined"
                density="comfortable"
                color="primary"
                prepend-inner-icon="mdi:account"
                clearable
              />
            </v-col>
          </v-row>

          <v-row class="g-4">
            <v-col cols="12" md="6">
              <v-date-input
                v-model="form.dueDate"
                label="Échéance"
                variant="outlined"
                density="comfortable"
                color="primary"
                prepend-icon="mdi:calendar"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.sprintId"
                :items="sprintItems"
                label="Sprint"
                variant="outlined"
                density="comfortable"
                color="primary"
                prepend-inner-icon="mdi:timeline"
                :rules="sprintRules"
                required
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            border="start"
            border-color="error"
            density="comfortable"
            role="alert"
          >
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Annuler</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none font-weight-semibold"
          :loading="loading"
          :disabled="projectItems.length === 0 || sprintItems.length === 0"
          @click="handleSubmit"
        >
          Créer la tâche
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import type { VForm } from "vuetify/components";

import type { CrmBoardTaskPriority } from "~/stores/crm-board";

type SelectOption = { label: string; value: string };

type AssigneeOption = { label: string; value: string | null };

type ProjectOption = { id: string; name: string; key: string };
type SprintOption = { id: string; name: string };
type UserOption = { id: string; name: string; initials: string };

const isOpen = defineModel<boolean>({ default: false });

const props = defineProps<{
  projects: ProjectOption[];
  sprints: SprintOption[];
  users: UserOption[];
  defaultProjectId?: string | null;
  defaultSprintId?: string | null;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  submit: [
    {
      title: string;
      description?: string;
      projectId: string;
      sprintId: string;
      priority: CrmBoardTaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
    },
  ];
}>();

const formRef = ref<VForm | null>(null);
const form = reactive({
  title: "",
  description: "",
  projectId: "",
  sprintId: "",
  priority: "Medium" as CrmBoardTaskPriority,
  assigneeId: null as string | null,
  dueDate: null as string | null,
});

const loading = computed(() => props.loading ?? false);
const error = computed(() => props.error ?? null);

const projectItems = computed<SelectOption[]>(() =>
  props.projects.map((project) => ({
    label: `${project.name} (${project.key})`,
    value: project.id,
  })),
);

const sprintItems = computed<SelectOption[]>(() =>
  props.sprints.map((sprint) => ({
    label: sprint.name,
    value: sprint.id,
  })),
);

const priorityItems: CrmBoardTaskPriority[] = ["Urgent", "High", "Medium", "Low"];

const assigneeItems = computed<AssigneeOption[]>(() => [
  { label: "Non assigné", value: null },
  ...props.users.map((user) => ({
    label: `${user.name} (${user.initials})`,
    value: user.id,
  })),
]);

const titleRules = [(value: string | null) => (value && value.trim().length > 0) || "Le titre est requis." ];
const projectRules = [(value: string | null) => (value && value.trim().length > 0) || "Sélectionnez un projet." ];
const sprintRules = [(value: string | null) => (value && value.trim().length > 0) || "Sélectionnez un sprint." ];

function closeDialog() {
  isOpen.value = false;
}

function resetForm(defaultProject: string | null, defaultSprint: string | null) {
  form.title = "";
  form.description = "";
  form.projectId = defaultProject ?? "";
  form.sprintId = defaultSprint ?? "";
  form.priority = "Medium";
  form.assigneeId = null;
  form.dueDate = null;
}

async function handleSubmit() {
  const formElement = formRef.value;
  if (formElement) {
    const valid = await formElement.validate();
    if (!valid.valid) {
      return;
    }
  }

  emit("submit", {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    projectId: form.projectId,
    sprintId: form.sprintId,
    priority: form.priority,
    assigneeId: form.assigneeId,
    dueDate: form.dueDate,
  });
}

watch(
  () => isOpen.value,
  async (open) => {
    if (open) {
      resetForm(props.defaultProjectId ?? null, props.defaultSprintId ?? null);
      await nextTick();
      formRef.value?.resetValidation();
    }
  },
);
</script>
