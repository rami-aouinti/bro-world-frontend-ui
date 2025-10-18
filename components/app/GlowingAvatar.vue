<template>
  <div
    class="avatar-wrapper"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  >
    <div
      class="glow-border"
      :style="{ background: computedGlow }"
    />
    <v-avatar
      :size="size"
      class="overflow-hidden z-10"
    >
      <slot>
        <NuxtImg
          :src="src"
          :alt="alt"
          cover
          format="webp"
        />
      </slot>
    </v-avatar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";

const props = defineProps({
  src: { type: String, default: "https://placehold.co/128x128" },
  alt: { type: String, default: "Avatar" },
  size: { type: Number, default: 48 },
});

const { current } = useTheme();

const computedGlow = computed(() => {
  const primary = current.value.colors.primary || "#be0072";

  return `radial-gradient(circle, ${primary} 0%, transparent 70%)`;
});
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.glow-border {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  filter: blur(10px);
  animation: pulse-glow 2s ease-in-out infinite alternate;
  z-index: 1;
  opacity: 0.6;
}

@keyframes pulse-glow {
  from {
    transform: scale(1);
    opacity: 0.4;
  }

  to {
    transform: scale(1.3);
    opacity: 1;
  }
}
</style>
