<template>
  <ClientOnly>
    <template #fallback>
      <UiButton
        variant="ghost"
        size="icon"
        :class="triggerClass"
        type="button"
        aria-label="Toggle theme customization"
        aria-disabled="true"
        disabled
      >
        <Icon
          name="lucide:paintbrush"
          size="16"
        />
      </UiButton>
    </template>
    <UiPopover>
      <UiPopoverTrigger as-child>
        <UiButton
          variant="ghost"
          size="icon"
          :class="triggerClass"
          type="button"
          aria-label="Toggle theme customization"
          @click="handleTriggerInteraction"
          @focus="handleTriggerInteraction"
          @pointerenter.passive="handleTriggerInteraction"
        >
          <Icon
            name="lucide:paintbrush"
            size="16"
          />
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent
        class="w-[33rem] bg-background text-card-foreground rounded-xl"
        :align="breakpoints.isGreaterOrEqual('md') ? 'end' : 'center'"
      >
        <template v-if="shouldRenderCustomizer">
          <Suspense>
            <template #default>
              <ThemeCustomizer />
            </template>
            <template #fallback>
              <div class="flex items-center justify-center py-10 text-sm text-muted-foreground">
                Loading theme tools…
              </div>
            </template>
          </Suspense>
        </template>
        <div
          v-else
          class="flex items-center justify-center py-10 text-sm text-muted-foreground"
        >
          Preparing theme tools…
        </div>
      </UiPopoverContent>
    </UiPopover>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import Icon from "./Icon.vue";

const props = defineProps<{ triggerClass?: string }>();

const triggerClass = computed(() => props.triggerClass ?? "");

const breakpoints = useBreakpoints(breakpointsTailwind);

const ThemeCustomizer = defineAsyncComponent(() => import("./ThemeCustomizer.vue"));

const shouldRenderCustomizer = ref(false);

function ensureCustomizerReady() {
  if (shouldRenderCustomizer.value) {
    return;
  }

  shouldRenderCustomizer.value = true;
}

function handleTriggerInteraction() {
  ensureCustomizerReady();
}

onMounted(() => {
  if (typeof window === "undefined") {
    return;
  }

  const { requestIdleCallback } = window as Window & {
    requestIdleCallback?: (callback: () => void) => number;
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(ensureCustomizerReady);
    return;
  }

  window.setTimeout(ensureCustomizerReady, 1500);
});
</script>
