<!-- eslint-disable check-file/folder-naming-convention -->
<template>
  <NuxtLink
    :to="resolvedLink"
    class="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold text-xl"
  >
    <h1 class="z-2 relative flex items-center gap-1 text-center font-sans font-bold">
      <span
        v-if="brandParts.prefix"
        class="text-inherit"
        >{{ brandParts.prefix }}</span
      >
      <span
        class="text-inherit"
        data-testid="app-brand-highlight"
      >
        <component
          :is="highlightComponent"
          v-if="highlightComponent"
          :colors="colors"
          :text="brandParts.highlight"
        />
        <template v-else>
          {{ brandParts.highlight }}
        </template>
      </span>
    </h1>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue";
import type { Component } from "vue";
import { usePrimaryGradient } from "~/composables/usePrimaryGradient";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

const props = defineProps<{ to?: string }>();
const { colors } = usePrimaryGradient({ steps: 5, lightDark: [0.88, 0.3] });

const siteSettings = useSiteSettingsState();
const brandName = computed(
  () => siteSettings.value?.siteName?.trim() || getDefaultSiteSettings().siteName,
);

const localePath = useResolvedLocalePath();
const resolvedLink = computed(() => localePath(props.to ?? "/"));

const brandParts = computed(() => {
  const name = brandName.value;
  const segments = name.split(/\s+/).filter(Boolean);

  if (segments.length <= 1) {
    return { prefix: "", highlight: name };
  }

  return {
    prefix: segments.slice(0, -1).join(" "),
    highlight: segments[segments.length - 1],
  };
});

const highlightComponent = shallowRef<Component | null>(null);

let idleCallbackId: number | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let mediaQuery: MediaQueryList | undefined;

const clearScheduledLoad = () => {
  if (idleCallbackId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(idleCallbackId);
  }
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
  idleCallbackId = null;
  timeoutId = null;
};

const loadAnimatedHighlight = async () => {
  if (highlightComponent.value) {
    return;
  }

  const module = await import("~/components/content/ColourfulText.vue");
  highlightComponent.value = module.default;
};

const scheduleAnimatedHighlight = () => {
  if (highlightComponent.value) {
    return;
  }

  const run = () => {
    idleCallbackId = null;
    timeoutId = null;

    if (mediaQuery?.matches) {
      return;
    }

    void loadAnimatedHighlight();
  };

  clearScheduledLoad();

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    idleCallbackId = window.requestIdleCallback(run);
  } else {
    timeoutId = setTimeout(run, 300);
  }
};

const handleMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => {
  if (!event.matches) {
    scheduleAnimatedHighlight();
  } else {
    clearScheduledLoad();
  }
};

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    scheduleAnimatedHighlight();
    return;
  }

  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  handleMotionPreference(mediaQuery);

  if ("addEventListener" in mediaQuery) {
    mediaQuery.addEventListener("change", handleMotionPreference);
  } else if ("addListener" in mediaQuery) {
    mediaQuery.addListener(handleMotionPreference);
  }
});

onBeforeUnmount(() => {
  clearScheduledLoad();

  if (!mediaQuery) {
    return;
  }

  if ("removeEventListener" in mediaQuery) {
    mediaQuery.removeEventListener("change", handleMotionPreference);
  } else if ("removeListener" in mediaQuery) {
    mediaQuery.removeListener(handleMotionPreference);
  }
});
</script>
