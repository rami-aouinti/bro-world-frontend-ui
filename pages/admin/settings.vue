<template>
  <main
    class="py-5"
    aria-labelledby="admin-settings-title"
  >
    <v-container class="settings-container">
      <!-- Header sticky + actions -->
      <header
        ref="stickyHeader"
        class="settings-header"
        :class="{ 'is-stuck': isStuck }"
      >
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4">
          <div>
            <h1
              id="admin-settings-title"
              class="text-h4 text-lg-h3 font-weight-bold mb-1"
            >
              {{ t("admin.settings.page.title") }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t("admin.settings.page.subtitle") }}
            </p>
          </div>
          <div class="d-flex flex-wrap gap-3">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none px-5"
              :loading="isSaving"
              prepend-icon="mdi-content-save-outline"
              @click="handleSave"
            >
              {{ t("admin.settings.actions.save") }}
            </v-btn>
            <v-btn
              variant="text"
              class="text-none"
              prepend-icon="mdi-restore"
              :disabled="isSaving || !hasChanges"
              @click="resetForm"
            >
              {{ t("admin.settings.actions.reset") }}
            </v-btn>
          </div>
        </div>
        <div class="settings-header-shadow" />
      </header>

      <!-- Contenu -->
      <v-row
        dense
        class="settings-grid"
      >
        <!-- General -->
        <v-col
          cols="12"
          md="6"
        >
          <SidebarCard class="glass-card pa-6 text-card-foreground" glow>
            <div class="section-title">
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

            <v-divider class="my-4" />

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
        </v-col>

        <!-- Theme -->
        <v-col
          cols="12"
          md="6"
        >
          <SidebarCard class="glass-card pa-6 h-100 text-card-foreground" glow>
            <div class="section-title">
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

            <v-divider class="my-4" />

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

                          <!-- Aperçu -->
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
                @click="addTheme"
              >
                {{ t("admin.settings.actions.addTheme") }}
              </v-btn>
            </div>
          </SidebarCard>
        </v-col>

        <!-- Profile -->
        <v-col
          cols="12"
          md="6"
        >
          <SidebarCard class="glass-card pa-6 h-100 text-card-foreground" glow>
            <div class="section-title">
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
                color="primary"
                variant="tonal"
                prepend-icon="mdi-account-cog"
              >
                {{ t("admin.settings.sections.profile.badge") || "Profiles" }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

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
        </v-col>

        <!-- Appearance -->
        <v-col
          cols="12"
          md="6"
        >
          <SidebarCard class="glass-card pa-6 h-100 text-card-foreground" glow>
            <div class="section-title">
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

            <v-divider class="my-4" />

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
                />
                <v-radio
                  value="light"
                  :label="t('admin.settings.fields.themeModeLight')"
                />
                <v-radio
                  value="dark"
                  :label="t('admin.settings.fields.themeModeDark')"
                />
              </v-radio-group>
            </div>
          </SidebarCard>
        </v-col>

        <!-- Pages -->
        <v-col cols="12">
          <SidebarCard class="glass-card pa-6 text-card-foreground" glow>
            <div class="section-title">
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
                color="amber"
                variant="tonal"
                prepend-icon="mdi-note-edit-outline"
              >
                {{ t("admin.settings.sections.pages.badge") || "Content" }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-column gap-4">
              <v-sheet
                v-for="page in pageEditors"
                :key="page.key"
                class="pa-4 rounded-xl page-editor"
                border
              >
                <div class="d-flex align-center justify-space-between gap-3 mb-3">
                  <div>
                    <div class="text-subtitle-1 font-weight-semibold">
                      {{ page.label }}
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ page.description }}
                    </p>
                  </div>
                  <v-icon
                    :icon="page.icon"
                    size="26"
                    class="text-primary"
                  />
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
          </SidebarCard>
        </v-col>

        <!-- Navigation -->
        <v-col cols="12">
          <SidebarCard class="glass-card pa-6 text-card-foreground" glow>
            <div class="section-title">
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

            <v-divider class="my-4" />

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
                      @click="addChildMenu(index)"
                    >
                      {{ t("admin.settings.actions.addChild") }}
                    </v-btn>
                  </div>

                  <!-- Children -->
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
                  @click="addMenu"
                >
                  {{ t("admin.settings.actions.addMenu") }}
                </v-btn>
              </div>
            </div>
          </SidebarCard>
        </v-col>
      </v-row>

      <v-snackbar
        v-model="snackbar.visible"
        :color="snackbar.color"
        timeout="4000"
        location="bottom"
        position="fixed"
      >
        {{ snackbar.message }}
      </v-snackbar>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteMenuItem, SiteSettings } from "~/types/settings";

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  documentDriven: false,
});

interface EditableMenu extends SiteMenuItem {
  children?: EditableMenu[];
}

const { t } = useI18n();
const siteSettingsState = useSiteSettingsState();
const isSaving = ref(false);
const snackbar = reactive({
  visible: false,
  message: "",
  color: "success" as "success" | "error",
});

const { data: fetchedSettings, refresh } = await useAsyncData("admin-site-settings", () =>
  $fetch<{ data: SiteSettings }>("/api/settings").then((response) => response.data),
);

const defaultSettings = getDefaultSiteSettings();
const form = reactive({
  siteName: defaultSettings.siteName,
  tagline: defaultSettings.tagline ?? "",
  activeThemeId: defaultSettings.activeThemeId,
  themes: defaultSettings.themes.map((theme) => ({ ...theme })),
  menus: defaultSettings.menus.map((menu) => deepCloneMenu(menu)),
  profile: {
    allowCustomization: defaultSettings.profile.allowCustomization,
    allowAvatarUploads: defaultSettings.profile.allowAvatarUploads,
    allowCoverUploads: defaultSettings.profile.allowCoverUploads,
    allowThemeSelection: defaultSettings.profile.allowThemeSelection,
    showContactSection: defaultSettings.profile.showContactSection,
    showDetailsSection: defaultSettings.profile.showDetailsSection,
    showSocialSection: defaultSettings.profile.showSocialSection,
    defaultBio: defaultSettings.profile.defaultBio ?? "",
  },
  ui: {
    allowThemeSwitching: defaultSettings.ui.allowThemeSwitching,
    defaultThemeMode: defaultSettings.ui.defaultThemeMode,
  },
  pages: {
    about: {
      title: defaultSettings.pages.about.title,
      subtitle: defaultSettings.pages.about.subtitle ?? "",
      body: defaultSettings.pages.about.body ?? "",
    },
    contact: {
      title: defaultSettings.pages.contact.title,
      subtitle: defaultSettings.pages.contact.subtitle ?? "",
      body: defaultSettings.pages.contact.body ?? "",
    },
    help: {
      title: defaultSettings.pages.help.title,
      subtitle: defaultSettings.pages.help.subtitle ?? "",
      body: defaultSettings.pages.help.body ?? "",
    },
  },
});

const initialSnapshot = ref(JSON.stringify(serializeForm()));

const pageKeys = ["about", "contact", "help"] as const;
type EditablePageKey = (typeof pageKeys)[number];
const pageEditors = computed(() =>
  pageKeys.map((key) => ({
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

watch(
  () => fetchedSettings.value,
  (value) => {
    if (!value) return;
    siteSettingsState.value = value;
    applySettings(value);
  },
  { immediate: true },
);

const hasChanges = computed(() => JSON.stringify(serializeForm()) !== initialSnapshot.value);

function applySettings(settings: SiteSettings) {
  form.siteName = settings.siteName;
  form.tagline = settings.tagline ?? "";
  form.activeThemeId = settings.activeThemeId;
  form.themes = settings.themes.map((theme) => ({ ...theme }));
  form.menus = settings.menus.map((menu) => deepCloneMenu(menu));
  form.profile.allowCustomization = settings.profile.allowCustomization;
  form.profile.allowAvatarUploads = settings.profile.allowAvatarUploads;
  form.profile.allowCoverUploads = settings.profile.allowCoverUploads;
  form.profile.allowThemeSelection = settings.profile.allowThemeSelection;
  form.profile.showContactSection = settings.profile.showContactSection;
  form.profile.showDetailsSection = settings.profile.showDetailsSection;
  form.profile.showSocialSection = settings.profile.showSocialSection;
  form.profile.defaultBio = settings.profile.defaultBio ?? "";
  form.ui.allowThemeSwitching = settings.ui.allowThemeSwitching;
  form.ui.defaultThemeMode = settings.ui.defaultThemeMode;
  form.pages.about.title = settings.pages.about.title ?? "";
  form.pages.about.subtitle = settings.pages.about.subtitle ?? "";
  form.pages.about.body = settings.pages.about.body ?? "";
  form.pages.contact.title = settings.pages.contact.title ?? "";
  form.pages.contact.subtitle = settings.pages.contact.subtitle ?? "";
  form.pages.contact.body = settings.pages.contact.body ?? "";
  form.pages.help.title = settings.pages.help.title ?? "";
  form.pages.help.subtitle = settings.pages.help.subtitle ?? "";
  form.pages.help.body = settings.pages.help.body ?? "";
  initialSnapshot.value = JSON.stringify(serializeForm());
}

function deepCloneMenu(menu: SiteMenuItem): EditableMenu {
  return {
    ...menu,
    translate: menu.translate === true,
    children: menu.children?.map((child) => deepCloneMenu(child)) ?? [],
  };
}

function serializeForm(): Partial<SiteSettings> {
  return {
    siteName: form.siteName.trim(),
    tagline: form.tagline.trim() || null,
    activeThemeId: form.activeThemeId,
    themes: form.themes.map((theme) => ({ ...theme })),
    menus: form.menus.map((menu, index) => serializeMenu(menu, index)),
    profile: {
      allowCustomization: form.profile.allowCustomization,
      allowAvatarUploads: form.profile.allowAvatarUploads,
      allowCoverUploads: form.profile.allowCoverUploads,
      allowThemeSelection: form.profile.allowThemeSelection,
      showContactSection: form.profile.showContactSection,
      showDetailsSection: form.profile.showDetailsSection,
      showSocialSection: form.profile.showSocialSection,
      defaultBio: form.profile.defaultBio.trim() || null,
    },
    ui: {
      allowThemeSwitching: form.ui.allowThemeSwitching,
      defaultThemeMode: form.ui.defaultThemeMode,
    },
    pages: {
      about: serializePageContent(form.pages.about),
      contact: serializePageContent(form.pages.contact),
      help: serializePageContent(form.pages.help),
    },
  } satisfies Partial<SiteSettings>;
}

function serializeMenu(menu: EditableMenu, index: number): SiteMenuItem {
  return {
    ...menu,
    translate: menu.translate === true,
    order: index,
    children: menu.children?.map((child, childIndex) => serializeMenu(child, childIndex)) ?? [],
  };
}

function serializePageContent(page: { title: string; subtitle: string; body: string }) {
  return {
    title: page.title.trim(),
    subtitle: page.subtitle.trim() || null,
    body: page.body.trim() || null,
  };
}

function addTheme() {
  const id = crypto.randomUUID();
  form.themes.push({
    id,
    name: t("admin.settings.defaults.themeName"),
    description: "",
    primaryColor: "#6366F1",
    accentColor: "#F97316",
    surfaceColor: "#F8FAFC",
  });
}

function removeTheme(index: number) {
  if (form.themes.length <= 1) return;
  const removed = form.themes.splice(index, 1);
  if (removed[0]?.id === form.activeThemeId) {
    form.activeThemeId = form.themes[0]?.id ?? "";
  }
}

function addMenu() {
  form.menus.push({
    id: crypto.randomUUID(),
    label: t("admin.settings.defaults.menuLabel"),
    icon: "mdi-dots-grid",
    to: "/",
    requiresAdmin: false,
    translate: false,
    isVisible: true,
    order: form.menus.length,
    children: [],
  });
}

function removeMenu(index: number) {
  form.menus.splice(index, 1);
}

function moveMenu(index: number, direction: number) {
  const target = index + direction;
  if (target < 0 || target >= form.menus.length) return;
  const [item] = form.menus.splice(index, 1);
  form.menus.splice(target, 0, item);
}

function addChildMenu(parentIndex: number) {
  const parent = form.menus[parentIndex];
  if (!parent) return;
  parent.children = parent.children ?? [];
  parent.children.push({
    id: crypto.randomUUID(),
    label: t("admin.settings.defaults.submenuLabel"),
    icon: "mdi-rhombus-medium",
    to: "/",
    requiresAdmin: parent.requiresAdmin,
    translate: false,
    isVisible: true,
    order: parent.children.length,
    children: [],
  });
}

function moveChildMenu(parentIndex: number, index: number, direction: number) {
  const parent = form.menus[parentIndex];
  if (!parent?.children) return;
  const target = index + direction;
  if (target < 0 || target >= parent.children.length) return;
  const [item] = parent.children.splice(index, 1);
  parent.children.splice(target, 0, item);
}

function removeChildMenu(parentIndex: number, index: number) {
  const parent = form.menus[parentIndex];
  if (!parent?.children) return;
  parent.children.splice(index, 1);
}

function resetForm() {
  if (fetchedSettings.value) {
    applySettings(fetchedSettings.value);
  }
}

async function handleSave() {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    const payload = serializeForm();
    const { data } = await $fetch<{ data: SiteSettings }>("/api/settings", {
      method: "PUT",
      body: payload,
    });

    siteSettingsState.value = data;
    applySettings(data);
    snackbar.message = t("admin.settings.feedback.saved");
    snackbar.color = "success";
    snackbar.visible = true;
    await refresh();
    await refreshNuxtData("site-settings");
  } catch (error) {
    console.error("Failed to update settings", error);
    snackbar.message = t("admin.settings.feedback.error");
    snackbar.color = "error";
    snackbar.visible = true;
  } finally {
    isSaving.value = false;
  }
}

/* Header sticky observer (ajoute ombre discrète quand collé) */
const stickyHeader = ref<HTMLElement | null>(null);
const isStuck = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!stickyHeader.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      isStuck.value = !entries[0].isIntersecting;
    },
    { rootMargin: "-1px 0px 0px 0px", threshold: [1] },
  );
  observer.observe(stickyHeader.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped src="~/assets/styles/pages/admin/settings.scss" lang="scss"></style>
