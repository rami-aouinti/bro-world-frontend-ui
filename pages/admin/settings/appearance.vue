<template>
  <AdminSettingsLayout section="appearance">
    <SidebarCard
      class="glass-card pa-6 text-card-foreground"
      glow
    >
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.appearance.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.appearance.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="blue"
          variant="tonal"
          prepend-icon="mdi-theme-light-dark"
        >
          {{ t("admin.settings.sections.appearance.badge") || "Theme" }}
        </v-chip>
      </div>

      <div class="d-flex flex-column gap-4">
        <v-switch
          v-model="form.ui.allowThemeSwitching"
          color="primary"
          inset
          :disabled="isSaving"
          :label="t('admin.settings.fields.uiAllowThemeSwitching')"
        />

        <v-radio-group
          v-model="form.ui.defaultThemeMode"
          :disabled="isSaving"
          class="theme-mode-selector"
        >
          <v-radio
            value="system"
            :label="t('admin.settings.fields.themeModeSystem')"
            density="comfortable"
          >
            <template #label>
              <div class="d-flex align-center gap-3">
                <v-avatar
                  size="36"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="mdi-monitor-dashboard" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-semibold">
                    {{ t("admin.settings.fields.themeModeSystem") }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ t("admin.settings.helpers.themeModeSystem") }}
                  </div>
                </div>
              </div>
            </template>
          </v-radio>
          <v-radio
            value="light"
            :label="t('admin.settings.fields.themeModeLight')"
            density="comfortable"
          >
            <template #label>
              <div class="d-flex align-center gap-3">
                <v-avatar
                  size="36"
                  color="amber"
                  variant="tonal"
                >
                  <v-icon icon="mdi-weather-sunny" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-semibold">
                    {{ t("admin.settings.fields.themeModeLight") }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ t("admin.settings.helpers.themeModeLight") }}
                  </div>
                </div>
              </div>
            </template>
          </v-radio>
          <v-radio
            value="dark"
            :label="t('admin.settings.fields.themeModeDark')"
            density="comfortable"
          >
            <template #label>
              <div class="d-flex align-center gap-3">
                <v-avatar
                  size="36"
                  color="deep-purple"
                  variant="tonal"
                >
                  <v-icon icon="mdi-weather-night" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-semibold">
                    {{ t("admin.settings.fields.themeModeDark") }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ t("admin.settings.helpers.themeModeDark") }}
                  </div>
                </div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </div>
    </SidebarCard>
  </AdminSettingsLayout>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";

const AdminSettingsLayout = defineAsyncComponent({
  loader: () => import("~/components/admin/settings/AdminSettingsLayout.vue"),
  suspensible: false,
});

const { t } = useI18n();
const pageDescription = computed(() => t("admin.settings.sections.appearance.subtitle"));

definePageMeta(() => ({
  middleware: ["auth", "admin"],
  showRightWidgets: true,
  documentDriven: false,
  description: pageDescription.value,
}));
const { form, isSaving } = useAdminSettingsEditor();
</script>
