<template>
  <v-container>
    <header
      class="mb-8"
      aria-describedby="profile-edit-subtitle"
    >
      <v-card
        class="pa-6"
        rounded="xl"
        elevation="8"
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
      </v-card>
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
          <v-card
            class="pa-6"
            rounded="xl"
            elevation="6"
          >
            <h2
              id="profile-core-section"
              class="text-h5 font-weight-semibold mb-4"
            >
              {{ t("pages.profileEdit.sections.profile") }}
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
          </v-card>
        </section>

        <section
          class="mb-8"
          aria-labelledby="profile-contact-section"
        >
          <v-card
            class="pa-6"
            rounded="xl"
            elevation="6"
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
          </v-card>
        </section>

        <section aria-labelledby="profile-about-section">
          <v-card
            class="pa-6"
            rounded="xl"
            elevation="6"
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
          </v-card>
        </section>
      </v-col>

      <v-col
        cols="12"
        xl="4"
      >
        <aside>
          <v-card
            v-if="canManageSite"
            class="pa-6 mb-6"
            rounded="xl"
            elevation="6"
          >
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <h2 class="text-h6 font-weight-semibold mb-1">
                  {{ t("pages.profileEdit.sections.siteSettings") }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.profileEdit.helpers.siteSettings") }}
                </p>
              </div>
              <v-btn
                color="primary"
                class="text-none"
                prepend-icon="mdi-content-save-outline"
                :loading="isSiteSettingsSaving"
                :disabled="!siteSettingsChanged"
                @click="submitSiteSettings"
              >
                {{ t("admin.settings.actions.save") }}
              </v-btn>
            </div>

            <div class="d-flex flex-column gap-3">
              <v-text-field
                v-model="siteSettingsForm.siteName"
                :label="t('admin.settings.fields.siteName')"
                :placeholder="t('admin.settings.placeholders.siteName')"
                :disabled="isSiteSettingsSaving"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="siteSettingsForm.tagline"
                :label="t('admin.settings.fields.tagline')"
                :placeholder="t('admin.settings.placeholders.tagline')"
                :disabled="isSiteSettingsSaving"
                variant="outlined"
                auto-grow
                rows="3"
                density="comfortable"
              />
            </div>
          </v-card>

          <v-card
            class="pa-6 mb-6"
            rounded="xl"
            elevation="4"
          >
            <h2 class="text-h6 font-weight-semibold mb-4">
              {{ t("pages.profileEdit.sections.social") }}
            </h2>
            <div class="d-flex flex-column gap-4">
              <v-text-field
                v-model="form.social.linkedin"
                prepend-inner-icon="mdi-linkedin"
                :label="t('pages.profileEdit.labels.linkedin')"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="form.social.twitter"
                prepend-inner-icon="mdi-twitter"
                :label="t('pages.profileEdit.labels.twitter')"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="form.social.dribbble"
                prepend-inner-icon="mdi-basketball"
                :label="t('pages.profileEdit.labels.dribbble')"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="form.social.behance"
                prepend-inner-icon="mdi-briefcase-outline"
                :label="t('pages.profileEdit.labels.behance')"
                variant="outlined"
                density="comfortable"
              />
            </div>
          </v-card>

          <v-card
            class="pa-6"
            rounded="xl"
            variant="tonal"
          >
            <h2 class="text-h6 font-weight-semibold mb-3">
              {{ t("pages.profileEdit.sections.contact") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t("pages.profileEdit.helpers.summary") }}
            </p>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex align-center gap-3">
                <v-avatar
                  size="40"
                  color="primary"
                  variant="tonal"
                >
                  <span class="text-body-2 font-weight-semibold">{{ initials }}</span>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-semibold">{{ fullName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ form.headline }}</div>
                </div>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                <div>{{ form.email }}</div>
                <div v-if="form.phone">{{ form.phone }}</div>
                <div v-if="form.location">{{ form.location }}</div>
              </div>
            </div>
          </v-card>
        </aside>
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
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { ADMIN_ROLE_KEYS } from "~/lib/navigation/sidebar";
import type { ProfileForm } from "~/types/pages/profile";
import { useAuthSession } from "~/stores/auth-session";

const { t } = useI18n();

const initialForm: ProfileForm = {
  firstName: "Amina",
  lastName: "Rahman",
  headline: "Lead Product Designer · Flowbase",
  pronouns: "she/her",
  language: "en",
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
const languageOptions = [
  { title: "English", value: "en" },
  { title: "Français", value: "fr" },
  { title: "Deutsch", value: "de" },
  { title: "العربية", value: "ar" },
  { title: "Italiano", value: "it" },
  { title: "Español", value: "es" },
  { title: "Русский", value: "ru" },
];
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

const auth = useAuthSession();
const canManageSite = computed(() => {
  const roles = auth.currentUser.value?.roles ?? [];
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role));
});

const siteSettingsState = useSiteSettingsState();
const { save: saveSiteSettings, isSaving: adminSettingsSaving } = useAdminSettingsEditor();
const defaultSiteSettings = getDefaultSiteSettings();

const siteSettingsForm = reactive({
  siteName: defaultSiteSettings.siteName,
  tagline: defaultSiteSettings.tagline ?? "",
});

const siteSettingsSnapshot = ref("{}");

function serializeSiteSettings() {
  return {
    siteName: siteSettingsForm.siteName.trim(),
    tagline: siteSettingsForm.tagline.trim(),
  };
}

watch(
  () => siteSettingsState.value,
  (value) => {
    const settings = value ?? defaultSiteSettings;
    siteSettingsForm.siteName = settings.siteName;
    siteSettingsForm.tagline = settings.tagline ?? "";
    siteSettingsSnapshot.value = JSON.stringify(serializeSiteSettings());
  },
  { immediate: true },
);

const siteSettingsChanged = computed(
  () => JSON.stringify(serializeSiteSettings()) !== siteSettingsSnapshot.value,
);

const isSiteSettingsSaving = computed(() => adminSettingsSaving.value);

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

async function submitSiteSettings() {
  if (!canManageSite.value || isSiteSettingsSaving.value) {
    return;
  }

  const payload = serializeSiteSettings();

  if (!payload.siteName) {
    snackbarMessage.value = t("pages.profileEdit.validation.required");
    snackbarColor.value = "error";
    showSnackbar.value = true;
    return;
  }

  try {
    await saveSiteSettings({
      siteName: payload.siteName,
      tagline: payload.tagline || null,
    });
    siteSettingsSnapshot.value = JSON.stringify(serializeSiteSettings());
    snackbarMessage.value = t("admin.settings.feedback.saved");
    snackbarColor.value = "success";
    showSnackbar.value = true;
  } catch (error) {
    console.error("Failed to update site settings", error);
    snackbarMessage.value = t("admin.settings.feedback.error");
    snackbarColor.value = "error";
    showSnackbar.value = true;
  }
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
