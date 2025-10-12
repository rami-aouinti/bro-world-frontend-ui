<template>
  <AdminSettingsLayout section="pages">
    <v-card
      class="glass-card pa-6"
      rounded="xl"
      elevation="8"
    >
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.pages.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.pages.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="indigo"
          variant="tonal"
          prepend-icon="mdi-book-open-page-variant"
        >
          {{ t("admin.settings.sections.pages.badge") || "Content" }}
        </v-chip>
      </div>

      <v-select
        v-model="form.contentLanguage"
        :items="languageOptions"
        item-title="title"
        item-value="value"
        :label="t('admin.settings.fields.language')"
        :disabled="isSaving"
        variant="outlined"
        class="mb-4"
        density="comfortable"
        hide-details
      />

      <div class="d-flex flex-column gap-4">
        <v-sheet
          v-for="page in pageEditors"
          :key="page.key"
          class="pa-5"
          rounded="xl"
          border
          elevation="2"
        >
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="d-flex align-center gap-2 mb-1">
                <v-icon :icon="page.icon" />
                <span class="text-subtitle-1 font-weight-semibold">{{ page.label }}</span>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ page.description }}
              </p>
            </div>
          </div>
          <div class="d-flex flex-column gap-3">
            <v-text-field
              v-model="form.pages[page.key].title"
              :label="t('admin.settings.fields.pageTitle')"
              :disabled="isSaving"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="form.pages[page.key].subtitle"
              :label="t('admin.settings.fields.pageSubtitle')"
              :disabled="isSaving"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-textarea
              v-model="form.pages[page.key].body"
              :label="t('admin.settings.fields.pageBody')"
              :disabled="isSaving"
              variant="outlined"
              density="comfortable"
              auto-grow
              rows="4"
              hide-details
            />
          </div>
        </v-sheet>
      </div>
    </v-card>
  </AdminSettingsLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import AdminSettingsLayout from "~/components/admin/settings/AdminSettingsLayout.vue";
import { editablePageKeys, useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  documentDriven: false,
});

const { t } = useI18n();
const { form, isSaving, languageOptions } = useAdminSettingsEditor();

const pageEditors = computed(() =>
  editablePageKeys.map((key) => ({
    key,
    icon:
      key === "about"
        ? "mdi-information-outline"
        : key === "contact"
          ? "mdi-email-outline"
          : "mdi-lifebuoy",
    label: t(`admin.settings.sections.pages.labels.${key}`),
    description: t(`admin.settings.sections.pages.descriptions.${key}`),
  })),
);
</script>
