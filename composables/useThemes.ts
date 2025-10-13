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

function hexToRgb(candidate: string | null | undefined) {
  const normalized = normalizeHexColor(candidate);

  if (!normalized) {
    return null;
  }

  const value = normalized.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return { red, green, blue } as const;
}

function rgbToHsl({ red, green, blue }: { red: number; green: number; blue: number }) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    switch (max) {
      case r:
        hue = ((g - b) / delta) % 6;
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      default:
        hue = (r - g) / delta + 4;
        break;
    }

    hue *= 60;
  }

  if (hue < 0) {
    hue += 360;
  }

  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    hue,
    saturation: saturation * 100,
    lightness: lightness * 100,
  } as const;
}

function formatHsl({
  hue,
  saturation,
  lightness,
}: {
  hue: number;
  saturation: number;
  lightness: number;
}) {
  const roundedHue = Math.round(hue * 10) / 10;
  const roundedSaturation = Math.round(saturation * 10) / 10;
  const roundedLightness = Math.round(lightness * 10) / 10;

  return `${roundedHue} ${roundedSaturation}% ${roundedLightness}%`;
}

function hexToHsl(candidate: string | null | undefined) {
  const rgb = hexToRgb(candidate);

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb);
}

function relativeLuminance({ red, green, blue }: { red: number; green: number; blue: number }) {
  function normalizeChannel(value: number) {
    const channel = value / 255;

    if (channel <= 0.03928) {
      return channel / 12.92;
    }

    return ((channel + 0.055) / 1.055) ** 2.4;
  }

  const r = normalizeChannel(red);
  const g = normalizeChannel(green);
  const b = normalizeChannel(blue);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function resolveForegroundHsl(candidate: string | null | undefined) {
  const rgb = hexToRgb(candidate);

  if (!rgb) {
    return null;
  }

  const luminance = relativeLuminance(rgb);

  return luminance > 0.55 ? "0 0% 0%" : "0 0% 100%";
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

  const themePrimary = computed(() => primarySource.value ?? undefined);

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

    if (!import.meta.client) {
      return;
    }

    const root = document.documentElement;
    const hslFromSource = (() => {
      if (!sourceHsl) {
        return null;
      }

      const parsed = parseHslComponents(sourceHsl);

      if (!parsed) {
        return null;
      }

      return formatHsl(parsed);
    })();

    const hsl = hslFromSource ?? (() => {
      const converted = hexToHsl(hex);

      if (!converted) {
        return null;
      }

      return formatHsl(converted);
    })();
    const foreground = resolveForegroundHsl(hex);

    if (hsl) {
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--color-primary", `hsl(${hsl})`);
    }

    if (foreground) {
      root.style.setProperty("--primary-foreground", foreground);
      root.style.setProperty("--color-primary-foreground", `hsl(${foreground})`);
    }
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
