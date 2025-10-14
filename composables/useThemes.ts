import { computed, watch } from "vue";
import type { Theme } from "shadcn-docs-nuxt/lib/themes";
import { themes } from "shadcn-docs-nuxt/lib/themes";
import { useTheme } from "vuetify";
import { withSecureCookieOptions } from "~/lib/cookies";
import { useCookieColorMode } from "~/composables/useCookieColorMode";
import {
  applyPrimaryColorCssVariables,
  hslToHex,
  normalizeHexColor,
  parseHslComponents,
} from "~/lib/theme/colors";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";

interface ThemeCookieConfig {
  theme: Theme["name"];
  radius: number;
}

export function useThemes() {
  const config = useConfig();
  const FALLBACK_PRIMARY_HEX = "#E91E63";

  const PRIMARY_COLOR_OPTIONS = [
    { hex: "#E91E63", label: "Rose" },
    { hex: "#22C55E", label: "Green" },
    { hex: "#F97316", label: "Orange" },
    { hex: "#0EA5E9", label: "Sky" },
    { hex: "#A855F7", label: "Violet" },
    { hex: "#F59E0B", label: "Amber" },
    { hex: "#EF4444", label: "Red" },
  ] as const;

  function resolveThemeDefaults(): ThemeCookieConfig {
    const defaults = config.value.theme ?? {};
    const fallbackThemeName =
      (defaults.color as Theme["name"] | undefined) ?? themes[0]?.name ?? "zinc";
    const fallbackRadius = typeof defaults.radius === "number" ? defaults.radius : 0.75;

    return {
      theme: fallbackThemeName,
      radius: fallbackRadius,
    };
  }

  const colorMode = useCookieColorMode();

  const isDark = computed(() => {
    if (colorMode.value === "dark") {
      return true;
    }

    if (colorMode.value === "light") {
      return false;
    }

    return colorMode.system.value === "dark";
  });

  const themeCookie = useCookie<ThemeCookieConfig>(
    "theme",
    withSecureCookieOptions({
      sameSite: "lax",
      default: resolveThemeDefaults,
    }),
  );

  const theme = computed<Theme["name"]>(
    () => themeCookie.value?.theme ?? resolveThemeDefaults().theme,
  );
  const radius = computed(() => themeCookie.value?.radius ?? resolveThemeDefaults().radius);
  const themeClass = computed(() => `theme-${theme.value}`);

  function setTheme(themeName: Theme["name"]) {
    themeCookie.value = {
      ...resolveThemeDefaults(),
      ...themeCookie.value,
      theme: themeName,
    };
  }

  function setRadius(newRadius: number) {
    themeCookie.value = {
      ...resolveThemeDefaults(),
      ...themeCookie.value,
      radius: newRadius,
    };
  }

  const primarySource = computed(() => {
    const selectedTheme = themes.find((candidate) => candidate.name === theme.value);
    const palette = selectedTheme?.cssVars[isDark.value ? "dark" : "light"];
    const primary = palette?.primary;

    return primary ? `hsl(${primary})` : null;
  });

  const shadcnThemePrimaryHex = computed(() => {
    const components = parseHslComponents(primarySource.value ?? undefined);

    if (!components) {
      return null;
    }

    return hslToHex(components);
  });

  const fallbackSiteSettings = getDefaultSiteSettings();
  const siteSettingsState = useSiteSettingsState();
  const siteSettings = computed(() => siteSettingsState.value ?? fallbackSiteSettings);
  const activeSiteTheme = computed(() => {
    const current = siteSettings.value;
    const found = current.themes.find((theme) => theme.id === current.activeThemeId);

    return found ?? current.themes[0] ?? null;
  });

  const siteThemePrimaryHex = computed(() =>
    normalizeHexColor(activeSiteTheme.value?.primaryColor ?? undefined),
  );

  const defaultThemePrimaryHex = computed(() =>
    siteThemePrimaryHex.value ?? shadcnThemePrimaryHex.value ?? null,
  );

  const themePrimaryCookie = useCookie<string | null>(
    "theme-primary",
    withSecureCookieOptions({
      sameSite: "lax",
    }),
  );

  if (import.meta.client) {
    watch(
      defaultThemePrimaryHex,
      (value, oldValue) => {
        const normalizedDefault = normalizeHexColor(value ?? undefined);
        const normalizedOldDefault = normalizeHexColor(oldValue ?? undefined);
        const current = normalizeHexColor(themePrimaryCookie.value);

        if (!normalizedDefault) {
          return;
        }

        if (!current) {
          themePrimaryCookie.value = normalizedDefault;
          return;
        }

        if (normalizedOldDefault && current === normalizedOldDefault) {
          themePrimaryCookie.value = normalizedDefault;
        }
      },
      { immediate: true },
    );
  }

  const themePrimaryHex = computed<string | undefined>(() => {
    const normalized = normalizeHexColor(themePrimaryCookie.value);

    if (normalized) {
      return normalized;
    }

    const fallback = normalizeHexColor(defaultThemePrimaryHex.value ?? undefined);

    return fallback ?? undefined;
  });

  const themePrimary = computed(() => {
    const normalizedCookie = normalizeHexColor(themePrimaryCookie.value);

    if (normalizedCookie) {
      return undefined;
    }

    if (siteThemePrimaryHex.value) {
      return undefined;
    }

    return primarySource.value ?? undefined;
  });

  const isCustomThemePrimary = computed(() => {
    const normalized = normalizeHexColor(themePrimaryCookie.value);
    const defaultHex = normalizeHexColor(defaultThemePrimaryHex.value ?? undefined);

    if (!normalized) {
      return false;
    }

    if (!defaultHex) {
      return true;
    }

    return normalized !== defaultHex;
  });

  const vuetifyTheme = (() => {
    try {
      return useTheme();
    } catch {
      return null;
    }
  })();

  function applyPrimaryColor(hex: string, sourceHsl?: string | null | undefined) {
    if (vuetifyTheme) {
      vuetifyTheme.themes.value.light.colors.primary = hex;
      vuetifyTheme.themes.value.dark.colors.primary = hex;
    }

    applyPrimaryColorCssVariables(hex, sourceHsl);
  }

  watch(
    [
      () => themePrimaryHex.value ?? FALLBACK_PRIMARY_HEX,
      () => themePrimary.value ?? null,
    ],
    ([value, source]) => {
      const next = normalizeHexColor(value) ?? FALLBACK_PRIMARY_HEX;

      applyPrimaryColor(next, source);
    },
    { immediate: true },
  );

  function setThemePrimaryHex(value: string) {
    const normalized = normalizeHexColor(value);

    if (!normalized) {
      return;
    }

    themePrimaryCookie.value = normalized;
  }

  function resetThemePrimaryHex() {
    const fallback = normalizeHexColor(defaultThemePrimaryHex.value ?? undefined);

    themePrimaryCookie.value = fallback ?? null;
  }

  const themePrimaryOptions = computed(() => {
    const normalizedOptions = PRIMARY_COLOR_OPTIONS.map((option) => ({
      hex: normalizeHexColor(option.hex) ?? option.hex,
      label: option.label,
    }));

    const activeHex = normalizeHexColor(themePrimaryHex.value);

    if (activeHex && !normalizedOptions.some((option) => option.hex === activeHex)) {
      return [
        { hex: activeHex, label: "Custom" },
        ...normalizedOptions,
      ];
    }

    return normalizedOptions;
  });

  return {
    themeClass,
    theme,
    setTheme,
    radius,
    setRadius,
    themePrimary,
    themePrimaryHex,
    defaultThemePrimaryHex,
    isCustomThemePrimary,
    setThemePrimaryHex,
    resetThemePrimaryHex,
    themePrimaryOptions,
  };
}
