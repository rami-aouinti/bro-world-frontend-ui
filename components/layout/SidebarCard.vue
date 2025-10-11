<template>
  <component
    :is="tagName"
    v-bind="cardAttrs"
    :class="cardClass"
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
import { computed, defineAsyncComponent, useAttrs, withDefaults } from "vue";

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
  }>(),
  {
    tag: "section",
    padding: "lg" as PaddingSize,
    particles: false,
    particlesProps: () => ({
      quantity: 120,
      ease: 120,
      staticity: 12,
    }) as ParticlesProps,
  },
);

const attrs = useAttrs();

const paddingClassMap: Record<PaddingSize, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

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
  "sidebar-card relative isolate flex flex-col overflow-hidden rounded-3xl bg-transparent shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)]",
  paddingClassMap[props.padding],
  attrs.class as string | string[] | Record<string, boolean> | undefined,
]);

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
</style>
