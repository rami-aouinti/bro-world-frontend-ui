<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="route-loader-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="sr-only">{{ t("layout.routeLoadingOverlay.srLabel") }}</span>
      <div
        class="route-loader"
        aria-hidden="true"
      >
        <div class="route-loader__orb">
          <span class="route-loader__pulse" />
          <span class="route-loader__spinner" />
          <span class="route-loader__spark route-loader__spark--one" />
          <span class="route-loader__spark route-loader__spark--two" />
        </div>
        <div class="route-loader__label">
          <span class="route-loader__title">{{ t("layout.routeLoadingOverlay.title") }}</span>
          <span class="route-loader__subtitle">{{ t("layout.routeLoadingOverlay.subtitle") }}</span>
        </div>
        <div class="route-loader__progress">
          <span class="route-loader__bar" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ visible: boolean }>();

const { t } = useI18n();
</script>

<style scoped>
.route-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 5vw, 4rem);
  background: transparent;
}

.route-loader {
  position: relative;
  display: grid;
  gap: 1.75rem;
  width: min(420px, 100%);
  padding: clamp(2rem, 4vw, 2.75rem);
  border-radius: 1.75rem;
  background: linear-gradient(
    150deg,
    hsl(var(--primary) / 0.16),
    hsl(var(--primary) / 0.08)
  );
  border: 1px solid hsl(var(--primary) / 0.25);
  box-shadow:
    0 25px 55px hsl(var(--primary) / 0.25),
    0 12px 22px hsl(var(--primary) / 0.22);
  overflow: hidden;
}

.route-loader::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 60% 20%, hsl(var(--primary) / 0.2), transparent 60%);
  opacity: 0.4;
  pointer-events: none;
}

.route-loader__orb {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(6rem, 35vw, 7.5rem);
  aspect-ratio: 1 / 1;
  margin-inline: auto;
}

.route-loader__pulse {
  position: absolute;
  inset: 12%;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    hsl(var(--primary) / 0.35),
    hsl(var(--primary) / 0.12)
  );
  filter: blur(2px);
  animation: route-loader-pulse 2.2s ease-in-out infinite;
}

.route-loader__spinner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: conic-gradient(
    from 90deg,
    hsl(var(--primary) / 0),
    hsl(var(--primary) / 0.85),
    hsl(var(--primary) / 0)
  );
  mask: radial-gradient(circle, transparent calc(50% - 10px), black calc(50% - 9px));
  -webkit-mask: radial-gradient(circle, transparent calc(50% - 10px), black calc(50% - 9px));
  animation: route-loader-spin 1.6s linear infinite;
}

.route-loader__spark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  background: hsl(var(--primary-foreground) / 0.9);
  box-shadow:
    0 0 12px hsl(var(--primary-foreground) / 0.75),
    0 0 24px hsl(var(--primary) / 0.55);
  animation: route-loader-orbit 2.8s ease-in-out infinite;
  transform-origin: center;
}

.route-loader__spark--one {
  animation-delay: -0.3s;
}

.route-loader__spark--two {
  animation-delay: -1.2s;
}

.route-loader__label {
  position: relative;
  display: grid;
  gap: 0.45rem;
  text-align: center;
  color: hsl(var(--primary-foreground) / 0.95);
}

.route-loader__title {
  font-size: clamp(1.1rem, 3vw, 1.35rem);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.route-loader__subtitle {
  font-size: clamp(0.85rem, 2.2vw, 0.95rem);
  color: hsl(var(--primary-foreground) / 0.7);
}

.route-loader__progress {
  position: relative;
  height: 0.6rem;
  border-radius: 999px;
  overflow: hidden;
  background: hsl(var(--primary) / 0.16);
}

.route-loader__bar {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    120deg,
    hsl(var(--primary) / 0.2),
    hsl(var(--primary) / 0.85),
    hsl(var(--primary) / 0.65)
  );
  transform: translateX(-100%);
  animation: route-loader-progress 1.8s ease-in-out infinite;
}

@keyframes route-loader-spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes route-loader-pulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes route-loader-orbit {
  0%,
  100% {
    transform: rotate(0turn) translateY(-160%) scale(1);
  }
  50% {
    transform: rotate(0.5turn) translateY(-160%) scale(1.2);
  }
}

@keyframes route-loader-progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 480px) {
  .route-loader {
    padding: 1.75rem;
    border-radius: 1.5rem;
  }

  .route-loader__subtitle {
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-loader__spinner,
  .route-loader__pulse,
  .route-loader__spark,
  .route-loader__bar {
    animation: none !important;
  }
}
</style>
