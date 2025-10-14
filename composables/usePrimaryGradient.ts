import { computed } from "vue";
import { useTheme } from "vuetify";

/** utils HSL */
function hexToHsl(hex: string) {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hslToHex(h: number, s: number, l: number) {
  function hue2rgb(p: number, q: number, t: number) {
    let normalizedT = t;

    if (normalizedT < 0) normalizedT += 1;
    if (normalizedT > 1) normalizedT -= 1;
    if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
    if (normalizedT < 1 / 2) return q;
    if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
    return p;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  function toHex(x: number) {
    return Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function makeScale(hex: string, steps: number, light: number, dark: number) {
  const { h, s } = hexToHsl(hex);
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const l = light + (dark - light) * t;
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

/**
 * Génère:
 * - colors: tableau de nuances primary
 * - textGradient: gradient CSS pour texte (clip)
 * - barGradient: gradient CSS pour l'image du v-app-bar
 */
export function usePrimaryGradient(opts?: {
  steps?: number;
  lightDark?: [number, number];
  textAlpha?: { light: number; dark: number };
  barAlpha?: { light: number; dark: number };
}) {
  const theme = useTheme();
  const steps = opts?.steps ?? 7;
  const [light, dark] = opts?.lightDark ?? [0.82, 0.22];
  const textAlpha = opts?.textAlpha ?? { light: 0.8, dark: 0.4 };
  const barAlpha = opts?.barAlpha ?? { light: 0.82, dark: 0.55 };

  const primary = computed(() => theme.current.value.colors.primary);
  const isDark = computed(() => theme.current.value.dark);

  const colors = computed(() => makeScale(primary.value, steps, light, dark));

  const textGradient = computed(() => {
    const a = isDark.value ? textAlpha.dark : textAlpha.light;
    return `linear-gradient(120deg, ${colors.value.map((c) => hexToRgba(c, a)).join(", ")})`;
  });

  const barGradient = computed(() => {
    const a = isDark.value ? barAlpha.dark : barAlpha.light;
    return `linear-gradient(135deg, ${colors.value.map((c) => hexToRgba(c, a)).join(", ")})`;
  });

  return { colors, textGradient, barGradient, isDark };
}

function hexToRgba(hex: string, alpha = 1) {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
