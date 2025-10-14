<template>
  <Teleport to="body">
    <Transition name="app-loading-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div class="relative flex flex-col items-center gap-8 px-6 text-center">
          <h1 class="text-3xl font-semibold text-primary">
            {{ t("layout.loadingOverlay.title") }}
          </h1>
          <div
            class="app-loading-spinner"
            role="presentation"
            aria-hidden="true"
          />
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

.app-loading-spinner {
  position: relative;
  width: 4.75rem;
  height: 4.75rem;
}

.app-loading-spinner::before,
.app-loading-spinner::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
}

.app-loading-spinner::before {
  border: 14px solid rgba(var(--primary), 0.15);
  opacity: 0.7;
  filter: drop-shadow(0 0 12px rgba(var(--primary), 0.25));
}

.app-loading-spinner::after {
  border: 14px solid transparent;
  border-top-color: rgba(var(--primary), 0.95);
  border-right-color: rgba(var(--primary), 0.6);
  filter: drop-shadow(0 0 18px rgba(var(--primary), 0.35));
  animation: app-loading-spinner-rotate 1s linear infinite;
}

@keyframes app-loading-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
