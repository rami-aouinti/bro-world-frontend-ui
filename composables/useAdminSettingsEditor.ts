import { computed, watch } from "vue";
import { refreshNuxtData, useAsyncData } from "#imports";

import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteMenuItem, SiteSettings, SiteThemeDefinition } from "~/types/settings";

export interface EditableMenu extends Omit<SiteMenuItem, "children"> {
  children: EditableMenu[];
}

export interface AdminSettingsForm {
  siteName: string;
  tagline: string;
  activeThemeId: string;
  themes: SiteThemeDefinition[];
  menus: EditableMenu[];
  profile: {
    allowCustomization: boolean;
    allowAvatarUploads: boolean;
    allowCoverUploads: boolean;
    allowThemeSelection: boolean;
    showContactSection: boolean;
    showDetailsSection: boolean;
    showSocialSection: boolean;
    defaultBio: string;
  };
  ui: {
    allowThemeSwitching: boolean;
    defaultThemeMode: SiteSettings["ui"]["defaultThemeMode"];
  };
  pages: Record<EditablePageKey, { title: string; subtitle: string; body: string }>;
}

export const editablePageKeys = ["about", "contact", "help"] as const;
export type EditablePageKey = (typeof editablePageKeys)[number];

type SnackbarState = {
  visible: boolean;
  message: string;
  color: "success" | "error";
};

function deepCloneMenu(menu: SiteMenuItem): EditableMenu {
  return {
    ...menu,
    translate: menu.translate === true,
    children: (menu.children ?? []).map((child) => deepCloneMenu(child)),
  } satisfies EditableMenu;
}

function serializeMenu(menu: EditableMenu, index: number): SiteMenuItem {
  return {
    ...menu,
    translate: menu.translate === true,
    order: index,
    children: menu.children.map((child, childIndex) => serializeMenu(child, childIndex)),
  } satisfies SiteMenuItem;
}

function serializePageContent(page: { title: string; subtitle: string; body: string }) {
  return {
    title: page.title.trim(),
    subtitle: page.subtitle.trim() || null,
    body: page.body.trim() || null,
  };
}

function createFormFromSettings(settings: SiteSettings): AdminSettingsForm {
  return {
    siteName: settings.siteName,
    tagline: settings.tagline ?? "",
    activeThemeId: settings.activeThemeId,
    themes: settings.themes.map((theme) => ({ ...theme })),
    menus: settings.menus.map((menu) => deepCloneMenu(menu)),
    profile: {
      allowCustomization: settings.profile.allowCustomization,
      allowAvatarUploads: settings.profile.allowAvatarUploads,
      allowCoverUploads: settings.profile.allowCoverUploads,
      allowThemeSelection: settings.profile.allowThemeSelection,
      showContactSection: settings.profile.showContactSection,
      showDetailsSection: settings.profile.showDetailsSection,
      showSocialSection: settings.profile.showSocialSection,
      defaultBio: settings.profile.defaultBio ?? "",
    },
    ui: {
      allowThemeSwitching: settings.ui.allowThemeSwitching,
      defaultThemeMode: settings.ui.defaultThemeMode,
    },
    pages: {
      about: {
        title: settings.pages.about.title ?? "",
        subtitle: settings.pages.about.subtitle ?? "",
        body: settings.pages.about.body ?? "",
      },
      contact: {
        title: settings.pages.contact.title ?? "",
        subtitle: settings.pages.contact.subtitle ?? "",
        body: settings.pages.contact.body ?? "",
      },
      help: {
        title: settings.pages.help.title ?? "",
        subtitle: settings.pages.help.subtitle ?? "",
        body: settings.pages.help.body ?? "",
      },
    },
  } satisfies AdminSettingsForm;
}

function serializeFormState(form: AdminSettingsForm): Partial<SiteSettings> {
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

export function useAdminSettingsEditor() {
  const siteSettingsState = useSiteSettingsState();
  const defaultSettings = getDefaultSiteSettings();
  const formState = useState<AdminSettingsForm>("admin-settings-form", () =>
    createFormFromSettings(defaultSettings),
  );
  const snapshotState = useState<string>(
    "admin-settings-snapshot",
    () => JSON.stringify(serializeFormState(formState.value)),
  );
  const isSavingState = useState<boolean>("admin-settings-saving", () => false);
  const snackbarState = useState<SnackbarState>("admin-settings-snackbar", () => ({
    visible: false,
    message: "",
    color: "success",
  }));
  const watchersRegisteredState = useState<boolean>("admin-settings-watchers", () => false);

  const { data: fetchedSettings, pending, refresh, error } = useAsyncData(
    "admin-site-settings",
    async () => {
      const response = await $fetch<{ data: SiteSettings }>("/api/settings");
      return response.data;
    },
  );

  function applySettings(settings: SiteSettings) {
    formState.value = createFormFromSettings(settings);
    snapshotState.value = JSON.stringify(serializeFormState(formState.value));
  }

  if (!watchersRegisteredState.value) {
    watchersRegisteredState.value = true;
    watch(
      () => fetchedSettings.value,
      (value) => {
        if (!value) return;
        siteSettingsState.value = value;
        applySettings(value);
      },
      { immediate: true },
    );
  }

  const hasChanges = computed(
    () => JSON.stringify(serializeFormState(formState.value)) !== snapshotState.value,
  );

  async function save(partial?: Partial<SiteSettings>) {
    if (isSavingState.value) {
      return siteSettingsState.value ?? null;
    }

    isSavingState.value = true;

    try {
      const payload = partial ?? serializeFormState(formState.value);
      const { data } = await $fetch<{ data: SiteSettings }>("/api/settings", {
        method: "PUT",
        body: payload,
      });

      siteSettingsState.value = data;
      applySettings(data);
      await refresh();
      await refreshNuxtData("site-settings");
      return data;
    } finally {
      isSavingState.value = false;
    }
  }

  function reset() {
    if (fetchedSettings.value) {
      applySettings(fetchedSettings.value);
    } else {
      applySettings(defaultSettings);
    }
  }

  function setSnackbar(payload: Partial<SnackbarState>) {
    snackbarState.value = {
      ...snackbarState.value,
      ...payload,
    };
  }

  function addTheme(theme: Partial<SiteThemeDefinition> & { name: string }) {
    const id = theme.id ?? crypto.randomUUID();
    formState.value.themes.push({
      id,
      name: theme.name,
      description: theme.description ?? "",
      primaryColor: theme.primaryColor ?? "#6366F1",
      accentColor: theme.accentColor ?? "#F97316",
      surfaceColor: theme.surfaceColor ?? "#F8FAFC",
    });
    if (!formState.value.activeThemeId) {
      formState.value.activeThemeId = id;
    }
  }

  function removeTheme(index: number) {
    if (formState.value.themes.length <= 1) {
      return;
    }
    const [removed] = formState.value.themes.splice(index, 1);
    if (removed?.id === formState.value.activeThemeId) {
      formState.value.activeThemeId = formState.value.themes[0]?.id ?? "";
    }
  }

  function addMenu(menu: Partial<EditableMenu> & { label: string }) {
    formState.value.menus.push({
      id: menu.id ?? crypto.randomUUID(),
      label: menu.label,
      icon: menu.icon ?? "mdi-dots-grid",
      to: menu.to ?? "/",
      requiresAdmin: menu.requiresAdmin ?? false,
      translate: menu.translate ?? false,
      isVisible: menu.isVisible ?? true,
      order: formState.value.menus.length,
      children: menu.children?.map((child) => deepCloneMenu(child)) ?? [],
    });
  }

  function removeMenu(index: number) {
    formState.value.menus.splice(index, 1);
  }

  function moveMenu(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= formState.value.menus.length) return;
    const [item] = formState.value.menus.splice(index, 1);
    formState.value.menus.splice(target, 0, item);
  }

  function addChildMenu(parentIndex: number, menu: Partial<EditableMenu> & { label: string }) {
    const parent = formState.value.menus[parentIndex];
    if (!parent) return;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push({
      id: menu.id ?? crypto.randomUUID(),
      label: menu.label,
      icon: menu.icon ?? "mdi-rhombus-medium",
      to: menu.to ?? "/",
      requiresAdmin: menu.requiresAdmin ?? parent.requiresAdmin ?? false,
      translate: menu.translate ?? false,
      isVisible: menu.isVisible ?? true,
      order: parent.children.length,
      children: menu.children?.map((child) => deepCloneMenu(child)) ?? [],
    });
  }

  function moveChildMenu(parentIndex: number, index: number, direction: number) {
    const parent = formState.value.menus[parentIndex];
    if (!parent?.children) return;
    const target = index + direction;
    if (target < 0 || target >= parent.children.length) return;
    const [item] = parent.children.splice(index, 1);
    parent.children.splice(target, 0, item);
  }

  function removeChildMenu(parentIndex: number, index: number) {
    const parent = formState.value.menus[parentIndex];
    if (!parent?.children) return;
    parent.children.splice(index, 1);
  }

  return {
    form: formState,
    hasChanges,
    isSaving: computed(() => isSavingState.value),
    snackbar: snackbarState,
    setSnackbar,
    fetchedSettings,
    pending,
    error,
    refresh,
    save,
    reset,
    addTheme,
    removeTheme,
    addMenu,
    removeMenu,
    moveMenu,
    addChildMenu,
    moveChildMenu,
    removeChildMenu,
    serialize: () => serializeFormState(formState.value),
    applySettings,
  };
}

export function serializeAdminSettingsForm(form: AdminSettingsForm) {
  return serializeFormState(form);
}
