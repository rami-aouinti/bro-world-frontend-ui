<template>
  <Teleport to="body">
    <Transition name="app-loading-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div class="relative flex flex-col items-center gap-6 px-6 text-center">
          <div class="relative h-20 w-20">
            <span
              class="absolute inset-0 rounded-full border-[6px] border-primary/20"
              aria-hidden="true"
            />
            <span
              class="absolute inset-0 rounded-full border-[6px] border-transparent border-t-primary animate-spin"
              aria-hidden="true"
            />
            <span class="sr-only">{{ t("layout.loadingOverlay.srLabel") }}</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <p class="text-lg font-semibold text-foreground">
              {{ t("layout.loadingOverlay.title") }}
            </p>
            <p class="max-w-xs text-sm text-muted-foreground">
              {{ t("layout.loadingOverlay.description") }}
            </p>
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
</style>
