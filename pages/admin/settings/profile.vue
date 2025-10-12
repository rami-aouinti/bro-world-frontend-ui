<template>
  <AdminSettingsLayout section="profile">
    <SidebarCard class="glass-card pa-6 text-card-foreground">
      <!-- glows -->
      <span
        class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      ></span>
      <span
        class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
      ></span>
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.profile.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.profile.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="pink"
          variant="tonal"
          prepend-icon="mdi-account-cog"
        >
          {{ t("admin.settings.sections.profile.badge") || "Profiles" }}
        </v-chip>
      </div>

      <div class="d-flex flex-column gap-4">
        <div class="d-flex flex-wrap gap-3">
          <v-switch
            v-model="form.profile.allowCustomization"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileAllowCustomization')"
          />
          <v-switch
            v-model="form.profile.allowThemeSelection"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileAllowThemeSelection')"
          />
        </div>

        <div class="d-flex flex-wrap gap-3">
          <v-switch
            v-model="form.profile.allowAvatarUploads"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileAllowAvatarUploads')"
          />
          <v-switch
            v-model="form.profile.allowCoverUploads"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileAllowCoverUploads')"
          />
        </div>

        <div class="d-flex flex-wrap gap-3">
          <v-switch
            v-model="form.profile.showContactSection"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileShowContact')"
          />
          <v-switch
            v-model="form.profile.showDetailsSection"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileShowDetails')"
          />
          <v-switch
            v-model="form.profile.showSocialSection"
            color="primary"
            inset
            :disabled="isSaving"
            :label="t('admin.settings.fields.profileShowSocial')"
          />
        </div>

        <v-textarea
          v-model="form.profile.defaultBio"
          :label="t('admin.settings.fields.profileDefaultBio')"
          :disabled="isSaving"
          auto-grow
          rows="3"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </div>
    </SidebarCard>
  </AdminSettingsLayout>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import AdminSettingsLayout from "~/components/admin/settings/AdminSettingsLayout.vue";
import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  documentDriven: false,
});

const { t } = useI18n();
const { form, isSaving } = useAdminSettingsEditor();
</script>
