<template>
  <v-dialog
    v-model="isOpen"
    max-width="480"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 font-weight-semibold">Nouveau projet</v-card-title>
      <v-card-subtitle>Renseignez les informations principales du projet.</v-card-subtitle>
      <v-divider />
      <v-card-text>
        <v-form
          ref="formRef"
          class="d-flex flex-column gap-4"
          @submit.prevent="handleSubmit"
        >
          <v-text-field
            v-model="form.name"
            label="Nom du projet"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:briefcase-outline"
            :rules="nameRules"
            required
            autocomplete="off"
          />

          <v-text-field
            v-model="form.key"
            label="Clé du projet"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:key-variant"
            hint="2 à 6 lettres en majuscules"
            persistent-hint
            :rules="keyRules"
            autocomplete="off"
            @update:model-value="handleKeyInput"
          />

          <v-text-field
            v-model="form.color"
            label="Couleur (hex)"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:palette"
            :rules="colorRules"
            autocomplete="off"
          />

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
        <v-btn
          variant="text"
          @click="closeDialog"
          >Annuler</v-btn
        >
        <v-btn
          color="primary"
          variant="flat"
          class="text-none font-weight-semibold"
          :loading="loading"
          @click="handleSubmit"
        >
          Créer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import type { VForm } from "vuetify/components";

const isOpen = defineModel<boolean>({ default: false });

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  submit: [{ name: string; key: string; color: string }];
}>();

const formRef = ref<VForm | null>(null);
const form = reactive({
  name: "",
  key: "",
  color: "#2563eb",
});

const loading = computed(() => props.loading ?? false);
const error = computed(() => props.error ?? null);

const nameRules = [
  (value: string | null) => (value && value.trim().length > 0) || "Le nom est requis.",
];
const keyRules = [
  (value: string | null) => {
    if (!value || value.trim().length === 0) {
      return "La clé est requise.";
    }
    return /^[A-Z]{2,6}$/.test(value.trim()) || "Utilisez 2 à 6 lettres en majuscules.";
  },
];
const colorRules = [
  (value: string | null) => {
    if (!value || value.trim().length === 0) {
      return "La couleur est requise.";
    }
    const normalized = value.trim().startsWith("#") ? value.trim() : `#${value.trim()}`;
    return (
      /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(normalized) || "Renseignez un code hex valide."
    );
  },
];

function handleKeyInput(value: string) {
  form.key = value.toUpperCase().replace(/[^A-Z]/g, "");
}

function closeDialog() {
  isOpen.value = false;
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
    name: form.name.trim(),
    key: form.key.trim(),
    color: form.color.trim(),
  });
}

watch(
  () => isOpen.value,
  async (open) => {
    if (open) {
      form.name = "";
      form.key = "";
      form.color = "#2563eb";
      await nextTick();
      formRef.value?.resetValidation();
    }
  },
);
</script>
