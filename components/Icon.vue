<template>
  <span
    v-safe-html="iconContent"
    v-bind="forwardedAttrs"
    :class="['inline-flex items-center justify-center align-middle', attrs.class]"
    :style="mergedStyle"
    role="img"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, watch, useAttrs } from "vue";
import type { StyleValue } from "vue";

const props = withDefaults(
  defineProps<{
    name?: string;
    size?: number | string;
    color?: string;
  }>(),
  {
    size: 24,
  },
);

const attrs = useAttrs();
type IconCache = Record<string, string | null | undefined>;

const iconCache = useState<IconCache>("app-icon-cache", () => ({}));

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

const normalizedSize = computed(() => {
  if (props.size == null) {
    return undefined;
  }

  return typeof props.size === "number" ? `${props.size}px` : props.size;
});

const forwardedAttrs = computed(() => {
  const entries = Object.entries(attrs);
  return Object.fromEntries(entries.filter(([key]) => key !== "class" && key !== "style"));
});

const iconSvg = computed(() => {
  if (!props.name) {
    return null;
  }

  const cachedValue = iconCache.value[props.name];

  return typeof cachedValue === "string" ? cachedValue : null;
});
const iconContent = computed(() => iconSvg.value ?? "");

function sanitizeStyleValue(value: unknown): string | number | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return undefined;
}

function sanitizeStyle(style: StyleValue | undefined): StyleValue | undefined {
  if (!style) {
    return undefined;
  }

  if (Array.isArray(style)) {
    const sanitizedArray = style
      .map((item) => sanitizeStyle(item as StyleValue | undefined))
      .filter((item): item is StyleValue => Boolean(item));

    return sanitizedArray.length ? sanitizedArray : undefined;
  }

  if (typeof style === "object") {
    const entries = Object.entries(style as Record<string, unknown>)
      .map(([key, value]) => [key, sanitizeStyleValue(value)] as const)
      .filter(([, value]) => value !== undefined);

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  if (typeof style === "symbol") {
    return undefined;
  }

  return style;
}

const iconStyle = computed(() => ({
  width: normalizedSize.value,
  height: normalizedSize.value,
  color: props.color,
}));

const mergedStyle = computed<StyleValue | undefined>(() => {
  const baseStyle = sanitizeStyle(attrs.style as StyleValue | undefined);

  if (!baseStyle) {
    return iconStyle.value;
  }

  return [baseStyle, iconStyle.value];
});

async function resolveIcon(name: string) {
  const cachedValue = iconCache.value[name];

  if (typeof cachedValue === "string") {
    return;
  }

  try {
    const response = await fetch(`https://api.iconify.design/${name}.svg`);

    if (!response.ok) {
      throw new Error(`Icon request failed with status ${response.status}`);
    }

    const svg = await response.text();

    iconCache.value = {
      ...iconCache.value,
      [name]: typeof svg === "string" ? sanitizeSvg(svg) : sanitizeSvg(String(svg)),
    };
  } catch (error) {
    console.warn(`Unable to load icon "${name}":`, error);

    iconCache.value = {
      ...iconCache.value,
      [name]: null,
    };
  }
}

watch(
  () => props.name,
  (name) => {
    if (name) {
      resolveIcon(name);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.name) {
    resolveIcon(props.name);
  }
});
</script>
