<template>
  <ClientOnly>
    <span
      class="border-beam"
      :class="props.class"
      aria-hidden="true"
      :style="cssVars"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    class?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    anchor?: number;
    colorFrom?: string;
    colorTo?: string;
    delay?: number;
  }>(),
  {
    class: "",
    size: 200,
    duration: 15,
    borderWidth: 1.5,
    anchor: 90,
    colorFrom: "#ffaa40",
    colorTo: "#9c40ff",
    delay: 0,
  },
);

const cssVars = computed(() => ({
  "--border-beam-size": `${props.size}px`,
  "--border-beam-duration": `${props.duration}s`,
  "--border-beam-delay": `${props.delay}s`,
  "--border-beam-border-width": `${props.borderWidth}px`,
  "--border-beam-anchor": `${props.anchor}deg`,
  "--border-beam-color-from": props.colorFrom,
  "--border-beam-color-to": props.colorTo,
}));
</script>

<style scoped>
.border-beam {
  position: absolute;
  inset: calc(var(--border-beam-border-width) * -1);
  border-radius: inherit;
  pointer-events: none;
  display: block;
}

.border-beam::after,
.border-beam::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.border-beam::before {
  border: var(--border-beam-border-width) solid rgba(255, 255, 255, 0.35);
  opacity: 0.35;
}

.border-beam::after {
  border: var(--border-beam-border-width) solid transparent;
  border-image: conic-gradient(
      from var(--border-beam-anchor),
      transparent,
      var(--border-beam-color-from),
      var(--border-beam-color-to),
      transparent 60%
    )
    1;
  animation: border-beam-spin var(--border-beam-duration) linear infinite;
  animation-delay: var(--border-beam-delay);
  opacity: 0.85;
  will-change: transform, opacity;
}

@keyframes border-beam-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
