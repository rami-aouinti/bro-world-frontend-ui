<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ t("job.create") }}</v-card-title>
      <v-card-text>
        <v-stepper v-model="step" elevation="0">
          <v-stepper-header>
            <v-stepper-item :title="t('company.title')" :value="1" />
            <v-stepper-item :title="t('job.details')" :value="2" />
            <v-stepper-item :title="t('job.requirements')" :value="3" />
            <v-stepper-item :title="t('job.additional')" :value="4" />
            <v-stepper-item :title="t('job.others')" :value="5" />
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item :value="1">
              <v-row
                v-if="companies.length"
                class="align-center mb-4"
              >
                <v-col cols="5">
                  <v-select
                    v-model="jobForm.companyId"
                    :items="companies"
                    density="compact"
                    item-title="name"
                    item-value="id"
                    :label="t('job.company')"
                    rounded="xl"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="text-center"
                >
                  <div class="text-subtitle-1 font-weight-medium">OR</div>
                </v-col>
                <v-col cols="5">
                  <v-btn
                    block
                    color="primary"
                    variant="outlined"
                    @click="toggleCreateCompany"
                  >
                    {{ t("company.create") }}
                  </v-btn>
                </v-col>
              </v-row>

              <CreateCompany
                v-if="showCreateCompany || !companies.length"
                @company-created="onCompanyCreated"
              />

              <v-row class="d-flex align-center text-center mt-4 mb-2 mx-2">
                <v-btn
                  class="mt-4"
                  color="primary"
                  :disabled="!jobForm.companyId"
                  @click="nextStep"
                >
                  {{ t("buttons.continue") }}
                </v-btn>
              </v-row>
            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <v-row class="py-2">
                <v-col cols="12">
                  <v-text-field
                    v-model="jobForm.title"
                    :label="t('job.title')"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="jobForm.description"
                    :label="t('job.description')"
                    auto-grow
                    class="mb-2"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="jobForm.work"
                    :label="t('job.work')"
                    auto-grow
                    class="mb-2"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-between mt-4 mb-2 mx-2">
                <v-btn variant="text" @click="prevStep">
                  {{ t("buttons.back") }}
                </v-btn>
                <v-btn
                  color="primary"
                  :disabled="!jobForm.title"
                  @click="nextStep"
                >
                  {{ t("buttons.continue") }}
                </v-btn>
              </v-row>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <v-row class="py-2">
                <v-col cols="12" md="4">
                  <v-select
                    v-model="jobForm.requiredSkills"
                    :items="['Php', 'Symfony', 'Html', 'Css', 'Laravel']"
                    :label="t('job.skills')"
                    chips
                    density="compact"
                    multiple
                    rounded="xl"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="jobForm.requirements"
                    :items="['Symfony', 'Backend', 'Node']"
                    :label="t('job.requirements')"
                    chips
                    density="compact"
                    multiple
                    rounded="xl"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="jobForm.experience"
                    :items="experienceOptions"
                    item-title="label"
                    item-value="value"
                    :label="t('job.experience')"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div class="text-grey-darken-1">
                    {{ t('job.salaryRange') }}: {{ salaryRangeRange[0] }} € - {{ salaryRangeRange[1] }} €
                  </div>
                  <v-range-slider
                    v-model="salaryRangeRange"
                    :min="15000"
                    :max="150000"
                    class="mt-6"
                    step="5000"
                    thumb-label="always"
                  />
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-between mt-4 mb-2 mx-2">
                <v-btn variant="text" @click="prevStep">
                  {{ t("buttons.back") }}
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  {{ t("buttons.continue") }}
                </v-btn>
              </v-row>
            </v-stepper-window-item>

            <v-stepper-window-item :value="4">
              <v-row class="py-2">
                <v-col cols="12" md="4">
                  <v-select
                    v-model="jobForm.workType"
                    :items="['Remote', 'Onsite', 'Hybrid']"
                    :label="t('job.workType')"
                    chips
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="jobForm.contractType"
                    :items="['Fulltime', 'Parttime']"
                    :label="t('job.contractType')"
                    chips
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="jobForm.workLocation"
                    :label="t('job.location')"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div
                    v-for="(lang, index) in jobForm.languages"
                    :key="index"
                    class="d-flex align-center gap-4 mb-3"
                  >
                    <v-row>
                      <v-col cols="12" md="5">
                        <v-select
                          v-model="lang.name"
                          :items="availableLanguages"
                          class="flex-grow-1"
                          density="compact"
                          item-title="name"
                          item-value="name"
                          label="Language"
                          rounded="xl"
                        />
                      </v-col>
                      <v-col cols="12" md="5">
                        <v-select
                          v-model="lang.level"
                          :items="['basic', 'intermediate', 'fluent', 'native']"
                          class="flex-grow-1"
                          density="compact"
                          label="Level"
                          rounded="xl"
                        />
                      </v-col>
                      <v-col cols="12" md="2">
                        <v-btn
                          icon
                          variant="text"
                          @click="jobForm.languages.splice(index, 1)"
                        >
                          <v-icon color="primary">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>

                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="text"
                    @click="addLanguage"
                  >
                    {{ t("job.addLanguage") }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-between mt-4 mb-2 mx-2">
                <v-btn variant="text" @click="prevStep">
                  {{ t("buttons.back") }}
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  {{ t("buttons.continue") }}
                </v-btn>
              </v-row>
            </v-stepper-window-item>

            <v-stepper-window-item :value="5">
              <v-row class="py-2">
                <v-col cols="12">
                  <v-textarea
                    v-model="jobForm.benefits"
                    :label="t('job.benefits')"
                    auto-grow
                    class="mb-2"
                    density="compact"
                    rounded="xl"
                  />
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-between mt-4 mb-2 mx-2">
                <v-btn variant="text" @click="prevStep">
                  {{ t("buttons.back") }}
                </v-btn>
                <v-btn color="primary" @click="submitJob">
                  {{ t("job.submit") }}
                </v-btn>
              </v-row>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useNuxtApp } from "#app"
import CreateCompany from "~/components/job/CreateCompany.vue"

type Language = {
  name: string
  level: string
}

type JobForm = {
  companyId: string
  title: string
  description: string
  requiredSkills: string[]
  workType: string
  contractType: string
  requirements: string[]
  benefits: string
  experience: string
  salaryRange: string
  work: string
  workLocation: string
  languages: Language[]
}

type Company = {
  id: string
  name: string
}

type CompaniesResponse = Company[] | { data: Company[] }

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [value: boolean]; "job-created": [] }>()

const { t } = useI18n()
const { $notify: notify, $fetch } = useNuxtApp()

const step = ref(1)
const showCreateCompany = ref(false)
const companies = ref<Company[]>([])

function createDefaultJobForm(): JobForm {
  return {
    companyId: "",
    title: "",
    description: "",
    requiredSkills: [],
    workType: "Remote",
    contractType: "Fulltime",
    requirements: [],
    benefits: "",
    experience: "",
    salaryRange: "",
    work: "",
    workLocation: "",
    languages: [],
  }
}

const jobForm = ref<JobForm>(createDefaultJobForm())

const experienceOptions = [
  { label: "6 months", value: "0.5" },
  { label: "1 year", value: "1" },
  { label: "2 years", value: "2" },
  { label: "3 years", value: "3" },
  { label: "5 years+", value: "5+" },
  { label: "10 years+", value: "10+" },
]

const availableLanguages = [
  { name: "English" },
  { name: "Français" },
  { name: "Deutsch" },
  { name: "العربية" },
  { name: "Español" },
  { name: "Português" },
  { name: "Italiano" },
  { name: "中文" },
  { name: "日本語" },
  { name: "Русский" },
]

const salaryRangeRange = ref<[number, number]>([30000, 90000])

watch(salaryRangeRange, (range) => {
  jobForm.value.salaryRange = `${range[0]} - ${range[1]}`
})

function toggleCreateCompany() {
  showCreateCompany.value = !showCreateCompany.value
}

function nextStep() {
  if (step.value < 5) {
    step.value += 1
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value -= 1
  }
}

function addLanguage() {
  jobForm.value.languages.push({ name: "", level: "" })
}

function normaliseCompanies(result: CompaniesResponse) {
  if (Array.isArray(result)) {
    return result
  }

  if (result && Array.isArray(result.data)) {
    return result.data
  }

  return []
}

async function fetchCompanies() {
  try {
    const response = await $fetch<CompaniesResponse>("/api/job/companies")
    companies.value = normaliseCompanies(response)
  } catch (error) {
    console.error(error)
  }
}

function onCompanyCreated() {
  fetchCompanies()
  showCreateCompany.value = false
}

async function submitJob() {
  try {
    await $fetch("/api/job/job", {
      method: "POST",
      body: jobForm.value,
    })
  } catch (error) {
    console.error(error)
    notify.error(t("job.createError"))
    return
  }

  notify.success(t("job.createdSuccess"))
  emit("job-created")
  emit("update:modelValue", false)
  step.value = 1
  jobForm.value = createDefaultJobForm()
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      void fetchCompanies()
    }
  },
)

onMounted(() => {
  void fetchCompanies()
})
</script>
