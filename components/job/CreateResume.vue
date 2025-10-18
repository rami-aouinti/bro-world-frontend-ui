<template>
  <v-form @submit.prevent="submit">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="form.name"
          :label="t('applicant.name')"
          density="compact"
          rounded="xl"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="form.contactEmail"
          :label="t('applicant.contactEmail')"
          density="compact"
          rounded="xl"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="form.jobPreferences"
          :label="t('applicant.preferences')"
          density="compact"
          rounded="xl"
          auto-grow
        />
      </v-col>
    </v-row>
    <v-btn
      color="primary"
      type="submit"
    >
      {{ t("applicant.submit") }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";

type Emits = {
  (e: "applicant-created"): void;
};

const props = defineProps<{
  selectedJobId: string | null;
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();

const form = ref({
  name: "",
  contactEmail: "",
  jobPreferences: "",
  jobId: props.selectedJobId ?? "",
});

watch(
  () => props.selectedJobId,
  (value) => {
    form.value.jobId = value ?? "";
  },
);

async function submit() {
  try {
    await $fetch("/api/job/applicants", {
      method: "POST",
      body: form.value,
    });
  } catch (error) {
    console.error(error);
    notify.error(t("applicant.createError"));
    return;
  }

  notify.success(t("applicant.createdSuccess"));
  emit("applicant-created");
  form.value = {
    name: "",
    contactEmail: "",
    jobPreferences: "",
    jobId: props.selectedJobId ?? "",
  };
}
</script>
