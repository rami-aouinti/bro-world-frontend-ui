<template>
  <template v-if="enable">
    <UiButton
      v-if="style === 'input'"
      v-bind="forwardedAttrs"
      :theme="buttonTheme"
      variant="outline"
      class="text-muted-foreground hover:text-accent-foreground h-8 w-full self-center rounded-full border border-input bg-background/60 pr-1.5 font-normal"
      :class="[inAside ? 'mb-4' : 'md:w-40 lg:w-60', rootClass]"
      @click="isOpen = true"
    >
      <span class="mr-auto overflow-hidden">
        {{ placeholder }}
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
import { useI18n } from "vue-i18n";
import { useState } from "#imports";
import { useCookieColorMode } from "~/composables/useCookieColorMode";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const config = useConfig();
const colorMode = useCookieColorMode();
const { t, te } = useI18n();

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
const fallbackPlaceholderKey = "layout.search.placeholder";

const placeholder = computed(() => {
  const configuredPlaceholder = searchConfig.value.placeholder;

  if (typeof configuredPlaceholder === "string") {
    if (te(configuredPlaceholder)) {
      return t(configuredPlaceholder);
    }

    if (configuredPlaceholder.trim().length > 0) {
      return configuredPlaceholder;
    }
  }

  return t(fallbackPlaceholderKey);
});

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
