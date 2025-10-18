<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ t("applicant.create") }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitApplicant">
          <v-row class="align-center mb-4">
            <v-col
              cols="12"
              md="4"
            >
              <v-select
                v-model="form.applicantId"
                :items="applicants"
                :item-title="getFileName"
                item-value="id"
                :label="t('applicant.name')"
                density="compact"
                rounded="xl"
              />
            </v-col>
            <v-col
              cols="12"
              md="1"
              class="text-center"
            >
              <div class="text-subtitle-1 font-weight-medium">OR</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-btn
                block
                color="primary"
                variant="outlined"
                @click="toggleUploadApplicant"
              >
                {{ t("applicant.uploadResume") }}
              </v-btn>
            </v-col>
            <v-col
              cols="12"
              md="1"
              class="text-center"
            >
              <div class="text-subtitle-1 font-weight-medium">OR</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-btn
                block
                color="primary"
                variant="outlined"
                @click="toggleCreateApplicant"
              >
                {{ t("applicant.create") }}
              </v-btn>
            </v-col>
          </v-row>

          <CreateResume
            v-if="showCreateApplicant"
            :selected-job-id="selectedJobId"
            @applicant-created="handleApplicantCreated"
          />
          <UploadResume
            v-if="showUploadApplicant"
            :selected-job-id="selectedJobId"
            @applicant-uploaded="handleApplicantUploaded"
          />
        </v-form>
      </v-card-text>
      <v-card-actions v-if="!showCreateApplicant && !showUploadApplicant">
        <v-btn
          text
          @click="emit('update:modelValue', false)"
        >
          {{ t("buttons.cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          @click="submitApplicant"
        >
          {{ t("applicant.submit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";
import CreateResume from "~/components/job/CreateResume.vue";
import UploadResume from "~/components/job/UploadResume.vue";

type Applicant = {
  id: string;
  name?: string;
  resume?: string;
};

type ApplicantsResponse = Applicant[] | { data: Applicant[] };

const props = defineProps<{
  modelValue: boolean;
  selectedJobId: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "applicant-created"): void;
}>();

const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();

const form = ref({
  applicantId: "",
});

const showCreateApplicant = ref(false);
const showUploadApplicant = ref(false);
const applicants = ref<Applicant[]>([]);

function getFileName(applicant: Applicant) {
  if (applicant.resume) {
    const parts = applicant.resume.split("/");
    return parts[parts.length - 1] ?? applicant.resume;
  }

  return `${applicant.name ?? "Unknown"} (${t("applicant.noResume")})`;
}

function toggleCreateApplicant() {
  showCreateApplicant.value = !showCreateApplicant.value;
  if (showCreateApplicant.value) {
    showUploadApplicant.value = false;
  }
}

function toggleUploadApplicant() {
  showUploadApplicant.value = !showUploadApplicant.value;
  if (showUploadApplicant.value) {
    showCreateApplicant.value = false;
  }
}

function normaliseApplicants(result: ApplicantsResponse): Applicant[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && Array.isArray(result.data)) {
    return result.data;
  }

  return [];
}

async function fetchApplicants() {
  try {
    const response = await $fetch<ApplicantsResponse>("/api/job/applicants");
    applicants.value = normaliseApplicants(response);
  } catch (error) {
    console.error(error);
  }
}

function handleApplicantCreated() {
  void fetchApplicants();
  showCreateApplicant.value = false;
  emit("applicant-created");
  emit("update:modelValue", false);
}

function handleApplicantUploaded() {
  void fetchApplicants();
  showUploadApplicant.value = false;
  emit("applicant-created");
  emit("update:modelValue", false);
}

async function submitApplicant() {
  if (!props.selectedJobId || !form.value.applicantId) {
    notify.error(t("applicant.selectError"));
    return;
  }

  try {
    await $fetch(`/api/job/application/${props.selectedJobId}/${form.value.applicantId}`, {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
    notify.error(t("applicant.submitError"));
    return;
  }

  notify.success(t("applicant.submitSuccess"));
  emit("applicant-created");
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      void fetchApplicants();
    }
  },
);

onMounted(() => {
  void fetchApplicants();
});
</script>
