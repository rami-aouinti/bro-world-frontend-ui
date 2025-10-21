<template>

  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <JobFilters
      :experience-options="experienceOptions"
      :companies="companies"
      @create-job="selectCreation('job')"
      @create-applicant="selectCreation('applicant')"
      @update:experience="handleExperienceChange"
      @update:company="handleCompanyChange"
      @update:salary-range="handleSalaryRangeChange"
      @update:skills="handleSkillsChange"
      @update:work="handleWorkChange"
      @update:contract="handleContractChange"
      @update:search="search = $event"
      @update:location="selectedLocations = $event"
    />
  </SidebarCard>
</template>

<script setup lang="ts">
import JobFilters from "~/components/job/JobFilters.vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import JobTopFilters from "~/components/job/JobTopFilters.vue";
import JobCreateButtons from "~/components/job/JobCreateButtons.vue";

export interface JobCompany {
  id?: string | number;
  name: string;
}
type CreationSection = "job" | "applicant" | "none";
const activeCreation = ref<CreationSection>("none");

const props = withDefaults(
  defineProps<{
    experienceOptions: number[];
    companies: JobCompany[];
    onExperienceChange?: (value: number | null) => void;
    onCompanyChange?: (value: string) => void;
    onSalaryRangeChange?: (value: number) => void;
    onSkillsChange?: (value: string[]) => void;
    onWorkChange?: (value: string[]) => void;
    onContractChange?: (value: string[]) => void;
  }>(),
  {
    onExperienceChange: undefined,
    onCompanyChange: undefined,
    onSalaryRangeChange: undefined,
    onSkillsChange: undefined,
    onWorkChange: undefined,
    onContractChange: undefined,
  },
);
const search = ref("");
const selectedLocations = ref("");
const selectedJobId = ref<string | null>(null);
const creationSectionRef = ref<HTMLElement | null>(null);
function selectCreation(section: CreationSection) {
  const isSameSection = section === activeCreation.value;
  const nextSection = isSameSection && section !== "none" ? "none" : section;

  activeCreation.value = nextSection;

  if (nextSection !== "applicant") {
    selectedJobId.value = null;
  }

  if (nextSection !== "none") {
    void nextTick(() => {
      creationSectionRef.value?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}

function handleExperienceChange(value: number | null) {
  props.onExperienceChange?.(value);
}

function handleCompanyChange(value: string) {
  props.onCompanyChange?.(value);
}

function handleSalaryRangeChange(value: number) {
  props.onSalaryRangeChange?.(value);
}

function handleSkillsChange(value: string[]) {
  props.onSkillsChange?.(value);
}

function handleWorkChange(value: string[]) {
  props.onWorkChange?.(value);
}

function handleContractChange(value: string[]) {
  props.onContractChange?.(value);
}
</script>
