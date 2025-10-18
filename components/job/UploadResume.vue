<template>
  <v-form @submit.prevent="upload">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="applicantName"
          :label="t('applicant.name')"
          density="compact"
          rounded="xl"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-file-input
          v-model="files"
          :label="t('applicant.resume')"
          density="compact"
          rounded="xl"
          accept="application/pdf,.doc,.docx"
        />
      </v-col>
    </v-row>
    <v-btn
      color="primary"
      type="submit"
    >
      {{ t("applicant.upload") }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";

type Emits = {
  (e: "applicant-uploaded"): void;
};

const props = defineProps<{
  selectedJobId: string | null;
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();

const files = ref<File[]>([]);
const applicantName = ref("");
const jobId = ref(props.selectedJobId ?? "");

watch(
  () => props.selectedJobId,
  (value) => {
    jobId.value = value ?? "";
  },
);

const selectedFile = computed(() => files.value[0]);

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function upload() {
  if (!selectedFile.value) {
    notify.error(t("applicant.noFile"));
    return;
  }

  let fileContent: string;

  try {
    fileContent = await readFileAsDataUrl(selectedFile.value);
  } catch (error) {
    console.error(error);
    notify.error(t("applicant.uploadError"));
    return;
  }

  try {
    await $fetch("/api/job/applicants/upload", {
      method: "POST",
      body: {
        name: applicantName.value,
        jobId: jobId.value,
        file: fileContent,
        fileName: selectedFile.value.name,
      },
    });
  } catch (error) {
    console.error(error);
    notify.error(t("applicant.uploadError"));
    return;
  }

  notify.success(t("applicant.uploadSuccess"));
  emit("applicant-uploaded");
  files.value = [];
  applicantName.value = "";
}
</script>
