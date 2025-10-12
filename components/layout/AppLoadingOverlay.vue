<template>
  <Teleport to="body">
    <Transition name="app-loading-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div class="relative flex flex-col items-center gap-8 px-6 text-center">
          <p class="text-lg font-semibold text-foreground">
            {{ t("layout.loadingOverlay.title") }}
          </p>
          <span class="sr-only">{{ t("layout.loadingOverlay.srLabel") }}</span>
          <div class="app-loading-progress-track" role="presentation" aria-hidden="true">
            <span class="app-loading-progress-indicator" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

withDefaults(
  defineProps<{
    visible?: boolean;
  }>(),
  {
    visible: false,
  },
);

const { t } = useI18n();
</script>

<style scoped>
.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.4s ease;
}

.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}

.app-loading-progress-track {
  position: relative;
  width: 10rem;
  height: 0.25rem;
  overflow: hidden;
  border-radius: 9999px;
  background-color: rgba(var(--primary), 0.12);
  box-shadow: inset 0 0 0 1px rgba(var(--primary), 0.2);
}

.app-loading-progress-indicator {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  border-radius: inherit;
}

.app-loading-progress-indicator::before,
.app-loading-progress-indicator::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    rgba(var(--primary), 0.1) 0%,
    rgba(var(--primary), 0.9) 60%,
    rgba(var(--primary), 0.4) 100%
  );
}

.app-loading-progress-indicator::before {
  animation: app-loading-progress-long 2.2s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.app-loading-progress-indicator::after {
  animation: app-loading-progress-short 2.2s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
  animation-delay: 1.1s;
}

@keyframes app-loading-progress-long {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes app-loading-progress-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}
</style>
