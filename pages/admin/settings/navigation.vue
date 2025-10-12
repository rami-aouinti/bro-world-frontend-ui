<template>
  <AdminSettingsLayout section="navigation">
    <SidebarCard
      class="glass-card pa-6 text-card-foreground"
      glow
    >
      <div class="section-title mb-4">
        <div>
          <h2 class="text-h5 font-weight-semibold mb-1">
            {{ t("admin.settings.sections.navigation.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("admin.settings.sections.navigation.subtitle") }}
          </p>
        </div>
        <v-chip
          size="small"
          color="teal"
          variant="tonal"
          prepend-icon="mdi-compass-outline"
        >
          {{ t("admin.settings.sections.navigation.badge") || "Menus" }}
        </v-chip>
      </div>

      <div class="d-flex flex-column gap-4">
        <v-sheet
          v-for="(menu, index) in form.menus"
          :key="menu.id"
          class="menu-item pa-4"
          rounded="xl"
          border
          elevation="2"
        >
          <div class="d-flex flex-column gap-4">
            <div class="d-flex flex-column flex-md-row gap-4">
              <v-text-field
                v-model="menu.label"
                :label="t('admin.settings.fields.menuLabel')"
                :disabled="isSaving"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-inner-icon="mdi-label-outline"
              />
              <v-text-field
                v-model="menu.to"
                :label="t('admin.settings.fields.menuPath')"
                :disabled="isSaving"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-inner-icon="mdi-link-variant"
              />
              <v-text-field
                v-model="menu.icon"
                :label="t('admin.settings.fields.menuIcon')"
                :disabled="isSaving"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-inner-icon="mdi-shape-outline"
              />
            </div>

            <div class="d-flex flex-wrap gap-3">
              <v-switch
                v-model="menu.requiresAdmin"
                inset
                color="primary"
                :label="t('admin.settings.fields.menuAdmin')"
                :disabled="isSaving"
              />
              <v-switch
                v-model="menu.isVisible"
                inset
                color="primary"
                :label="t('admin.settings.fields.menuVisible')"
                :disabled="isSaving"
              />
            </div>

            <div class="d-flex flex-wrap gap-2">
              <v-btn
                variant="text"
                color="primary"
                prepend-icon="mdi-arrow-up"
                class="text-none"
                :disabled="isSaving"
                @click="moveMenu(index, -1)"
              >
                {{ t("admin.settings.actions.moveUp") }}
              </v-btn>
              <v-btn
                variant="text"
                color="primary"
                prepend-icon="mdi-arrow-down"
                class="text-none"
                :disabled="isSaving"
                @click="moveMenu(index, 1)"
              >
                {{ t("admin.settings.actions.moveDown") }}
              </v-btn>
              <v-btn
                variant="text"
                color="error"
                prepend-icon="mdi-delete"
                class="text-none"
                :disabled="isSaving"
                @click="removeMenu(index)"
              >
                {{ t("admin.settings.actions.removeMenu") }}
              </v-btn>
              <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                class="text-none"
                :disabled="isSaving"
                @click="handleAddChildMenu(index, menu.requiresAdmin ?? false)"
              >
                {{ t("admin.settings.actions.addChild") }}
              </v-btn>
            </div>

            <div
              v-if="menu.children?.length"
              class="d-flex flex-column gap-3"
            >
              <div class="text-subtitle-2 text-medium-emphasis">
                {{ t("admin.settings.sections.navigation.children") }}
              </div>

              <v-sheet
                v-for="(child, childIndex) in menu.children"
                :key="child.id"
                class="pa-3 rounded-xl child-item"
                border
              >
                <div class="d-flex flex-column flex-md-row gap-3">
                  <v-text-field
                    v-model="child.label"
                    :label="t('admin.settings.fields.menuLabel')"
                    :disabled="isSaving"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    prepend-inner-icon="mdi-subdirectory-arrow-right"
                  />
                  <v-text-field
                    v-model="child.to"
                    :label="t('admin.settings.fields.menuPath')"
                    :disabled="isSaving"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    prepend-inner-icon="mdi-link-variant"
                  />
                  <v-text-field
                    v-model="child.icon"
                    :label="t('admin.settings.fields.menuIcon')"
                    :disabled="isSaving"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                  />
                </div>

                <div class="d-flex flex-wrap gap-2 mt-2">
                  <v-btn
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-arrow-up"
                    class="text-none"
                    :disabled="isSaving"
                    @click="moveChildMenu(index, childIndex, -1)"
                  >
                    {{ t("admin.settings.actions.moveUp") }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-arrow-down"
                    class="text-none"
                    :disabled="isSaving"
                    @click="moveChildMenu(index, childIndex, 1)"
                  >
                    {{ t("admin.settings.actions.moveDown") }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    prepend-icon="mdi-delete"
                    class="text-none"
                    :disabled="isSaving"
                    @click="removeChildMenu(index, childIndex)"
                  >
                    {{ t("admin.settings.actions.removeMenu") }}
                  </v-btn>
                </div>

                <div class="d-flex flex-wrap gap-2 mt-2">
                  <v-switch
                    v-model="child.requiresAdmin"
                    inset
                    color="primary"
                    :label="t('admin.settings.fields.menuAdmin')"
                    :disabled="isSaving"
                  />
                  <v-switch
                    v-model="child.isVisible"
                    inset
                    color="primary"
                    :label="t('admin.settings.fields.menuVisible')"
                    :disabled="isSaving"
                  />
                </div>
              </v-sheet>
            </div>
          </div>
        </v-sheet>

        <div class="d-flex">
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none ml-auto"
            :disabled="isSaving"
            prepend-icon="mdi-playlist-plus"
            @click="handleAddMenu"
          >
            {{ t("admin.settings.actions.addMenu") }}
          </v-btn>
        </div>
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
const {
  form,
  isSaving,
  addMenu,
  removeMenu,
  moveMenu,
  addChildMenu,
  moveChildMenu,
  removeChildMenu,
} = useAdminSettingsEditor();

function handleAddMenu() {
  addMenu({
    label: t("admin.settings.defaults.menuLabel"),
    icon: "mdi-dots-grid",
    to: "/",
    requiresAdmin: false,
    translate: false,
    isVisible: true,
  });
}

function handleAddChildMenu(parentIndex: number, inheritsAdmin: boolean) {
  addChildMenu(parentIndex, {
    label: t("admin.settings.defaults.submenuLabel"),
    icon: "mdi-rhombus-medium",
    to: "/",
    requiresAdmin: inheritsAdmin,
    translate: false,
    isVisible: true,
  });
}
</script>
