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
          <v-card
            class="glass-card pa-6"
            rounded="xl"
            elevation="8"
          >
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
          </v-card>
        </v-col>

        <!-- Theme -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="glass-card pa-6 h-100"
            rounded="xl"
            elevation="8"
          >
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
          </v-card>
        </v-col>

        <!-- Navigation -->
        <v-col cols="12">
          <v-card
            class="glass-card pa-6"
            rounded="xl"
            elevation="8"
          >
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
          </v-card>
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

const form = reactive({
  siteName: getDefaultSiteSettings().siteName,
  tagline: getDefaultSiteSettings().tagline ?? "",
  activeThemeId: getDefaultSiteSettings().activeThemeId,
  themes: getDefaultSiteSettings().themes.map((theme) => ({ ...theme })),
  menus: getDefaultSiteSettings().menus.map((menu) => deepCloneMenu(menu)),
});

const initialSnapshot = ref(JSON.stringify(serializeForm()));

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
  initialSnapshot.value = JSON.stringify(serializeForm());
}

function deepCloneMenu(menu: SiteMenuItem): EditableMenu {
  return {
    ...menu,
    translate: false,
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
  } satisfies Partial<SiteSettings>;
}

function serializeMenu(menu: EditableMenu, index: number): SiteMenuItem {
  return {
    ...menu,
    translate: false,
    order: index,
    children: menu.children?.map((child, childIndex) => serializeMenu(child, childIndex)) ?? [],
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

<style scoped>
.settings-grid {
  row-gap: 16px;
}

/* Header sticky */
.settings-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 0 16px;
  backdrop-filter: saturate(120%) blur(6px);
  background: linear-gradient(
    to bottom,
    rgba(16, 18, 27, 0.75),
    rgba(16, 18, 27, 0.35) 70%,
    transparent
  );
}
.settings-header-shadow {
  block-size: 1px;
  inline-size: 100%;
  background: transparent;
  transition: background 0.2s ease;
}
.settings-header.is-stuck .settings-header-shadow {
  background: linear-gradient(to right, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25));
}

/* Cartes “glass” élégantes */
.glass-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Titres de section */
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Theme cards */
.theme-card {
  border: 1px dashed rgba(255, 255, 255, 0.14);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.theme-card--active {
  border: 1px solid rgb(var(--v-theme-primary));
  box-shadow: 0 2px 14px rgba(99, 102, 241, 0.25);
}
.theme-card--idle:hover {
  transform: translateY(-2px);
}
.theme-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.theme-swatch {
  inline-size: 80px;
  block-size: 80px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.06);
}

/* Menu items */
.menu-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}
.menu-item:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.14);
}
.child-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Petits détails */
.transition {
  transition: all 0.2s ease;
}
.text-none {
  text-transform: none;
}
</style>
