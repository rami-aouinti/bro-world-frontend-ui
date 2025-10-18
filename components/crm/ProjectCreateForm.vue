<template>
  <v-card
    variant="outlined"
    class="h-100"
  >
    <v-card-item>
      <v-card-title class="text-h5 font-weight-semibold"> Create project </v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Capture a new opportunity and enrich your CRM pipeline.
      </v-card-subtitle>
    </v-card-item>

    <v-divider class="mb-2" />

    <v-card-text>
      <v-form
        ref="formRef"
        class="d-flex flex-column gap-4"
        @submit.prevent="handleSubmit"
      >
        <FormError :error="errorMessage" />

        <FormSuccess :visible="Boolean(successMessage)">
          {{ successMessage }}
        </FormSuccess>

        <CommonProjectFormFields v-model="formState" />

        <div class="d-flex justify-end">
          <LockableButton
            color="primary"
            variant="flat"
            rounded="lg"
            size="large"
            type="submit"
            class="text-uppercase font-weight-semibold"
            :loading="isSubmitting"
          >
            Save project
          </LockableButton>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import type { VForm } from "vuetify/components";

import LockableButton from "~/components/LockableButton.vue";
import FormError from "~/components/crm/FormError.vue";
import FormSuccess from "~/components/crm/FormSuccess.vue";
import CommonProjectFormFields, {
  type ProjectFormState,
} from "~/components/crm/CommonProjectFormFields.vue";
import {
  useCrmProjectsStore,
  type CrmProject,
  type CrmProjectCreatePayload,
} from "~/stores/crm-projects";

const emit = defineEmits<{ (event: "created", project: CrmProject): void }>();

const store = useCrmProjectsStore();
const formRef = ref<VForm | null>(null);
const successProject = ref<CrmProject | null>(null);

const formState = reactive<ProjectFormState>(createEmptyFormState());

const isSubmitting = computed(() => store.creating.value);
const errorMessage = computed(() => store.createError.value ?? null);
const successMessage = computed(() => {
  const project = successProject.value;
  if (!project) {
    return "";
  }

  const name = project.name?.trim();
  return name ? `“${name}” has been added to your pipeline.` : "Project saved successfully.";
});

async function handleSubmit() {
  if (isSubmitting.value) {
    return;
  }

  const form = formRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }

  successProject.value = null;
  store.createError.value = null;

  const payload = transformStateToPayload(formState);

  try {
    const project = await store.createProject(payload);
    successProject.value = project;
    emit("created", project);
    resetForm();
  } catch (error) {
    // Errors are handled via the store's createError state
  }
}

function resetForm() {
  const nextState = createEmptyFormState();
  Object.assign(formState, nextState);
  formRef.value?.resetValidation();
}

function createEmptyFormState(): ProjectFormState {
  return {
    name: "",
    description: "",
    pipeline: "Enterprise",
    stage: "Discovery",
    status: "planning",
    priority: "medium",
    ownerName: "",
    clientName: "",
    budget: null,
    probability: 60,
    startDate: null,
    dueDate: null,
    finishDate: null,
    tags: [],
  };
}

function transformStateToPayload(state: ProjectFormState): CrmProjectCreatePayload {
  const trimmedName = state.name?.trim() ?? "";
  const trimmedDescription = state.description?.trim() ?? "";
  const trimmedOwner = state.ownerName?.trim() ?? "";
  const trimmedClient = state.clientName?.trim() ?? "";

  return {
    name: trimmedName,
    description: trimmedDescription || null,
    pipeline: state.pipeline || null,
    stage: state.stage || null,
    status: state.status || null,
    priority: state.priority || null,
    ownerName: trimmedOwner || null,
    clientName: trimmedClient || null,
    budget: normalizeNumber(state.budget),
    probability: normalizeProbability(state.probability),
    startDate: normalizeDate(state.startDate),
    dueDate: normalizeDate(state.dueDate),
    finishDate: normalizeDate(state.finishDate),
    tags: normalizeTags(state.tags),
  };
}

function normalizeNumber(value: number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function normalizeProbability(value: number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const clamped = Math.min(Math.max(value, 0), 100);
    return Math.round(clamped) / 100;
  }
  return null;
}

function normalizeDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  const timestamp = parsed.getTime();
  if (!Number.isNaN(timestamp)) {
    return parsed.toISOString();
  }

  return trimmed;
}

function normalizeTags(tags: string[]): string[] | null {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  const normalized = tags
    .map((tag) => tag?.trim())
    .filter((tag): tag is string => Boolean(tag && tag.length > 0));

  return normalized.length > 0 ? normalized : null;
}
</script>
