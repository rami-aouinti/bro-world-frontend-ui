<template>
  <NuxtLayout name="default">
    <template #left-sidebar>
      <SidebarCard
        class="text-card-foreground px-3 py-2"
        glow
      >
        <v-list
          nav
          density="compact"
          class="creation-nav"
        >
          <v-list-item
            v-for="item in creationOptions"
            :key="item.key"
            :active="activeCreation === item.key"
            :title="item.label"
            rounded="xl"
            class="creation-nav__item"
            @click="selectCreation(item.key)"
          >
            <template #prepend>
              <v-icon :icon="item.icon" />
            </template>
          </v-list-item>
        </v-list>
      </SidebarCard>
    </template>

    <template #right-sidebar>
      <SidebarCard
        class="text-card-foreground px-3 py-2"
        glow
      >
        <JobFilters
          :experience-options="[0.5, 1, 2, 3, 5, 10]"
          :companies="companies"
          @update:experience="selectedExperience = $event"
          @update:company="selectedCompany = $event"
          @update:salary-range="salaryRange = $event"
          @update:skills="selectedSkills = $event"
          @update:work="selectedWork = $event"
          @update:contract="selectedContract = $event"
        />
      </SidebarCard>
    </template>

    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <JobTopFilters
            @update:search="search = $event"
            @update:location="selectedLocations = $event"
          />

          <div v-if="pending">
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
        </v-col>
      </v-row>

      <div
        v-if="activeCreation !== 'none'"
        ref="creationSectionRef"
        class="mt-6"
      >
        <CreateJob
          v-if="activeCreation === 'job'"
          @job-created="refreshJobs"
        />

        <div v-else>
          <div
            v-if="selectedJob"
            class="mb-4 flex items-center gap-2"
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
      </div>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";
import CreateApplicant from "~/components/job/CreateApplicant.vue";
import CreateJob from "~/components/job/CreateJob.vue";
import JobFilters from "~/components/job/JobFilters.vue";
import JobList from "~/components/job/JobList.vue";
import JobTopFilters from "~/components/job/JobTopFilters.vue";
import { jobCompaniesSample, jobListSample } from "~/lib/mock/jobs";
import { useJobStore, type JobSummary } from "~/stores/useJobStore";

definePageMeta({
  layout: false,
  description: "Job page",
  breadcrumb: "disabled",
  requiresPlugin: "job-board",
});

type CompanyInfo = {
  id?: string | number;
  name: string;
};

type CompaniesResponse = CompanyInfo[] | { data: CompanyInfo[] };

type JobsResponse = {
  data?: JobSummary[];
  count?: number;
  page?: number;
};

const jobStore = useJobStore();
const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();

type CreationSection = "job" | "applicant" | "none";

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

const companies = ref<CompanyInfo[]>([]);

const creationOptions = computed(() => [
  {
    key: "job" as const,
    label: t("job.create"),
    icon: "mdi-briefcase-plus",
  },
  {
    key: "applicant" as const,
    label: t("applicant.create"),
    icon: "mdi-account-plus",
  },
]);

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
  pending.value = false;
}

function onApplicantCreated() {
  notify.success(t("applicant.createdSuccess"));
  selectedJobId.value = null;
  selectCreation("none");
}
</script>

<style scoped>
.creation-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.creation-nav__item {
  border-radius: 16px;
}
</style>
