export type HslComponents = {
  hue: number;
  saturation: number;
  lightness: number;
};

export function parseHslComponents(hsl?: string): HslComponents | null {
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

export function formatHsl({ hue, saturation, lightness }: HslComponents): string {
  const roundedHue = Math.round(hue * 10) / 10;
  const roundedSaturation = Math.round(saturation * 10) / 10;
  const roundedLightness = Math.round(lightness * 10) / 10;

  return `${roundedHue} ${roundedSaturation}% ${roundedLightness}%`;
}

export function hslToHex({ hue, saturation, lightness }: HslComponents): string {
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

export function normalizeHexColor(candidate: string | null | undefined): string | null {
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

export function hexToRgb(candidate: string | null | undefined) {
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

export function rgbToHsl({ red, green, blue }: { red: number; green: number; blue: number }) {
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
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    hue,
    saturation: saturation * 100,
    lightness: lightness * 100,
  } as const;
}

export function hexToHsl(candidate: string | null | undefined) {
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

export function resolveForegroundHsl(candidate: string | null | undefined) {
  const rgb = hexToRgb(candidate);

  if (!rgb) {
    return null;
  }

  const luminance = relativeLuminance(rgb);

  return luminance > 0.55 ? "0 0% 0%" : "0 0% 100%";
}

export function resolvePrimaryColorVariables(
  hex: string,
  sourceHsl?: string | null | undefined,
) {
  const normalized = normalizeHexColor(hex);

  if (!normalized) {
    return null;
  }

  const formattedFromSource = (() => {
    if (!sourceHsl) {
      return null;
    }

    const parsed = parseHslComponents(sourceHsl);

    if (!parsed) {
      return null;
    }

    return formatHsl(parsed);
  })();

  const formattedHex = (() => {
    if (formattedFromSource) {
      return formattedFromSource;
    }

    const converted = hexToHsl(normalized);

    if (!converted) {
      return null;
    }

    return formatHsl(converted);
  })();

  const foreground = resolveForegroundHsl(normalized);

  return {
    primary: formattedHex,
    colorPrimary: formattedHex ? `hsl(${formattedHex})` : null,
    primaryForeground: foreground,
    colorPrimaryForeground: foreground ? `hsl(${foreground})` : null,
  } as const;
}

export function applyPrimaryColorCssVariables(
  hex: string,
  sourceHsl?: string | null | undefined,
) {
  if (!import.meta.client) {
    return;
  }

  const variables = resolvePrimaryColorVariables(hex, sourceHsl);

  if (!variables) {
    return;
  }

  const root = document.documentElement;

  if (variables.primary) {
    root.style.setProperty("--primary", variables.primary);
    if (variables.colorPrimary) {
      root.style.setProperty("--color-primary", variables.colorPrimary);
    }
  }

  if (variables.primaryForeground) {
    root.style.setProperty("--primary-foreground", variables.primaryForeground);
    if (variables.colorPrimaryForeground) {
      root.style.setProperty("--color-primary-foreground", variables.colorPrimaryForeground);
    }
  }
}
