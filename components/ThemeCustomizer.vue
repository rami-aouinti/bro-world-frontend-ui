<template>
  <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
  >
    <div class="grid gap-6">
    <div class="space-y-1">
      <h5 class="text-foreground text-lg font-semibold">
        {{ $t("Customize") }}
      </h5>
    </div>
    <div class="space-y-1">
      <UiLabel>{{ $t("Color") }}</UiLabel>
      <div class="grid grid-cols-4 gap-2">
        <template
          v-for="color in allColors"
          :key="color"
        >
          <UiButton
            class="justify-start gap-2"
            variant="outline"
            :class="{ 'border-primary border-2': theme === color }"
            @click="setTheme(color)"
          >
            <span
              class="flex size-5 items-center justify-center rounded-full"
              :style="{ backgroundColor: backgroundColor(color) }"
            >
              <Icon
                v-if="theme === color"
                name="lucide:check"
                size="16"
                class="text-white"
              />
            </span>
            <span class="text-xs capitalize">{{ color }}</span>
          </UiButton>
        </template>
      </div>
    </div>
    <div class="space-y-1">
      <UiLabel>{{ $t("Radius") }}</UiLabel>
      <div class="grid grid-cols-5 gap-2">
        <template
          v-for="r in RADII"
          :key="r"
        >
          <UiButton
            class="justify-center gap-2"
            variant="outline"
            :class="{ 'border-primary border-2': radius === r }"
            @click="setRadius(r)"
          >
            <span class="text-xs capitalize">{{ r }}</span>
          </UiButton>
        </template>
      </div>
    </div>
    <div class="space-y-1">
      <UiLabel>{{ $t("admin.settings.fields.themePrimary") }}</UiLabel>
      <div class="grid grid-cols-4 gap-2">
        <template
          v-for="option in primaryColorOptions"
          :key="option.hex"
        >
          <UiButton
            class="justify-start gap-2"
            variant="outline"
            :class="{ 'border-primary border-2': selectedPrimaryHex === option.hex }"
            type="button"
            @click="handleSelectPrimary(option.hex)"
          >
            <span
              class="flex size-5 items-center justify-center rounded-full"
              :style="{ backgroundColor: option.hex }"
            >
              <Icon
                v-if="selectedPrimaryHex === option.hex"
                name="lucide:check"
                size="16"
                class="text-white"
              />
            </span>
            <span class="text-xs capitalize">{{ option.label }}</span>
          </UiButton>
        </template>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono uppercase text-muted-foreground">{{ selectedPrimaryHex }}</span>
        <UiButton
          variant="outline"
          type="button"
          :disabled="!isCustomPrimary"
          @click="handleResetPrimary"
        >
          {{ $t("admin.settings.actions.reset") }}
        </UiButton>
      </div>
    </div>
    <div
      v-if="darkModeToggle"
      class="space-y-1.5"
    >
      <UiLabel>{{ $t("Theme") }}</UiLabel>
      <div class="grid grid-cols-3 gap-2">
        <UiButton
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': activeMode === 'light' }"
          @click="setColorPreference('light')"
        >
          <Icon
            name="lucide:sun"
            size="16"
          />
          <span class="text-xs capitalize">{{ $t("Light") }}</span>
        </UiButton>
        <UiButton
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': activeMode === 'dark' }"
          @click="setColorPreference('dark')"
        >
          <Icon
            name="lucide:moon"
            size="16"
          />
          <span class="text-xs capitalize">{{ $t("Dark") }}</span>
        </UiButton>
        <UiButton
          class="justify-center gap-2"
          variant="outline"
          :class="{ 'border-primary border-2': activeMode === 'system' }"
          @click="setColorPreference('system')"
        >
          <Icon
            name="lucide:monitor"
            size="16"
          />
          <span class="text-xs capitalize">{{ $t("System") }}</span>
        </UiButton>
      </div>
    </div>
  </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import type { Theme } from "shadcn-docs-nuxt/lib/themes";
import { themes } from "shadcn-docs-nuxt/lib/themes";
import Icon from "./Icon.vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const {
  themeClass,
  theme,
  radius,
  themePrimaryHex,
  defaultThemePrimaryHex,
  isCustomThemePrimary,
  themePrimaryOptions,
  setTheme,
  setRadius,
  setThemePrimaryHex,
  resetThemePrimaryHex,
} = useThemes();
const { darkModeToggle } = useConfig().value.header;
const colorMode = useCookieColorMode();

const allColors: Theme["name"][] = [
  "zinc",
  "rose",
  "blue",
  "green",
  "orange",
  "red",
  "slate",
  "stone",
  "gray",
  "neutral",
  "yellow",
  "violet",
];

const RADII = [0, 0.25, 0.5, 0.75, 1];
const themeNames = themes.map((candidate) => candidate.name);

const activeMode = computed(() => (colorMode.value === "auto" ? "system" : colorMode.value));

const primaryColorOptions = computed(() =>
  themePrimaryOptions.value.map((option) => ({
    ...option,
    hex: option.hex.toUpperCase(),
  })),
);

const selectedPrimaryHex = computed(
  () => themePrimaryHex.value?.toUpperCase() ?? defaultThemePrimaryHex.value?.toUpperCase() ?? "#E91E63",
);
const isCustomPrimary = computed(() => isCustomThemePrimary.value);

watch(
  theme,
  () => {
    if (!import.meta.client) {
      return;
    }
    setClassTheme();
  },
  { immediate: true },
);

watch(
  radius,
  () => {
    if (!import.meta.client) {
      return;
    }
    setStyleRadius();
  },
  { immediate: true },
);

function setClassTheme() {
  const classList = document.body.classList;
  classList.remove(...themeNames.map((name) => `theme-${name}`));
  classList.add(themeClass.value);
}

function setStyleRadius() {
  document.body.style.setProperty("--radius", `${radius.value}rem`);
}

function setColorPreference(mode: "light" | "dark" | "system") {
  colorMode.value = mode === "system" ? "auto" : mode;
}

function backgroundColor(color: Theme["name"]) {
  const matchedTheme = themes.find((candidate) => candidate.name === color);
  const activeColor = matchedTheme?.activeColor.light;

  if (!activeColor) {
    return undefined;
  }

  return `hsl(${activeColor})`;
}

function handleResetPrimary() {
  resetThemePrimaryHex();
}

function handleSelectPrimary(hex: string) {
  setThemePrimaryHex(hex);
}
</script>
