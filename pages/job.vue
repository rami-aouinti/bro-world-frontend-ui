<template>
  <main aria-labelledby="job-heading">
    <v-container fluid>
      <header class="mb-6">
        <h1
          id="job-heading"
          class="text-h4 font-weight-bold mb-0"
        >
          {{ t("job.search") }}
        </h1>
      </header>

      <section class="mb-6">
        <JobCreateButtons
          @create-job="selectCreation('job')"
          @create-applicant="selectCreation('applicant')"
        />
      </section>

      <section>
        <JobTopFilters
          @update:search="search = $event"
          @update:location="selectedLocations = $event"
        />

        <div
          v-if="pending"
          class="mt-4"
        >
          <v-row>
            <v-col
              v-for="n in 6"
              :key="n"
              cols="12"
            >
              <v-skeleton-loader
                class="pa-4 rounded-xl"
                height="200"
                rounded="xl"
                type="card"
              />
            </v-col>
          </v-row>
        </div>

        <JobList
          v-else
          :filtered="jobStore.loaded"
          :jobs="jobStore.jobs"
          @apply="openApplyModal"
        />

        <v-pagination
          v-model="currentPage"
          class="mt-4"
          color="primary"
          rounded="circle"
          :length="totalPages"
        />
      </section>

      <section
        v-if="activeCreation !== 'none'"
        ref="creationSectionRef"
        class="mt-8"
        aria-labelledby="job-create-heading"
      >
        <SidebarCard
          class="text-card-foreground px-3 py-4"
          glow
        >
          <h2
            id="job-create-heading"
            class="text-h5 font-weight-semibold mb-4"
          >
            {{ activeCreation === "job" ? t("job.create") : t("applicant.create") }}
          </h2>

          <CreateJob
            v-if="activeCreation === 'job'"
            @job-created="refreshJobs"
          />

          <div v-else>
            <div
              v-if="selectedJob"
              class="mb-4 d-flex align-center gap-2"
            >
              <v-chip
                color="primary"
                variant="tonal"
                class="font-medium"
              >
                {{ selectedJob.title }}
              </v-chip>
            </div>

            <CreateApplicant
              :selected-job-id="selectedJobId"
              @applicant-created="onApplicantCreated"
              @cancel="selectCreation('none')"
            />
          </div>
        </SidebarCard>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";

import CreateApplicant from "~/components/job/CreateApplicant.vue";
import CreateJob from "~/components/job/CreateJob.vue";
import JobCreateButtons from "~/components/job/JobCreateButtons.vue";
import JobList from "~/components/job/JobList.vue";
import JobTopFilters from "~/components/job/JobTopFilters.vue";
import JobSidebarFilters, { type JobCompany } from "~/components/job/JobSidebarFilters.vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { jobCompaniesSample, jobListSample } from "~/lib/mock/jobs";
import { useJobStore, type JobSummary } from "~/stores/useJobStore";

definePageMeta({
  description: "Job page",
  breadcrumb: "disabled",
  requiresPlugin: "job-board",
  showRightWidgets: true,
});

const jobStore = useJobStore();
const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();
const { registerRightSidebarContent } = useLayoutRightSidebar();

type CompaniesResponse = JobCompany[] | { data: JobCompany[] };

type JobsResponse = {
  data?: JobSummary[];
  count?: number;
  page?: number;
};

type CreationSection = "job" | "applicant" | "none";

const experienceOptions = [0.5, 1, 2, 3, 5, 10];

const pending = ref(false);
const search = ref("");
const selectedCompany = ref("");
const selectedExperience = ref<number | null>(null);
const salaryRange = ref<number>(50);
const selectedSkills = ref<string[]>([]);
const selectedWork = ref<string[]>([]);
const selectedContract = ref<string[]>([]);
const selectedLocations = ref("");
const currentPage = ref(1);
const limit = 5;
const totalPages = ref(1);

const activeCreation = ref<CreationSection>("none");
const selectedJobId = ref<string | null>(null);
const creationSectionRef = ref<HTMLElement | null>(null);

const companies = ref<JobCompany[]>([]);

const selectedJob = computed(
  () => jobStore.jobs.find((job) => job.id === selectedJobId.value) ?? null,
);

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

function normaliseCompanies(result: CompaniesResponse) {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && Array.isArray(result.data)) {
    return result.data;
  }

  return [];
}

async function fetchCompanies() {
  try {
    const result = await $fetch<CompaniesResponse>("/api/job/companies");
    companies.value = normaliseCompanies(result);
  } catch (error) {
    console.error(error);
    companies.value = jobCompaniesSample;
  }
}

async function fetchJobs() {
  pending.value = true;
  jobStore.setLoaded(false);
  const query = new URLSearchParams();

  if (search.value) query.set("title", search.value);
  if (selectedCompany.value) query.set("company", selectedCompany.value);
  if (selectedExperience.value) {
    query.set("experience", selectedExperience.value.toString());
  }
  if (selectedSkills.value.length) {
    selectedSkills.value.forEach((skill) => query.append("skills[]", skill));
  }
  if (selectedWork.value.length) {
    selectedWork.value.forEach((work) => query.append("works[]", work));
  }
  if (selectedContract.value.length) {
    selectedContract.value.forEach((contract) => query.append("contracts[]", contract));
  }
  if (selectedLocations.value.length) {
    query.set("location", selectedLocations.value);
  }

  query.set("salaryMin", (salaryRange.value * 1000).toString());
  query.set("page", currentPage.value.toString());
  query.set("limit", limit.toString());

  try {
    const response = await $fetch<JobsResponse>(`/api/job/jobs?${query.toString()}`);
    const jobs = Array.isArray(response?.data) ? response.data : [];

    jobStore.setJobs(jobs);
    jobStore.setTotal(response?.count ?? 0);
    jobStore.setPage(response?.page ?? 1);
    jobStore.setLoaded(true);
    totalPages.value = Math.max(1, Math.ceil((response?.count ?? 0) / limit));
  } catch (error) {
    console.error(error);
    jobStore.setJobs(jobListSample);
    jobStore.setTotal(jobListSample.length);
    jobStore.setPage(1);
    jobStore.setLoaded(true);
    totalPages.value = 1;
  } finally {
    pending.value = false;
  }
}

function handleExperienceChange(value: number | null) {
  selectedExperience.value = value;
}

function handleCompanyChange(value: string) {
  selectedCompany.value = value;
}

function handleSalaryRangeChange(value: number) {
  salaryRange.value = value;
}

function handleSkillsChange(value: string[]) {
  selectedSkills.value = value;
}

function handleWorkChange(value: string[]) {
  selectedWork.value = value;
}

function handleContractChange(value: string[]) {
  selectedContract.value = value;
}

registerRightSidebarContent(
  computed(() => ({
    component: JobSidebarFilters,
    wrapperClass: "flex flex-col gap-6",
    props: {
      experienceOptions,
      companies: companies.value,
      onExperienceChange: handleExperienceChange,
      onCompanyChange: handleCompanyChange,
      onSalaryRangeChange: handleSalaryRangeChange,
      onSkillsChange: handleSkillsChange,
      onWorkChange: handleWorkChange,
      onContractChange: handleContractChange,
    },
  })),
);

watch(
  [
    search,
    selectedCompany,
    selectedExperience,
    salaryRange,
    selectedSkills,
    selectedWork,
    selectedContract,
    selectedLocations,
    currentPage,
  ],
  () => {
    void fetchJobs();
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  void fetchCompanies();
});

function openApplyModal(jobId: string) {
  selectedJobId.value = jobId;
  activeCreation.value = "applicant";
  void nextTick(() => {
    creationSectionRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

async function refreshJobs() {
  pending.value = true;
  await fetchJobs();
  notify.success(t("job.createdSuccess"));
  activeCreation.value = "none";
  pending.value = false;
}

function onApplicantCreated() {
  notify.success(t("applicant.createdSuccess"));
  selectedJobId.value = null;
  selectCreation("none");
}
</script>

<style scoped>
@reference "../assets/css/tailwind.css";

section + section {
  margin-top: 2rem;
}
</style>
