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
import { useIntersectionObserver, useResizeObserver } from "@vueuse/core";
import { computed, defineAsyncComponent, onBeforeUnmount, ref, useAttrs, watch, watchEffect } from "vue";

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

const cardStyle = ref<Record<string, string>>({
  "--card-x": paddingValueMap[props.padding] ?? "0px",
  borderRadius: "var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))",
});

watch(
  () => props.padding,
  (value) => {
    cardStyle.value = {
      ...cardStyle.value,
      "--card-x": paddingValueMap[value] ?? "0px",
    };
  },
);

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
  function applyPaddingMeasurement(padding: number) {
    const nextValue = `${Math.max(0, padding)}px`;
    if (cardStyle.value["--card-x"] !== nextValue) {
      cardStyle.value = {
        ...cardStyle.value,
        "--card-x": nextValue,
      };
    }
  }

  const { stop: stopObserver } = useResizeObserver(cardRef, (entries) => {
    const entry = entries[0];
    if (!entry) {
      return;
    }

    const target = entry.target as HTMLElement;

    const borderBox = Array.isArray(entry.borderBoxSize)
      ? entry.borderBoxSize[0]
      : entry.borderBoxSize;
    const contentBox = Array.isArray(entry.contentBoxSize)
      ? entry.contentBoxSize[0]
      : entry.contentBoxSize;

    let padding: number | null = null;

    if (borderBox && contentBox) {
      padding = (borderBox.inlineSize - contentBox.inlineSize) / 2;
    } else if (entry.contentRect) {
      const clientWidth = target.clientWidth;
      const contentWidth = entry.contentRect.width;
      if (typeof clientWidth === "number" && typeof contentWidth === "number") {
        padding = (clientWidth - contentWidth) / 2;
      }
    }

    if (padding !== null && Number.isFinite(padding) && padding >= 0) {
      applyPaddingMeasurement(padding);
    }
  });

  const { stop: stopVisibilityObserver } = useIntersectionObserver(
    cardRef,
    (entries) => {
      const entry = entries[0];
      isCardVisible.value = Boolean(entry?.isIntersecting && entry.intersectionRatio > 0);
    },
    {
      threshold: [0, 0.2, 0.5],
    },
  );

  const stopParticlesWatcher = watchEffect(() => {
    updateParticlesAnimation();
  });

  onBeforeUnmount(() => {
    stopObserver();
    stopVisibilityObserver();
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
