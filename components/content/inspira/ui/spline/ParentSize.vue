<!-- ParentSize.vue -->
<template>
  <div
    ref="target"
    :style="mergedStyles"
    :class="cn('w-full h-full', props.class)"
    v-bind="attrsWithoutClassAndStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, useAttrs } from "vue";
import type { StyleValue } from "vue";
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

type DimensionKey = "width" | "height" | "top" | "left";

const props = withDefaults(
  defineProps<{
    class?: string;
    debounceTime?: number;
    ignoreDimensions?: DimensionKey | DimensionKey[];
    parentSizeStyles?: StyleValue;
    enableDebounceLeadingCall?: boolean;
  }>(),
  {
    debounceTime: 300,
    ignoreDimensions: () => [] as DimensionKey[],
    enableDebounceLeadingCall: true,
  },
);

const attrs = useAttrs();
const target = ref<HTMLElement | null>(null);
const state = reactive({
  width: 0,
  height: 0,
  top: 0,
  left: 0,
});

function toStyleArray(style?: StyleValue): StyleValue[] {
  if (style == null) {
    return [];
  }

  return Array.isArray(style) ? style : [style];
}

const mergedStyles = computed<StyleValue | undefined>(() => {
  const combined = [
    ...toStyleArray(props.parentSizeStyles),
    ...toStyleArray(attrs.style as StyleValue | undefined),
  ];

  if (combined.length === 0) {
    return undefined;
  }

  return combined.length === 1 ? combined[0] : combined;
});

const mergedClass = computed(() => ["w-full h-full", props.class]);

const attrsWithoutClassAndStyle = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== "class" && key !== "style"),
  ),
);

const normalizedIgnore = computed<DimensionKey[]>(() => {
  const value = props.ignoreDimensions;

  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
});

function updateDimensions(rect: DOMRectReadOnly) {
  const { width, height, top, left } = rect;
  const newState = { width, height, top, left };

  const hasChange = Object.keys(newState).some(
    (key) => state[key as keyof typeof state] !== newState[key as keyof typeof state],
  );

  if (!hasChange) return;

  const shouldUpdate = !Object.keys(newState).every((key) =>
    normalizedIgnore.value.includes(key as keyof typeof state),
  );

  if (shouldUpdate) {
    Object.assign(state, newState);
  }
}

const debouncedUpdate = useDebounceFn(updateDimensions, props.debounceTime);

useResizeObserver(target, (entries) => {
  const entry = entries[0];
  if (entry) debouncedUpdate(entry.contentRect);
});
</script>
