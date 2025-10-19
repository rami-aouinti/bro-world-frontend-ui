<template>
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
import { computed, ref, watch } from "vue";
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
  (e: "update:experience", value: number | null): void;
  (e: "update:company", value: string): void;
  (e: "update:salaryRange", value: number): void;
  (e: "update:skills", value: string[]): void;
  (e: "update:work", value: string[]): void;
  (e: "update:contract", value: string[]): void;
}>();

const { t } = useI18n();

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

watch(selectedExperience, (value) => emit("update:experience", value));
watch(selectedCompany, (value) => emit("update:company", value ?? ""));
watch(salaryRange, (value) => emit("update:salaryRange", value));
watch(selectedSkills, (value) => emit("update:skills", value), { deep: true });
watch(selectedWorkType, (value) => emit("update:work", value), { deep: true });
watch(selectedContractType, (value) => emit("update:contract", value), { deep: true });
</script>
