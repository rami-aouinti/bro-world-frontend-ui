<template>
  <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
  >
    <div class="grid gap-6">
    <div class="grid space-y-1">
      <h1 class="text-foreground text-lg font-semibold">
        {{ $t("Customize") }}
      </h1>
      <p class="text-muted-foreground text-sm">
        {{ $t("Pick a style and color for the docs.") }}
      </p>
    </div>
    <div class="space-y-1.5">
      <UiLabel>{{ $t("Color") }}</UiLabel>
      <div class="grid grid-cols-3 gap-2">
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
    <div class="space-y-1.5">
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

const { themeClass, theme, radius, setTheme, setRadius } = useThemes();
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
</script>
