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
  background-color: rgb(var(--border));
}

.app-loading-progress-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(var(--primary), 0) 0%,
    rgba(var(--primary), 0.35) 35%,
    rgba(var(--primary), 0.8) 50%,
    rgba(var(--primary), 0.35) 65%,
    rgba(var(--primary), 0) 100%
  );
  transform: translateX(-100%);
  animation: app-loading-progress 1.8s ease-in-out infinite;
}

@keyframes app-loading-progress {
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
</style>
