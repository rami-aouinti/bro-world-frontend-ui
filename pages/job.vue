<template>
  <main
    class="py-12"
    aria-labelledby="job-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="job-subtitle"
      >
        <h1
          id="job-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ t("pages.job.title") }}
        </h1>
        <p
          id="job-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ t("pages.job.subtitle") }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-features-title"
      >
        <h2
          id="job-features-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.job.featuresTitle") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="feature in featureCards"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100"
            >
              <div class="d-flex align-start mb-4">
                <v-avatar
                  color="primary"
                  size="48"
                  class="mr-4"
                >
                  <v-icon
                    :icon="feature.icon"
                    size="28"
                    color="white"
                    aria-hidden="true"
                  />
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
              <ul class="pl-6 text-body-2 text-medium-emphasis mb-0">
                <li
                  v-for="point in feature.points"
                  :key="point"
                  class="mb-1"
                >
                  {{ point }}
                </li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-openings-title"
      >
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-6">
          <div>
            <h2
              id="job-openings-title"
              class="text-h4 font-weight-semibold mb-2"
            >
              {{ t("pages.job.openings.title") }}
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-0" style="max-width: 640px">
              {{ t("pages.job.openings.subtitle") }}
            </p>
          </div>
          <v-chip
            color="primary"
            variant="tonal"
            class="align-self-start"
            :aria-label="t('pages.job.openings.updatedLabel')"
          >
            <v-icon
              icon="mdi:update"
              size="18"
              class="mr-2"
              aria-hidden="true"
            />
            {{ t("pages.job.openings.updated") }}
          </v-chip>
        </div>

        <v-row dense>
          <v-col
            v-for="job in jobOpenings"
            :key="job.id"
            cols="12"
            md="6"
          >
            <v-card
              class="h-100 pa-6 d-flex flex-column"
              variant="outlined"
              :aria-labelledby="`job-card-${job.id}`"
            >
              <div class="d-flex flex-column gap-2 mb-4">
                <div>
                  <p class="text-caption text-uppercase text-medium-emphasis mb-1">
                    {{ job.department }}
                  </p>
                  <h3
                    :id="`job-card-${job.id}`"
                    class="text-subtitle-1 font-weight-semibold mb-2"
                  >
                    {{ job.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ job.description }}
                  </p>
                </div>

                <div class="d-flex flex-wrap gap-3 text-body-2 text-medium-emphasis">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi:map-marker-outline" size="18" class="mr-1" aria-hidden="true" />
                    <span>{{ job.location }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi:briefcase-outline" size="18" class="mr-1" aria-hidden="true" />
                    <span>{{ job.type }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi:cash-multiple" size="18" class="mr-1" aria-hidden="true" />
                    <span>{{ job.salary }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip
                  v-for="tag in job.tags"
                  :key="tag"
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="text-body-3"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <v-spacer />

              <div class="d-flex align-center justify-space-between pt-4 mt-auto">
                <span class="text-body-2 text-medium-emphasis">
                  {{ job.applyHint }}
                </span>
                <v-btn
                  :href="job.applyLink"
                  color="primary"
                  variant="flat"
                  size="small"
                  :aria-label="job.applyAria"
                >
                  {{ job.applyLabel }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-workflow-title"
      >
        <h2
          id="job-workflow-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.job.workflowTitle") }}
        </h2>
        <ol class="d-flex flex-column gap-4 list-none pa-0">
          <li
            v-for="(step, index) in workflowSteps"
            :key="step.title"
          >
            <v-sheet
              class="pa-6 rounded-lg d-flex align-start"
              color="surface-variant"
              variant="tonal"
            >
              <div
                class="d-flex align-center justify-center rounded-circle mr-4"
                style="width: 40px; height: 40px"
                :aria-label="t('pages.job.stepLabel', { number: index + 1 })"
              >
                <span class="text-subtitle-1 font-weight-semibold">{{ index + 1 }}</span>
              </div>
              <div>
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ step.description }}
                </p>
              </div>
            </v-sheet>
          </li>
        </ol>
      </section>

      <section
        class="mb-12"
        aria-labelledby="job-application-title"
      >
        <v-row class="align-stretch" dense>
          <v-col cols="12" md="5">
            <div class="pr-md-6 mb-6 mb-md-0">
              <h2
                id="job-application-title"
                class="text-h4 font-weight-semibold mb-4"
              >
                {{ t("pages.job.application.title") }}
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-6">
                {{ t("pages.job.application.subtitle") }}
              </p>
              <ul class="pl-6 text-body-2 text-medium-emphasis mb-0 d-flex flex-column gap-3">
                <li v-for="highlight in applicationHighlights" :key="highlight" class="d-flex align-start">
                  <v-icon icon="mdi:check-circle-outline" size="20" class="mr-3 mt-1" color="primary" aria-hidden="true" />
                  <span>{{ highlight }}</span>
                </li>
              </ul>
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <v-card class="pa-6" variant="tonal">
              <v-alert
                v-if="formSuccess"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                :text="t('pages.job.application.form.success')"
                density="comfortable"
              />
              <v-form ref="formRef" @submit.prevent="submitApplication">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.name"
                      :label="t('pages.job.application.form.nameLabel')"
                      :placeholder="t('pages.job.application.form.namePlaceholder')"
                      :rules="[requiredRule]"
                      autocomplete="name"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.email"
                      :label="t('pages.job.application.form.emailLabel')"
                      :placeholder="t('pages.job.application.form.emailPlaceholder')"
                      :rules="[requiredRule, emailRule]"
                      type="email"
                      autocomplete="email"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.role"
                      :label="t('pages.job.application.form.roleLabel')"
                      :placeholder="t('pages.job.application.form.rolePlaceholder')"
                      :rules="[requiredRule]"
                      autocomplete="organization-title"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.message"
                      :label="t('pages.job.application.form.messageLabel')"
                      :placeholder="t('pages.job.application.form.messagePlaceholder')"
                      :rows="4"
                      :auto-grow="false"
                      :rules="[requiredRule]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="formData.consent"
                      :label="t('pages.job.application.form.consentLabel')"
                      :rules="[consentRule]"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" class="d-flex justify-end">
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      type="submit"
                      :loading="formSubmitting"
                    >
                      {{ t("pages.job.application.form.submit") }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section aria-labelledby="job-resources-title">
        <v-card
          class="pa-8"
          color="primary"
          variant="flat"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
              <h2
                id="job-resources-title"
                class="text-h4 font-weight-semibold text-white mb-2"
              >
                {{ t("pages.job.cta.title") }}
              </h2>
              <p
                class="text-body-1 text-white text-opacity-80 mb-0"
                style="max-width: 520px"
              >
                {{ t("pages.job.cta.description") }}
              </p>
            </div>
            <v-btn
              :to="contactLink"
              color="white"
              variant="flat"
              size="large"
              class="text-primary"
              :aria-label="t('pages.job.cta.buttonAria')"
            >
              {{ t("pages.job.cta.button") }}
            </v-btn>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import type { VForm } from "vuetify/components";

const { t, locale, localeProperties } = useI18n();
const pageDescription = computed(() => t("seo.job.description"));

definePageMeta({
  documentDriven: false,
});

useSeoMeta(() => ({
  description: pageDescription.value,
}));
const runtimeConfig = useRuntimeConfig();
const localePath = useResolvedLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.job.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const contactLink = computed(() => localePath("/contact"));

const featureCards = computed(() => [
  {
    icon: "mdi:briefcase-search-outline",
    title: t("pages.job.features.matching.title"),
    description: t("pages.job.features.matching.description"),
    points: [
      t("pages.job.features.matching.points.0"),
      t("pages.job.features.matching.points.1"),
      t("pages.job.features.matching.points.2"),
    ],
  },
  {
    icon: "mdi:robot-happy-outline",
    title: t("pages.job.features.automation.title"),
    description: t("pages.job.features.automation.description"),
    points: [
      t("pages.job.features.automation.points.0"),
      t("pages.job.features.automation.points.1"),
      t("pages.job.features.automation.points.2"),
    ],
  },
  {
    icon: "mdi:chart-line-variant",
    title: t("pages.job.features.insights.title"),
    description: t("pages.job.features.insights.description"),
    points: [
      t("pages.job.features.insights.points.0"),
      t("pages.job.features.insights.points.1"),
      t("pages.job.features.insights.points.2"),
    ],
  },
]);

const workflowSteps = computed(() => [
  {
    title: t("pages.job.workflow.steps.publish.title"),
    description: t("pages.job.workflow.steps.publish.description"),
  },
  {
    title: t("pages.job.workflow.steps.review.title"),
    description: t("pages.job.workflow.steps.review.description"),
  },
  {
    title: t("pages.job.workflow.steps.hire.title"),
    description: t("pages.job.workflow.steps.hire.description"),
  },
]);

const jobOpenings = computed(() => [
  {
    id: "product-designer",
    title: t("pages.job.openings.items.productDesigner.title"),
    department: t("pages.job.openings.items.productDesigner.department"),
    location: t("pages.job.openings.items.productDesigner.location"),
    type: t("pages.job.openings.items.productDesigner.type"),
    salary: t("pages.job.openings.items.productDesigner.salary"),
    description: t("pages.job.openings.items.productDesigner.description"),
    tags: [
      t("pages.job.openings.items.productDesigner.tags.0"),
      t("pages.job.openings.items.productDesigner.tags.1"),
      t("pages.job.openings.items.productDesigner.tags.2"),
    ],
    applyLabel: t("pages.job.openings.items.productDesigner.apply.label"),
    applyAria: t("pages.job.openings.items.productDesigner.apply.aria"),
    applyHint: t("pages.job.openings.items.productDesigner.apply.hint"),
    applyLink: contactLink.value,
  },
  {
    id: "ai-recruiter",
    title: t("pages.job.openings.items.aiRecruiter.title"),
    department: t("pages.job.openings.items.aiRecruiter.department"),
    location: t("pages.job.openings.items.aiRecruiter.location"),
    type: t("pages.job.openings.items.aiRecruiter.type"),
    salary: t("pages.job.openings.items.aiRecruiter.salary"),
    description: t("pages.job.openings.items.aiRecruiter.description"),
    tags: [
      t("pages.job.openings.items.aiRecruiter.tags.0"),
      t("pages.job.openings.items.aiRecruiter.tags.1"),
      t("pages.job.openings.items.aiRecruiter.tags.2"),
    ],
    applyLabel: t("pages.job.openings.items.aiRecruiter.apply.label"),
    applyAria: t("pages.job.openings.items.aiRecruiter.apply.aria"),
    applyHint: t("pages.job.openings.items.aiRecruiter.apply.hint"),
    applyLink: contactLink.value,
  },
  {
    id: "sales-lead",
    title: t("pages.job.openings.items.salesLead.title"),
    department: t("pages.job.openings.items.salesLead.department"),
    location: t("pages.job.openings.items.salesLead.location"),
    type: t("pages.job.openings.items.salesLead.type"),
    salary: t("pages.job.openings.items.salesLead.salary"),
    description: t("pages.job.openings.items.salesLead.description"),
    tags: [
      t("pages.job.openings.items.salesLead.tags.0"),
      t("pages.job.openings.items.salesLead.tags.1"),
      t("pages.job.openings.items.salesLead.tags.2"),
    ],
    applyLabel: t("pages.job.openings.items.salesLead.apply.label"),
    applyAria: t("pages.job.openings.items.salesLead.apply.aria"),
    applyHint: t("pages.job.openings.items.salesLead.apply.hint"),
    applyLink: contactLink.value,
  },
  {
    id: "customer-success",
    title: t("pages.job.openings.items.customerSuccess.title"),
    department: t("pages.job.openings.items.customerSuccess.department"),
    location: t("pages.job.openings.items.customerSuccess.location"),
    type: t("pages.job.openings.items.customerSuccess.type"),
    salary: t("pages.job.openings.items.customerSuccess.salary"),
    description: t("pages.job.openings.items.customerSuccess.description"),
    tags: [
      t("pages.job.openings.items.customerSuccess.tags.0"),
      t("pages.job.openings.items.customerSuccess.tags.1"),
      t("pages.job.openings.items.customerSuccess.tags.2"),
    ],
    applyLabel: t("pages.job.openings.items.customerSuccess.apply.label"),
    applyAria: t("pages.job.openings.items.customerSuccess.apply.aria"),
    applyHint: t("pages.job.openings.items.customerSuccess.apply.hint"),
    applyLink: contactLink.value,
  },
]);

const applicationHighlights = computed(() => [
  t("pages.job.application.highlights.0"),
  t("pages.job.application.highlights.1"),
  t("pages.job.application.highlights.2"),
]);

const formRef = ref<VForm | null>(null);
const formData = reactive({
  name: "",
  email: "",
  role: "",
  message: "",
  consent: false,
});

const formSubmitting = ref(false);
const formSuccess = ref(false);

function requiredRule(value: string | boolean) {
  if (typeof value === "boolean") {
    return value || t("pages.job.application.form.rules.consent");
  }

  return (value && value.toString().trim().length > 0) || t("pages.job.application.form.rules.required");
}

function emailRule(value: string) {
  if (!value || !value.toString().trim().length) {
    return t("pages.job.application.form.rules.required");
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) || t("pages.job.application.form.rules.email");
}

function consentRule(value: boolean) {
  return value || t("pages.job.application.form.rules.consent");
}

function resetForm() {
  formData.name = "";
  formData.email = "";
  formData.role = "";
  formData.message = "";
  formData.consent = false;
}

async function submitApplication() {
  if (!formRef.value) {
    return;
  }

  const result = await formRef.value.validate();

  if (!result.valid) {
    return;
  }

  formSubmitting.value = true;
  formSuccess.value = false;

  await new Promise((resolve) => setTimeout(resolve, 600));

  formSubmitting.value = false;
  formSuccess.value = true;
  resetForm();
  formRef.value.resetValidation();
}
</script>
