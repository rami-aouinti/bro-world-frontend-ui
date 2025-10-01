<template>
  <template v-if="enable">
    <UiButton
      v-if="style === 'input'"
      v-bind="forwardedAttrs"
      :theme="buttonTheme"
      variant="outline"
      class="text-muted-foreground hover:text-accent-foreground h-8 w-full self-center rounded-md pr-1.5 font-normal"
      :class="[inAside ? 'mb-4' : 'md:w-40 lg:w-60', rootClass]"
      @click="isOpen = true"
    >
      <span class="mr-auto overflow-hidden">
        {{ $t(placeholder) }}
      </span>
      <Kbd class="ml-auto hidden md:block"> <span class="text-xs">⌘</span>K </Kbd>
    </UiButton>
    <UiButton
      v-else
      v-bind="forwardedAttrs"
      :theme="buttonTheme"
      variant="ghost"
      size="icon"
      :class="rootClass"
      @click="isOpen = true"
    >
      <Icon
        name="lucide:search"
        size="18"
      />
    </UiButton>
  </template>

  <LayoutSearchDialog v-model:open="isOpen" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useAttrs } from "vue";
import { useState } from "#imports";
import { useCookieColorMode } from "~/composables/useCookieColorMode";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const config = useDocsConfig();
const colorMode = useCookieColorMode();

const isOpen = ref<boolean | undefined>(false);
const isHydrated = ref(false);
const initialTheme = useState<"light" | "dark">("layout-search-button-theme", () =>
  colorMode.value === "dark" ? "dark" : "light",
);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

const searchConfig = computed(() => config.value.search);
const enable = computed(() => searchConfig.value.enable);
const inAside = computed(() => searchConfig.value.inAside);
const style = computed(() => searchConfig.value.style);
const placeholder = computed(() => searchConfig.value.placeholder);

const resolvedMode = computed<"light" | "dark">(() => {
  if (colorMode.value === "dark") {
    return "dark";
  }

  if (colorMode.value === "light") {
    return "light";
  }

  return colorMode.system.value === "dark" ? "dark" : "light";
});

const buttonTheme = computed(() => (isHydrated.value ? resolvedMode.value : initialTheme.value));

const rootClass = computed(() => attrs.class);
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>;

  return rest;
});
</script>
