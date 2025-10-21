<template>
  <v-row
    class="mb-4"
    justify="center"
  >
    <v-col
      cols="12"
      md="6"
      class="text-center"
    >
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-plus"
        rounded
        variant="outlined"
        @click="emit('create-job')"
      >
        {{ t("job.job") }}
      </v-btn>
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="text-center"
    >
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-account-plus"
        rounded
        variant="outlined"
        @click="emit('create-applicant')"
      >
        {{ t("applicant.applicant") }}
      </v-btn>
    </v-col>
  </v-row>
  <v-text-field
    v-model="selectedLocations"
    :label="t('job.location')"
    density="compact"
    prepend-inner-icon="mdi-earth"
    rounded="xl"
    variant="outlined"
  />
  <v-combobox
    v-model="selectedCompany"
    :items="companyNames"
    chips
    clearable
    density="compact"
    :label="t('job.company')"
    rounded="xl"
    variant="outlined"
  />
  <v-select
    v-model="selectedSkills"
    :items="skillsOptions"
    chips
    clearable
    density="compact"
    :label="t('job.skills')"
    multiple
    rounded="xl"
    variant="outlined"
  />
  <v-select
    v-model="selectedExperience"
    :items="experienceOptions"
    :label="t('job.filterByExperience')"
    density="compact"
    rounded="xl"
    variant="outlined"
  />
  <v-select
    v-model="selectedWorkType"
    :items="workOptions"
    :label="t('job.workType')"
    chips
    clearable
    density="compact"
    multiple
    rounded="xl"
    variant="outlined"
  />
  <v-select
    v-model="selectedContractType"
    :items="contractOptions"
    :label="t('job.contractType')"
    chips
    clearable
    density="compact"
    multiple
    rounded="xl"
    variant="outlined"
  />
  <v-slider
    v-model="salaryRange"
    :label="`${t('job.salaryRange')}: ${salaryRange}k`"
    class="mb-4"
    :max="200"
    color="primary"
    track-color="primary"
    thumb-label="always"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

type Company = {
  id?: string | number;
  name: string;
};

const props = defineProps<{
  experienceOptions: number[];
  companies: Company[];
}>();

const emit = defineEmits<{
  (e: "create-job"): void;
  (e: "create-applicant"): void;
  (e: "update:experience", value: number | null): void;
  (e: "update:company", value: string): void;
  (e: "update:salaryRange", value: number): void;
  (e: "update:skills", value: string[]): void;
  (e: "update:work", value: string[]): void;
  (e: "update:contract", value: string[]): void;
  (e: "update:search", value: string): void;
  (e: "update:location", value: string): void;
}>();
const { t } = useI18n();

const vuetifyComponentsPromise = import("vuetify/components");

const VCombobox = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VCombobox));

const VSlider = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VSlider));

const selectedExperience = ref<number | null>(null);
const salaryRange = ref(50);
const selectedCompany = ref<string | null>(null);
const selectedSkills = ref<string[]>([]);
const selectedWorkType = ref<string[]>([]);
const selectedContractType = ref<string[]>([]);

const skillsOptions = ["Php", "Symfony", "Vue", "Laravel", "Api", "Html", "Css"];
const workOptions = ["Remote", "Onsite", "Hybrid"];
const contractOptions = ["Fulltime", "Parttime"];

const companyNames = computed(() => props.companies.map((company) => company.name));

const search = ref("");
const selectedLocations = ref("");
watch(search, (value) => emit("update:search", value));
watch(selectedLocations, (value) => emit("update:location", value));
watch(selectedExperience, (value) => emit("update:experience", value));
watch(selectedCompany, (value) => emit("update:company", value ?? ""));
watch(salaryRange, (value) => emit("update:salaryRange", value));
watch(selectedSkills, (value) => emit("update:skills", value), { deep: true });
watch(selectedWorkType, (value) => emit("update:work", value), { deep: true });
watch(selectedContractType, (value) => emit("update:contract", value), { deep: true });
</script>
