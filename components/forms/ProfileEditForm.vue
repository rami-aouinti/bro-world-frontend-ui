<template>
    <header
      class="mb-6"
      aria-describedby="profile-edit-subtitle"
    >
      <SidebarCard
        class="text-card-foreground px-3 py-2"
        padding="none"
        glow
      >
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
          <div>
            <h1
              id="profile-edit-title"
              class="text-h4 font-weight-bold mb-2"
            >
              {{ t("pages.profileEdit.title") }}
            </h1>
            <p
              id="profile-edit-subtitle"
              class="text-body-1 text-medium-emphasis mb-0"
            >
              {{ t("pages.profileEdit.subtitle") }}
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              variant="outlined"
              color="primary"
              @click="resetForm"
            >
              {{ t("pages.profileEdit.actions.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              :loading="isProfileSaving"
              @click="submitForm"
            >
              {{ t("pages.profileEdit.actions.save") }}
            </v-btn>
          </div>
        </div>
      </SidebarCard>
    </header>

    <v-alert
      v-if="formErrors.length"
      type="error"
      variant="tonal"
      class="mb-6"
      border="start"
      border-color="error"
    >
      <ul class="pl-6 mb-0 d-flex flex-column gap-2">
        <li
          v-for="error in formErrors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
    </v-alert>

    <v-row
      dense
      align="stretch"
    >
      <v-col
        cols="12"
        xl="8"
      >
        <section
          class="mb-8"
          aria-labelledby="profile-core-section"
        >
          <SidebarCard
            class="text-card-foreground px-3 py-2"
            padding="none"
            glow
          >
            <h2
              id="profile-core-section"
              class="text-h5 font-weight-semibold mb-4"
            >
              {{ t("pages.profileEdit.sections.profile.title") }}
            </h2>
            <div class="d-flex flex-column gap-4">
              <div class="d-flex flex-column flex-sm-row gap-4">
                <v-text-field
                  v-model="form.firstName"
                  :label="t('pages.profileEdit.labels.firstName')"
                  :error-messages="fieldError('firstName')"
                  variant="outlined"
                  density="comfortable"
                  required
                />
                <v-text-field
                  v-model="form.lastName"
                  :label="t('pages.profileEdit.labels.lastName')"
                  :error-messages="fieldError('lastName')"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </div>
              <v-text-field
                v-model="form.headline"
                :label="t('pages.profileEdit.labels.headline')"
                variant="outlined"
                density="comfortable"
                :error-messages="fieldError('headline')"
              />
              <div class="d-flex flex-column flex-sm-row gap-4">
                <v-select
                  v-model="form.pronouns"
                  :items="pronounOptions"
                  :label="t('pages.profileEdit.labels.pronouns')"
                  variant="outlined"
                  density="comfortable"
                />
                <v-select
                  v-model="form.language"
                  :items="languageOptions"
                  :label="t('pages.profileEdit.labels.language')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="fieldError('language')"
                />
                <v-select
                  v-model="form.timezone"
                  :items="timezoneOptions"
                  :label="t('pages.profileEdit.labels.timezone')"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </div>
          </SidebarCard>
        </section>

        <section
          class="mb-8"
          aria-labelledby="profile-contact-section"
        >
          <SidebarCard
            class="text-card-foreground px-3 py-2"
            padding="none"
            glow
          >
            <h2
              id="profile-contact-section"
              class="text-h5 font-weight-semibold mb-4"
            >
              {{ t("pages.profileEdit.sections.contact") }}
            </h2>
            <div class="d-flex flex-column gap-4">
              <div class="d-flex flex-column flex-sm-row gap-4">
                <v-text-field
                  v-model="form.email"
                  :label="t('pages.profileEdit.labels.email')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="fieldError('email')"
                />
                <v-text-field
                  v-model="form.phone"
                  :label="t('pages.profileEdit.labels.phone')"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="fieldError('phone')"
                />
              </div>
              <div class="d-flex flex-column flex-sm-row gap-4">
                <v-text-field
                  v-model="form.location"
                  :label="t('pages.profileEdit.labels.location')"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="form.website"
                  :label="t('pages.profileEdit.labels.website')"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </div>
          </SidebarCard>
        </section>

        <section aria-labelledby="profile-about-section">
          <SidebarCard
            class="text-card-foreground px-3 py-2"
            padding="none"
            glow
          >
            <h2
              id="profile-about-section"
              class="text-h5 font-weight-semibold mb-4"
            >
              {{ t("pages.profileEdit.sections.about") }}
            </h2>
            <div class="d-flex flex-column gap-4">
              <v-textarea
                v-model="form.bio"
                :label="t('pages.profileEdit.labels.bio')"
                :hint="t('pages.profileEdit.helpers.bio')"
                persistent-hint
                rows="5"
                variant="outlined"
                density="comfortable"
                :counter="280"
                :error-messages="fieldError('bio')"
              />
              <v-combobox
                v-model="form.skills"
                :items="skillOptions"
                :label="t('pages.profileEdit.labels.skills')"
                :hint="t('pages.profileEdit.helpers.skills')"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="comfortable"
              />
              <v-select
                v-model="form.interests"
                :items="interestOptions"
                :label="t('pages.profileEdit.labels.interests')"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="comfortable"
              />
            </div>
          </SidebarCard>
        </section>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
      variant="flat"
    >
      {{ snackbarMessage }}
    </v-snackbar>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { ProfileForm } from "~/types/pages/profile";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});
const ProfileEditSidebarContent = defineAsyncComponent({
  loader: () => import("~/components/forms/ProfileEditSidebarContent.vue"),
  suspensible: false,
});

const { t } = useI18n();

const defaultSiteSettings = getDefaultSiteSettings();
const siteSettingsState = useSiteSettingsState();

const initialForm: ProfileForm = {
  firstName: "Amina",
  lastName: "Rahman",
  headline: "Lead Product Designer · Flowbase",
  pronouns: "she/her",
  language: defaultSiteSettings.defaultLanguage || "en",
  timezone: "Africa/Casablanca",
  email: "amina.rahman@broworld.space",
  phone: "+212 620-555-012",
  location: "Casablanca, Morocco",
  website: "https://flowbase.design",
  bio: "I design inclusive collaboration tools and coach design teams on systems thinking.",
  skills: ["Design systems", "Workshop facilitation", "Product discovery"],
  interests: ["Community leadership", "Accessibility", "Storytelling"],
  social: {
    linkedin: "https://www.linkedin.com/in/amina-rahman",
    twitter: "https://x.com/amina-rahman",
    dribbble: "https://dribbble.com/amina",
    behance: "https://www.behance.net/aminarahman",
  },
};

const form = reactive<ProfileForm>({ ...initialForm });

const pronounOptions = ["she/her", "he/him", "they/them", "xe/xem"];
const languageOptions = computed(() => {
  const settings = siteSettingsState.value ?? defaultSiteSettings;
  const languages = settings.languages?.length ? settings.languages : defaultSiteSettings.languages;
  const activeLanguages = languages.filter((language) => language.enabled !== false);
  const source = activeLanguages.length ? activeLanguages : languages;
  const finalSource = source.length ? source : defaultSiteSettings.languages;

  return finalSource.map((language) => ({
    title: language.endonym || language.label || language.code.toUpperCase(),
    value: language.code,
  }));
});

watch(
  languageOptions,
  (options) => {
    if (!options.length) {
      form.language = defaultSiteSettings.defaultLanguage;
      return;
    }

    if (!options.some((option) => option.value === form.language)) {
      form.language = options[0]?.value ?? defaultSiteSettings.defaultLanguage;
    }
  },
  { immediate: true },
);

const timezoneOptions = [
  "Africa/Casablanca",
  "Europe/Paris",
  "America/New_York",
  "Asia/Dubai",
  "Asia/Singapore",
];
const skillOptions = [
  "Design systems",
  "Product discovery",
  "Workshop facilitation",
  "Narrative design",
  "Accessibility",
  "Leadership coaching",
];
const interestOptions = [
  "Community leadership",
  "Accessibility",
  "Storytelling",
  "Research ops",
  "Content strategy",
];

const errors = reactive<Record<keyof ProfileForm | string, string>>({});
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("primary");
const isProfileSaving = ref(false);

const fullName = computed(() => `${form.firstName} ${form.lastName}`.trim());
const initials = computed(() => {
  const first = form.firstName?.charAt(0) ?? "";
  const last = form.lastName?.charAt(0) ?? "";
  const combined = `${first}${last}`.trim();

  if (combined) {
    return combined.toUpperCase();
  }

  const fallback = t("pages.profileEdit.labels.firstName");
  return fallback.charAt(0).toUpperCase();
});

const { registerRightSidebarContent } = useLayoutRightSidebar();

const sidebarContent = computed(() => ({
  component: ProfileEditSidebarContent,
  props: {
    form,
    fullName: fullName.value,
    initials: initials.value,
  },
  wrapperClass: "flex flex-col gap-6",
}));

registerRightSidebarContent(sidebarContent);

const formErrors = computed(() => Object.values(errors).filter(Boolean));

function fieldError(field: keyof ProfileForm | string) {
  return errors[field] ? [errors[field]] : [];
}

function validate() {
  errors.firstName = form.firstName ? "" : t("pages.profileEdit.validation.required");
  errors.lastName = form.lastName ? "" : t("pages.profileEdit.validation.required");
  errors.language = form.language ? "" : t("pages.profileEdit.validation.required");
  errors.email = form.email ? "" : t("pages.profileEdit.validation.required");
  errors.bio = form.bio.length <= 280 ? "" : t("pages.profileEdit.validation.bioLimit");

  return Object.values(errors).every((value) => !value);
}

function resetForm() {
  Object.assign(form, initialForm);
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
}

async function submitForm() {
  if (isProfileSaving.value) {
    return;
  }

  const isValid = validate();

  if (!isValid) {
    snackbarMessage.value = t("pages.profileEdit.feedback.errorMessage");
    snackbarColor.value = "error";
    showSnackbar.value = true;
    return;
  }

  try {
    isProfileSaving.value = true;
    await new Promise((resolve) => setTimeout(resolve, 900));
    snackbarMessage.value = t("pages.profileEdit.feedback.successMessage");
    snackbarColor.value = "success";
    showSnackbar.value = true;
  } catch (error) {
    snackbarMessage.value = t("pages.profileEdit.feedback.errorMessage");
    snackbarColor.value = "error";
    showSnackbar.value = true;
  } finally {
    isProfileSaving.value = false;
  }
}
</script>

<style scoped>
.profile-edit-form {
  --v-field-border-radius: var(--radius, var(--ui-radius));
}

.profile-edit-form :deep(.v-field) {
  border-radius: var(--v-field-border-radius);
}

.profile-edit-form :deep(.v-field__outline),
.profile-edit-form :deep(.v-field__overlay) {
  border-radius: inherit;
}
</style>
