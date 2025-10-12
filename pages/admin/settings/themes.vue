<template>
  <AdminSettingsLayout section="themes">
    <v-card
      class="glass-card pa-6"
      rounded="xl"
      elevation="8"
    >
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.theme.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.theme.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="purple"
          variant="tonal"
          prepend-icon="mdi-palette-outline"
        >
          UI
        </v-chip>
      </div>

      <div class="d-flex flex-column gap-4">
        <v-item-group
          v-model="form.activeThemeId"
          mandatory
        >
          <v-item
            v-for="(themeOption, index) in form.themes"
            :key="themeOption.id"
            :value="themeOption.id"
          >
            <template #default="{ isSelected, toggle }">
              <v-hover v-slot="{ isHovering, props: hoverProps }">
                <v-sheet
                  v-bind="hoverProps"
                  rounded="xl"
                  class="theme-card pa-4 transition"
                  :class="[
                    isSelected ? 'theme-card--active' : 'theme-card--idle',
                    isHovering ? 'elevation-6' : 'elevation-2',
                  ]"
                  @click="toggle"
                >
                  <div class="d-flex justify-space-between align-start gap-4">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center justify-space-between mb-3">
                        <v-text-field
                          v-model="themeOption.name"
                          :label="t('admin.settings.fields.themeName')"
                          :disabled="isSaving"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                        />
                        <div class="d-flex align-center">
                          <v-chip
                            v-if="isSelected"
                            color="primary"
                            variant="flat"
                            size="small"
                            class="mr-2"
                          >
                            {{ t("admin.settings.sections.theme.active") }}
                          </v-chip>
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            color="error"
                            :disabled="isSaving || form.themes.length <= 1"
                            @click.stop="removeTheme(index)"
                          />
                        </div>
                      </div>

                      <v-textarea
                        v-model="themeOption.description"
                        :label="t('admin.settings.fields.themeDescription')"
                        :disabled="isSaving"
                        variant="outlined"
                        auto-grow
                        rows="2"
                        density="comfortable"
                        hide-details
                        class="mb-4"
                      />

                      <div class="d-flex flex-column flex-sm-row gap-3">
                        <v-text-field
                          v-model="themeOption.primaryColor"
                          :label="t('admin.settings.fields.themePrimary')"
                          :disabled="isSaving"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          type="color"
                        />
                        <v-text-field
                          v-model="themeOption.accentColor"
                          :label="t('admin.settings.fields.themeAccent')"
                          :disabled="isSaving"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          type="color"
                        />
                        <v-text-field
                          v-model="themeOption.surfaceColor"
                          :label="t('admin.settings.fields.themeSurface')"
                          :disabled="isSaving"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          type="color"
                        />
                      </div>
                    </div>

                    <div class="theme-preview">
                      <div
                        class="theme-swatch rounded-lg"
                        :style="{
                          background: `linear-gradient(135deg, ${themeOption.primaryColor}, ${themeOption.accentColor})`,
                        }"
                      />
                      <div class="d-flex flex-column align-end mt-2">
                        <v-chip
                          size="x-small"
                          variant="tonal"
                          class="mb-1"
                        >
                          {{ themeOption.primaryColor }}
                        </v-chip>
                        <v-chip
                          size="x-small"
                          variant="tonal"
                          class="mb-1"
                        >
                          {{ themeOption.accentColor }}
                        </v-chip>
                        <v-chip
                          size="x-small"
                          variant="tonal"
                        >
                          {{ themeOption.surfaceColor }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-sheet>
              </v-hover>
            </template>
          </v-item>
        </v-item-group>

        <v-btn
          variant="tonal"
          color="primary"
          class="text-none"
          :disabled="isSaving"
          prepend-icon="mdi-palette"
          @click="handleAddTheme"
        >
          {{ t("admin.settings.actions.addTheme") }}
        </v-btn>
      </div>
    </v-card>
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
const { form, isSaving, addTheme, removeTheme } = useAdminSettingsEditor();

function handleAddTheme() {
  addTheme({
    name: t("admin.settings.defaults.themeName"),
    description: "",
    primaryColor: "#6366F1",
    accentColor: "#F97316",
    surfaceColor: "#F8FAFC",
  });
}
</script>
