<template>
  <AdminSettingsLayout section="general">
    <SidebarCard
      class="glass-card pa-6 text-card-foreground"
      glow
    >
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.general.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.general.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-cog-outline"
        >
          {{ t("admin.settings.sections.general.badge") || "Core" }}
        </v-chip>
      </div>

      <v-form @submit.prevent>
        <v-text-field
          v-model="form.siteName"
          :label="t('admin.settings.fields.siteName')"
          :placeholder="t('admin.settings.placeholders.siteName')"
          :disabled="isSaving"
          variant="outlined"
          class="mb-4"
          density="comfortable"
          hide-details
        />
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
        <v-textarea
          v-model="form.tagline"
          :label="t('admin.settings.fields.tagline')"
          :placeholder="t('admin.settings.placeholders.tagline')"
          :disabled="isSaving"
          variant="outlined"
          auto-grow
          rows="3"
          density="comfortable"
          hide-details
        />
      </v-form>
    </SidebarCard>
  </AdminSettingsLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";

const AdminSettingsLayout = defineAsyncComponent({
  loader: () => import("~/components/admin/settings/AdminSettingsLayout.vue"),
  suspensible: false,
});

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: true,
  documentDriven: false,
});

const { t } = useI18n();
const { form, isSaving, languageOptions } = useAdminSettingsEditor();
</script>
