<template>
  <UiPopover>
    <UiPopoverTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon"
        :class="triggerClass"
        type="button"
        aria-label="Toggle theme customization"
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
      <ThemeCustomizer />
    </UiPopoverContent>
  </UiPopover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import ThemeCustomizer from "./ThemeCustomizer.vue";
import Icon from "./Icon.vue";

const props = defineProps<{ triggerClass?: string }>();

const triggerClass = computed(() => props.triggerClass ?? "");

const breakpoints = useBreakpoints(breakpointsTailwind);
</script>
