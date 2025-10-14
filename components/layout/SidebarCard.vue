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
      class="sidebar-card__particles"
      v-bind="resolvedParticlesProps"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, ref, useAttrs, watch } from "vue";

type PaddingSize = "none" | "sm" | "md" | "lg";

type ParticlesProps = Record<string, unknown>;

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

if (import.meta.client) {
  const updatePaddingVariable = () => {
    void nextTick(() => {
      if (!cardRef.value) {
        return;
      }

      const computedStyle = window.getComputedStyle(cardRef.value);
      const paddingValue =
        computedStyle.paddingInlineStart ||
        computedStyle.paddingLeft ||
        paddingValueMap[props.padding] ||
        "0px";

      cardStyle.value = {
        ...cardStyle.value,
        "--card-x": paddingValue,
      };
    });
  };

  watch([cardClass, () => props.padding], () => {
    updatePaddingVariable();
  });

  onMounted(() => {
    updatePaddingVariable();
  });
}

const shouldRenderParticles = computed(() => props.particles);
const resolvedParticlesProps = computed(() => props.particlesProps);
const tagName = computed(() => props.tag);
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
