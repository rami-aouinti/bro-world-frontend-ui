<template>
  <v-container>
    <header
      class="mb-8"
      aria-describedby="profile-edit-subtitle"
    >
      <SidebarCard
        class="text-card-foreground"
        padding="lg"
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
            class="text-card-foreground"
            padding="lg"
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
          </SidebarCard>
        </section>

        <section
          class="mb-8"
          aria-labelledby="profile-contact-section"
        >
          <SidebarCard
            class="text-card-foreground"
            padding="lg"
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
            class="text-card-foreground"
            padding="lg"
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

      <v-col
        cols="12"
        xl="4"
      >
        <aside>
          <SidebarCard
            v-if="canManageSite"
            class="text-card-foreground mb-6"
            padding="lg"
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
              <v-select
                v-model="siteSettingsForm.language"
                :items="siteSettingsLanguageOptions"
                item-title="title"
                item-value="value"
                :label="t('admin.settings.fields.language')"
                :disabled="isSiteSettingsSaving"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="siteSettingsTagline"
                :label="t('admin.settings.fields.tagline')"
                :placeholder="t('admin.settings.placeholders.tagline')"
                :disabled="isSiteSettingsSaving"
                variant="outlined"
                auto-grow
                rows="3"
                density="comfortable"
              />
            </div>
          </SidebarCard>

          <SidebarCard
            class="text-card-foreground mb-6"
            padding="lg"
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
          </SidebarCard>

          <SidebarCard
            class="text-card-foreground bg-primary/10"
            padding="lg"
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
          </SidebarCard>
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

import SidebarCard from "~/components/layout/SidebarCard.vue";
import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { ADMIN_ROLE_KEYS } from "~/lib/navigation/sidebar";
import type { SiteLocalizedSettings, SiteSettings } from "~/types/settings";
import type { ProfileForm } from "~/types/pages/profile";
import { useAuthSession } from "~/stores/auth-session";

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

const auth = useAuthSession();
const canManageSite = computed(() => {
  const roles = auth.currentUser.value?.roles ?? [];
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role));
});

const { save: saveSiteSettings, isSaving: adminSettingsSaving } = useAdminSettingsEditor();

const siteSettingsForm = reactive({
  siteName: defaultSiteSettings.siteName,
  language: defaultSiteSettings.defaultLanguage,
  taglines: {} as Record<string, string>,
});

const resolvedSiteSettings = computed(() => siteSettingsState.value ?? defaultSiteSettings);

function getSiteLanguageSource(settings: SiteSettings) {
  const languages = settings.languages?.length ? settings.languages : defaultSiteSettings.languages;
  const enabled = languages.filter((language) => language.enabled !== false);
  const source = enabled.length ? enabled : languages;

  return source.length ? source : defaultSiteSettings.languages;
}

function resolveSiteTagline(settings: SiteSettings, language: string): string {
  const normalizedDefault = settings.defaultLanguage || defaultSiteSettings.defaultLanguage;
  const localizedEntry = settings.localized?.[language];
  const fallbackEntry =
    settings.localized?.[normalizedDefault] ??
    defaultSiteSettings.localized?.[language] ??
    defaultSiteSettings.localized?.[normalizedDefault] ??
    defaultSiteSettings.localized?.[defaultSiteSettings.defaultLanguage];

  const tagline =
    (language === normalizedDefault ? settings.tagline : undefined) ??
    localizedEntry?.tagline ??
    fallbackEntry?.tagline ??
    defaultSiteSettings.tagline ??
    "";

  return typeof tagline === "string" ? tagline : (tagline ?? "");
}

function cloneLocalizedPages(
  settings: SiteSettings,
  language: string,
): SiteLocalizedSettings["pages"] {
  const normalizedDefault = settings.defaultLanguage || defaultSiteSettings.defaultLanguage;

  if (language === normalizedDefault) {
    return {
      about: { ...settings.pages.about },
      contact: { ...settings.pages.contact },
      help: { ...settings.pages.help },
    } satisfies SiteLocalizedSettings["pages"];
  }

  const localized =
    settings.localized?.[language]?.pages ??
    defaultSiteSettings.localized?.[language]?.pages ??
    defaultSiteSettings.localized?.[normalizedDefault]?.pages ??
    defaultSiteSettings.pages;

  return {
    about: { ...localized.about },
    contact: { ...localized.contact },
    help: { ...localized.help },
  } satisfies SiteLocalizedSettings["pages"];
}

function syncSiteSettingsDrafts(settings: SiteSettings) {
  const languages = getSiteLanguageSource(settings);
  const nextTaglines: Record<string, string> = {};

  for (const language of languages) {
    nextTaglines[language.code] = resolveSiteTagline(settings, language.code);
  }

  const defaultLanguage = settings.defaultLanguage || defaultSiteSettings.defaultLanguage;

  if (defaultLanguage && !(defaultLanguage in nextTaglines)) {
    nextTaglines[defaultLanguage] = resolveSiteTagline(settings, defaultLanguage);
  }

  for (const key of Object.keys(siteSettingsForm.taglines)) {
    if (!(key in nextTaglines)) {
      delete siteSettingsForm.taglines[key];
    }
  }

  for (const [code, value] of Object.entries(nextTaglines)) {
    siteSettingsForm.taglines[code] = value;
  }

  return { languages, defaultLanguage };
}

watch(
  () => siteSettingsState.value,
  (value) => {
    const settings = value ?? defaultSiteSettings;
    siteSettingsForm.siteName = settings.siteName;
    const { languages, defaultLanguage } = syncSiteSettingsDrafts(settings);
    const preferredLanguage = languages.some(
      (language) => language.code === siteSettingsForm.language,
    )
      ? siteSettingsForm.language
      : defaultLanguage || languages[0]?.code || defaultSiteSettings.defaultLanguage;
    siteSettingsForm.language = preferredLanguage;
  },
  { immediate: true },
);

watch(
  () => siteSettingsForm.language,
  (language) => {
    if (!language) {
      return;
    }

    if (!(language in siteSettingsForm.taglines)) {
      siteSettingsForm.taglines[language] = resolveSiteTagline(
        resolvedSiteSettings.value,
        language,
      );
    }
  },
);

const siteSettingsTagline = computed({
  get: () => siteSettingsForm.taglines[siteSettingsForm.language] ?? "",
  set: (value: string) => {
    siteSettingsForm.taglines[siteSettingsForm.language] = value;
  },
});

const siteSettingsLanguageOptions = computed(() => {
  const settings = resolvedSiteSettings.value;
  const map = new Map<
    string,
    { code: string; label?: string | null; endonym?: string | null; enabled?: boolean }
  >(getSiteLanguageSource(settings).map((language) => [language.code, language]));

  for (const code of Object.keys(siteSettingsForm.taglines)) {
    if (map.has(code)) continue;
    const fallback = defaultSiteSettings.languages.find((language) => language.code === code);
    if (fallback) {
      map.set(code, fallback);
      continue;
    }
    map.set(code, { code, label: code.toUpperCase(), endonym: code.toUpperCase(), enabled: true });
  }

  return Array.from(map.values()).map((language) => ({
    value: language.code,
    title: language.endonym || language.label || language.code.toUpperCase(),
  }));
});

function serializeSiteSettings() {
  const settings = resolvedSiteSettings.value;
  const defaultLanguage = settings.defaultLanguage || defaultSiteSettings.defaultLanguage;
  const payload: Partial<SiteSettings> = {};

  const trimmedSiteName = siteSettingsForm.siteName.trim();
  if (trimmedSiteName !== settings.siteName.trim()) {
    payload.siteName = trimmedSiteName;
  }

  const localizedUpdates: Record<string, SiteLocalizedSettings> = {};

  for (const [code, value] of Object.entries(siteSettingsForm.taglines)) {
    const trimmed = value.trim();
    const baseline = resolveSiteTagline(settings, code);

    if (trimmed !== baseline) {
      localizedUpdates[code] = {
        tagline: trimmed || null,
        pages: cloneLocalizedPages(settings, code),
      } satisfies SiteLocalizedSettings;

      if (code === defaultLanguage) {
        payload.tagline = trimmed || null;
      }
    }
  }

  if (Object.keys(localizedUpdates).length) {
    payload.localized = localizedUpdates;
  }

  return payload;
}

const siteSettingsChanged = computed(() => Object.keys(serializeSiteSettings()).length > 0);

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

  if ("siteName" in payload && !payload.siteName) {
    snackbarMessage.value = t("pages.profileEdit.validation.required");
    snackbarColor.value = "error";
    showSnackbar.value = true;
    return;
  }

  if (!Object.keys(payload).length) {
    snackbarMessage.value = t("admin.settings.feedback.saved");
    snackbarColor.value = "success";
    showSnackbar.value = true;
    return;
  }

  try {
    await saveSiteSettings(payload);
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
