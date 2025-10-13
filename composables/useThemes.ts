import { computed, watch } from "vue";
import type { Theme } from "shadcn-docs-nuxt/lib/themes";
import { themes } from "shadcn-docs-nuxt/lib/themes";
import { useTheme } from "vuetify";
import { withSecureCookieOptions } from "~/lib/cookies";
import { useCookieColorMode } from "~/composables/useCookieColorMode";

interface ThemeCookieConfig {
  theme: Theme["name"];
  radius: number;
}

function parseHslComponents(hsl?: string) {
  if (!hsl) {
    return null;
  }

  const trimmed = hsl
    .trim()
    .replace(/^hsl\(/i, "")
    .replace(/\)$/i, "");
  const match = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%(?:\s*\/\s*(\d+(?:\.\d+)?)%)?$/,
  );

  if (!match) {
    return null;
  }

  const [, hue, saturation, lightness] = match;

  return {
    hue: ((Number(hue) % 360) + 360) % 360,
    saturation: Number(saturation),
    lightness: Number(lightness),
  };
}

function hslToHex({
  hue,
  saturation,
  lightness,
}: NonNullable<ReturnType<typeof parseHslComponents>>) {
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hueSegment = hue / 60;
  const intermediate = chroma * (1 - Math.abs((hueSegment % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment >= 0 && hueSegment < 1) {
    red = chroma;
    green = intermediate;
  } else if (hueSegment >= 1 && hueSegment < 2) {
    red = intermediate;
    green = chroma;
  } else if (hueSegment >= 2 && hueSegment < 3) {
    green = chroma;
    blue = intermediate;
  } else if (hueSegment >= 3 && hueSegment < 4) {
    green = intermediate;
    blue = chroma;
  } else if (hueSegment >= 4 && hueSegment < 5) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  const matchLightness = l - chroma / 2;

  function toHex(value: number) {
    return Math.round((value + matchLightness) * 255)
      .toString(16)
      .padStart(2, "0");
  }

  const hex = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;

  return hex.toUpperCase();
}

function normalizeHexColor(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  if (!trimmed) {
    return null;
  }

  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const match = prefixed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

  if (!match) {
    return null;
  }

  const [, hex] = match;

  if (hex.length === 3) {
    const expanded = hex
      .split("")
      .map((char) => char + char)
      .join("");

    return `#${expanded}`.toUpperCase();
  }

  return `#${hex}`.toUpperCase();
}

export function useThemes() {
  const config = useConfig();
  const FALLBACK_PRIMARY_HEX = "#E91E63";

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

  const defaultThemePrimaryHex = computed(() => {
    const components = parseHslComponents(primarySource.value ?? undefined);

    if (!components) {
      return null;
    }

    return hslToHex(components);
  });

  const themePrimaryCookie = useCookie<string | null>(
    "theme-primary",
    withSecureCookieOptions({
      sameSite: "lax",
    }),
  );

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

  const themePrimaryHex = computed<string | undefined>(() => {
    const normalized = normalizeHexColor(themePrimaryCookie.value);

    if (normalized) {
      return normalized;
    }

    const fallback = normalizeHexColor(defaultThemePrimaryHex.value ?? undefined);

    return fallback ?? undefined;
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

  watch(
    () => themePrimaryHex.value ?? FALLBACK_PRIMARY_HEX,
    (value) => {
      if (!vuetifyTheme) {
        return;
      }

      const next = normalizeHexColor(value) ?? FALLBACK_PRIMARY_HEX;

      vuetifyTheme.themes.value.light.colors.primary = next;
      vuetifyTheme.themes.value.dark.colors.primary = next;
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

  const themePrimary = computed(() => primarySource.value ?? undefined);

  const themePrimaryOptions = computed(() => {
    const seen = new Map<string, { hex: string; label: string }>();

    for (const candidate of themes) {
      const primaries = [candidate.cssVars.light?.primary, candidate.cssVars.dark?.primary];

      for (const primary of primaries) {
        if (!primary) {
          continue;
        }

        const components = parseHslComponents(primary);

        if (!components) {
          continue;
        }

        const hex = hslToHex(components);

        if (seen.has(hex)) {
          continue;
        }

        seen.set(hex, {
          hex,
          label: candidate.label ?? candidate.name,
        });
      }
    }

    const fallbackHex = FALLBACK_PRIMARY_HEX.toUpperCase();

    if (!seen.has(fallbackHex)) {
      seen.set(fallbackHex, {
        hex: fallbackHex,
        label: "Default",
      });
    }

    return Array.from(seen.values());
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
