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
  radius?: number;
}

export function useThemes() {
  const config = useConfig();
  const FALLBACK_PRIMARY_HEX = "#E91E63";
  const LEGACY_DEFAULT_PRIMARY_HEXES = ["#E91E63"] as const;

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
  const defaultRadius = computed(() => resolveThemeDefaults().radius);

  const themeRadiusCookie = useCookie<number | null>(
    "theme-radius",
    withSecureCookieOptions({
      sameSite: "lax",
    }),
  );

  const radius = computed(() => {
    const cookieRadius = themeRadiusCookie.value;

    if (typeof cookieRadius === "number") {
      return cookieRadius;
    }

    const legacyRadius = themeCookie.value?.radius;

    if (typeof legacyRadius === "number" && legacyRadius !== defaultRadius.value) {
      return legacyRadius;
    }

    return defaultRadius.value;
  });
  const themeClass = computed(() => `theme-${theme.value}`);

  function setTheme(themeName: Theme["name"]) {
    themeCookie.value = {
      ...resolveThemeDefaults(),
      ...themeCookie.value,
      theme: themeName,
    };
  }

  function setRadius(newRadius: number) {
    const defaults = resolveThemeDefaults();

    themeRadiusCookie.value = newRadius === defaults.radius ? null : newRadius;

    themeCookie.value = {
      ...defaults,
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

  const normalizedFallbackPrimaryHex =
    normalizeHexColor(FALLBACK_PRIMARY_HEX) ?? "#E91E63";
  const legacyDefaultPrimaryHexes = LEGACY_DEFAULT_PRIMARY_HEXES.map((hex) =>
    normalizeHexColor(hex),
  ).filter((hex): hex is string => Boolean(hex));

  const themePrimaryCookie = useCookie<string | null>(
    "theme-primary",
    withSecureCookieOptions({
      sameSite: "lax",
    }),
  );

  const canonicalDefaultPrimaryHex = computed(
    () => defaultThemePrimaryHex.value ?? normalizedFallbackPrimaryHex,
  );
  const themePrimaryCookieHex = computed(() =>
    normalizeHexColor(themePrimaryCookie.value),
  );
  const themePrimaryCookieIsLegacyDefault = computed(() => {
    const normalized = themePrimaryCookieHex.value;

    if (!normalized) {
      return false;
    }

    return legacyDefaultPrimaryHexes.includes(normalized);
  });
  const themePrimaryCookieIsDefault = computed(() => {
    const normalized = themePrimaryCookieHex.value;

    if (!normalized) {
      return false;
    }

    return normalized === canonicalDefaultPrimaryHex.value;
  });

  if (import.meta.client) {
    watch(
      canonicalDefaultPrimaryHex,
      (_, oldValue) => {
        const current = themePrimaryCookieHex.value;

        if (!current) {
          if (themePrimaryCookie.value) {
            themePrimaryCookie.value = null;
          }

          return;
        }

        if (themePrimaryCookieIsLegacyDefault.value) {
          themePrimaryCookie.value = null;

          return;
        }

        if (themePrimaryCookieIsDefault.value) {
          themePrimaryCookie.value = null;

          return;
        }

        if (oldValue && current === normalizeHexColor(oldValue)) {
          themePrimaryCookie.value = null;
        }
      },
      { immediate: true },
    );
  }

  if (import.meta.client) {
    watch(
      defaultRadius,
      (next, previous) => {
        const stored = themeRadiusCookie.value;

        if (stored == null) {
          return;
        }

        if (stored === next || stored === previous) {
          themeRadiusCookie.value = null;
        }
      },
      { immediate: true },
    );

    watch(
      () => themeCookie.value?.radius,
      (legacyRadius) => {
        if (typeof legacyRadius !== "number") {
          return;
        }

        if (legacyRadius === defaultRadius.value) {
          return;
        }

        if (typeof themeRadiusCookie.value === "number") {
          return;
        }

        themeRadiusCookie.value = legacyRadius;
      },
      { immediate: true },
    );
  }

  const themePrimaryHex = computed<string | undefined>(() => {
    const normalized = themePrimaryCookieHex.value;

    if (normalized && !themePrimaryCookieIsDefault.value) {
      return normalized;
    }

    return canonicalDefaultPrimaryHex.value ?? undefined;
  });

  const themePrimary = computed(() => {
    if (
      themePrimaryCookieHex.value &&
      !themePrimaryCookieIsDefault.value
    ) {
      return undefined;
    }

    if (siteThemePrimaryHex.value) {
      return undefined;
    }

    return primarySource.value ?? undefined;
  });

  const isCustomThemePrimary = computed(() => {
    if (!themePrimaryCookieHex.value) {
      return false;
    }

    return !themePrimaryCookieIsDefault.value;
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

    if (normalized === canonicalDefaultPrimaryHex.value) {
      themePrimaryCookie.value = null;

      return;
    }

    themePrimaryCookie.value = normalized;
  }

  function resetThemePrimaryHex() {
    themePrimaryCookie.value = null;
  }

  const themePrimaryOptions = computed(() => {
    const normalizedOptions = PRIMARY_COLOR_OPTIONS.map((option) => ({
      hex: normalizeHexColor(option.hex) ?? option.hex,
      label: option.label,
    }));

    const canonicalHex = normalizeHexColor(canonicalDefaultPrimaryHex.value);
    const activeHex = normalizeHexColor(themePrimaryHex.value);

    const extras: { hex: string; label: string }[] = [];

    if (
      canonicalHex &&
      !normalizedOptions.some((option) => option.hex === canonicalHex)
    ) {
      extras.push({ hex: canonicalHex, label: "Custom" });
    }

    if (
      activeHex &&
      ![...normalizedOptions, ...extras].some((option) => option.hex === activeHex)
    ) {
      extras.push({ hex: activeHex, label: "Custom" });
    }

    if (extras.length) {
      return [...extras, ...normalizedOptions];
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
