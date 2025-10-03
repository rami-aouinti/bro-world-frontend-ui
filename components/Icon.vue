<template>
  <span
    v-bind="forwardedAttrs"
    :class="['inline-flex items-center justify-center align-middle', attrs.class]"
    :style="[attrs.style as StyleValue | undefined, iconStyle]"
    role="img"
    aria-hidden="true"
    v-html="iconContent"
  />
</template>

<script setup lang="ts">
import { computed, watch, useAttrs } from "vue";
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
const iconCache = useState<Record<string, string | null>>("app-icon-cache", () => ({}));

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

const iconSvg = computed(() => (props.name ? (iconCache.value[props.name] ?? null) : null));
const iconContent = computed(() => iconSvg.value ?? "");

const iconStyle = computed(() => ({
  width: normalizedSize.value,
  height: normalizedSize.value,
  color: props.color,
}));

async function resolveIcon(name: string) {
  if (iconCache.value[name] !== undefined) {
    return;
  }

  try {
    const svg = await $fetch<string>(`https://api.iconify.design/${name}.svg`, {
      responseType: "text",
      parseResponse: (text) => text,
    });

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
</script>
