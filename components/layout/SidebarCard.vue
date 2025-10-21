<template>
  <component
    :is="tagName"
    ref="cardRef"
    v-bind="cardAttrs"
    :class="cardClass"
    :style="cardStyle"
  >
    <ParticlesBg
      v-if="shouldRenderParticles"
      ref="particlesRef"
      class="sidebar-card__particles"
      v-bind="resolvedParticlesProps"
      :auto-start="false"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  watchEffect,
} from "vue";

type PaddingSize = "none" | "sm" | "md" | "lg";

type ParticlesProps = Record<string, unknown>;
type ParticlesBgInstance = { start: () => void; stop: () => void };

const ParticlesBg = defineAsyncComponent({
  loader: () => import("~/components/content/inspira/ui/particles-bg/ParticlesBg.vue"),
  suspensible: false,
});

const props = withDefaults(
  defineProps<{
    tag?: string;
    padding?: PaddingSize;
    particles?: boolean;
    particlesProps?: ParticlesProps;
    glow?: boolean;
    deferOffscreen?: boolean;
    intrinsicHeight?: number;
    reserveSpace?: boolean;
  }>(),
  {
    tag: "div",
    padding: "lg" as PaddingSize,
    particles: false,
    particlesProps: () =>
      ({
        quantity: 120,
        ease: 120,
        staticity: 12,
      }) as ParticlesProps,
    glow: false,
    deferOffscreen: false,
    intrinsicHeight: 600,
    reserveSpace: true,
  },
);

const attrs = useAttrs();

const paddingClassMap: Record<PaddingSize, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const cardRef = ref<HTMLElement | null>(null);
const particlesRef = ref<ParticlesBgInstance | null>(null);
const isCardVisible = ref(false);

const cardAttrs = computed(() => {
  const result: Record<string, unknown> = {};

  Object.entries(attrs).forEach(([key, value]) => {
    if (key !== "class") {
      result[key] = value;
    }
  });

  return result;
});

const cardClass = computed(() => [
  "sidebar-card relative isolate flex flex-col overflow-hidden rounded-3xl bg-transparent shadow-[0_15px_15px_-10px_hsl(var(--primary)/0.35)]",
  { "sidebar-card--glow": props.glow },
  paddingClassMap[props.padding],
  attrs.class as string | string[] | Record<string, boolean> | undefined,
]);

const paddingValueMap: Record<PaddingSize, string> = {
  none: "0px",
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
};

const baseCardStyle = ref<Record<string, string>>({
  "--card-x": paddingValueMap[props.padding] ?? "0px",
  borderRadius: "var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))",
});

watch(
  () => props.padding,
  (value) => {
    baseCardStyle.value = {
      ...baseCardStyle.value,
      "--card-x": paddingValueMap[value] ?? "0px",
    };
  },
);

const shouldDeferOffscreen = computed(() => Boolean(props.deferOffscreen));
const shouldReserveSpace = computed(() => props.reserveSpace !== false);

const intrinsicHeightValue = computed(() => {
  const rawValue = Number(props.intrinsicHeight);

  if (Number.isFinite(rawValue) && rawValue > 0) {
    return rawValue;
  }

  return 600;
});

const offscreenStyle = computed(() => {
  const style: Record<string, string> = {};

  if (!shouldReserveSpace.value && !shouldDeferOffscreen.value) {
    return style;
  }

  if (shouldDeferOffscreen.value) {
    style.contentVisibility = "auto";
  }

  if (!shouldReserveSpace.value) {
    return style;
  }

  const intrinsicHeight = Math.max(1, intrinsicHeightValue.value);
  const intrinsicSizeValue = `${intrinsicHeight}px`;

  style.containIntrinsicSize = `auto ${intrinsicSizeValue}`;
  style["--sidebar-card-intrinsic-size"] = intrinsicSizeValue;

  return style;
});

const cardStyle = computed(() => ({
  ...baseCardStyle.value,
  ...offscreenStyle.value,
}));

const shouldRenderParticles = computed(() => props.particles);
const resolvedParticlesProps = computed(() => props.particlesProps);
const tagName = computed(() => props.tag);

function updateParticlesAnimation() {
  const instance = particlesRef.value;

  if (!instance) {
    return;
  }

  if (shouldRenderParticles.value && isCardVisible.value) {
    instance.start();
  } else {
    instance.stop();
  }
}

if (import.meta.client) {
  let stopVisibilityObserver: (() => void) | undefined;

  function cleanupVisibilityObserver() {
    if (stopVisibilityObserver) {
      stopVisibilityObserver();
      stopVisibilityObserver = undefined;
    }
  }

  watch(
    () => props.particles,
    (enabled) => {
      if (enabled) {
        if (!stopVisibilityObserver) {
          const { stop } = useIntersectionObserver(
            cardRef,
            (entries) => {
              const entry = entries[0];
              isCardVisible.value = Boolean(entry?.isIntersecting && entry.intersectionRatio > 0);
            },
            {
              threshold: [0, 0.2, 0.5],
            },
          );

          stopVisibilityObserver = stop;
        }
      } else {
        isCardVisible.value = false;
        cleanupVisibilityObserver();
      }
    },
    { immediate: true },
  );

  const stopParticlesWatcher = watchEffect(() => {
    updateParticlesAnimation();
  });

  onBeforeUnmount(() => {
    cleanupVisibilityObserver();
    stopParticlesWatcher();
    particlesRef.value?.stop();
  });
}
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.sidebar-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

.sidebar-card--glow::before,
.sidebar-card--glow::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(64px);
}

.sidebar-card--glow::before {
  top: 2rem;
  left: -3.5rem;
  width: 10rem;
  height: 10rem;
  background-color: hsl(var(--primary) / 0.25);
}

.sidebar-card--glow::after {
  top: -2.5rem;
  right: -4rem;
  width: 12rem;
  height: 12rem;
  background-color: hsl(var(--primary) / 0.35);
}
</style>
