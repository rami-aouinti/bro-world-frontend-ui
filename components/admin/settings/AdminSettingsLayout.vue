<template>
  <main
    aria-labelledby="admin-settings-title"
  >
    <v-container class="settings-container">
      <header
        ref="stickyHeader"
        class="settings-header"
        :class="{ 'is-stuck': isStuck }"
      >
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4">
          <div>
            <h4
              id="admin-settings-title"
              class="text-h4 text-lg-h3 font-weight-bold mb-1"
            >
              {{ t("admin.settings.page.title") }}
            </h4>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ currentSection?.subtitle || t("admin.settings.page.subtitle") }}
            </p>
          </div>
          <div class="d-flex flex-wrap gap-3">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none px-3"
              :loading="isSaving"
              prepend-icon="mdi-content-save-outline"
              :disabled="pending"
              @click="handleSave"
            >
              {{ t("admin.settings.actions.save") }}
            </v-btn>
            <v-btn
              variant="text"
              class="text-none"
              prepend-icon="mdi-restore"
              :disabled="isSaving || !hasChanges"
              @click="reset"
            >
              {{ t("admin.settings.actions.reset") }}
            </v-btn>
          </div>
        </div>
        <div class="settings-header-shadow" />
      </header>

      <div class="settings-shell">
        <slot />
      </div>

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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useAdminSettingsEditor } from "~/composables/useAdminSettingsEditor";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import AdminSettingsSidebarContent from "./AdminSettingsSidebarContent.vue";

const props = defineProps<{
  section: "general" | "themes" | "profile" | "appearance" | "pages" | "navigation";
}>();

const { t } = useI18n();
const { hasChanges, isSaving, pending, reset, save, snackbar, setSnackbar } =
  useAdminSettingsEditor();

const activeSection = computed(() => props.section);

const navigationTitle = computed(() => {
  const label = t("admin.settings.navigation.title");
  return label === "admin.settings.navigation.title" ? t("admin.settings.page.title") : label;
});

const sections = computed(() => [
  {
    key: "general",
    to: "/admin/settings",
    icon: "mdi-cog-outline",
    title: t("admin.settings.sections.general.title"),
    subtitle: t("admin.settings.sections.general.subtitle"),
  },
  {
    key: "themes",
    to: "/admin/settings/themes",
    icon: "mdi-palette-outline",
    title: t("admin.settings.sections.theme.title"),
    subtitle: t("admin.settings.sections.theme.subtitle"),
  },
  {
    key: "profile",
    to: "/admin/settings/profile",
    icon: "mdi-account-cog",
    title: t("admin.settings.sections.profile.title"),
    subtitle: t("admin.settings.sections.profile.subtitle"),
  },
  {
    key: "appearance",
    to: "/admin/settings/appearance",
    icon: "mdi-theme-light-dark",
    title: t("admin.settings.sections.appearance.title"),
    subtitle: t("admin.settings.sections.appearance.subtitle"),
  },
  {
    key: "pages",
    to: "/admin/settings/pages",
    icon: "mdi-book-open-page-variant",
    title: t("admin.settings.sections.pages.title"),
    subtitle: t("admin.settings.sections.pages.subtitle"),
  },
  {
    key: "navigation",
    to: "/admin/settings/navigation",
    icon: "mdi-compass-outline",
    title: t("admin.settings.sections.navigation.title"),
    subtitle: t("admin.settings.sections.navigation.subtitle"),
  },
]);

const currentSection = computed(() =>
  sections.value.find((section) => section.key === activeSection.value),
);

const { registerRightSidebarContent } = useLayoutRightSidebar();

const sidebarContent = computed(() => ({
  component: AdminSettingsSidebarContent,
  props: {
    sections: sections.value,
    activeSection: activeSection.value,
    title: navigationTitle.value,
  },
  wrapperClass: "flex flex-col gap-6 px-3 py-4",
}));

registerRightSidebarContent(sidebarContent);

const stickyHeader = ref<HTMLElement | null>(null);
const isStuck = ref(false);
let observer: IntersectionObserver | null = null;

function handleSave() {
  save()
    .then(() => {
      setSnackbar({
        message: t("admin.settings.feedback.saved"),
        color: "success",
        visible: true,
      });
    })
    .catch((error) => {
      console.error("Failed to update settings", error);
      setSnackbar({
        message: t("admin.settings.feedback.error"),
        color: "error",
        visible: true,
      });
    });
}

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
