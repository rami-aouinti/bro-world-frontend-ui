<template>
  <v-app
  >
    <AppTopBar
      v-if="showNavigation"
      ref="topBarRef"
      :app-icons="appIcons"
      :is-dark="isDark"
      :is-mobile="isMobile"
      :locale="locale"
      :locales="availableLocales"
      :show-right-toggle="showRightWidgets"
      @toggle-left="toggleLeftDrawer"
      @toggle-right="toggleRightDrawer"
      @toggle-theme="toggleTheme"
      @go-back="goBack"
      @refresh="refreshPage"
      @update:locale="handleLocaleChange"
    />

    <!-- LEFT DRAWER -->
    <v-navigation-drawer
      v-if="showNavigation"
      v-model="leftDrawer"
      app
      :permanent="!isMobile"
      :temporary="isMobile"
      :scrim="isMobile"
      location="start"
      width="320"
      class="app-drawer"
      :style="drawerInlineStyle"
    >
      <ClientOnly>
        <ParticlesBg
          class="sidebar-default-card__particles"
          :quantity="50"
          :ease="50"
          :staticity="12"
          refresh
        />
        <template #fallback>
          <span
            class="sidebar-default-card__particles"
            aria-hidden="true"
          />
        </template>
      </ClientOnly>
      <div class="pane-scroll py-4">
        <slot
          name="left-sidebar"
          :items="sidebarItems"
          :variant="sidebarVariant"
          :active-key="activeSidebar"
          :on-select="handleSidebarSelect"
        >
          <AppSidebar
            :is-dark="isDark"
            :items="sidebarItems"
            :variant="sidebarVariant"
            :active-key="activeSidebar"
            @select="handleSidebarSelect"
          />
        </slot>
      </div>
    </v-navigation-drawer>

    <!-- RIGHT DRAWER -->
    <v-navigation-drawer
      v-if="showNavigation"
      v-model="rightDrawer"
      app
      :permanent="!isMobile"
      :temporary="isMobile"
      :scrim="canShowRightWidgets && isMobile"
      location="end"
      width="340"
      class="app-drawer"
      data-test="app-right-drawer"
      :style="drawerInlineStyle"
    >
      <ClientOnly>
        <ParticlesBg
          v-if="canShowRightWidgets"
          class="sidebar-default-card__particles"
          :quantity="50"
          :ease="50"
          :staticity="12"
          refresh
        />
        <template #fallback>
          <span
            class="sidebar-default-card__particles"
            aria-hidden="true"
          />
        </template>
      </ClientOnly>
      <Suspense
        @resolve="handleRightDrawerResolve"
        @pending="handleRightDrawerPending"
      >
        <template #default>
          <div class="right-drawer-wrapper">
            <ClientOnly>
              <div
                v-if="canShowRightWidgets"
                class="pane-scroll"
                :class="{ hidden: !shouldRenderRightSidebarContent }"
                :aria-hidden="!shouldRenderRightSidebarContent"
              >
                <AppSidebarRight
                  v-if="shouldRenderRightSidebarContent"
                  :is-dark="isDark"
                  :items="sidebarItems"
                  :active-key="activeSidebar"
                  :eager="rightDrawer"
                  @select="handleSidebarSelect"
                >
                  <slot
                    name="right-sidebar"
                    :weather="weather"
                    :leaderboard="leaderboard"
                    :rating="rating"
                    :user="user"
                  >
                    <div
                      v-if="rightSidebarContent"
                      :class="rightSidebarContent.wrapperClass ?? 'flex flex-col gap-6'"
                    >
                      <component
                        :is="rightSidebarContent.component"
                        v-bind="rightSidebarContent.props"
                      />
                    </div>
                    <div
                      v-else
                      class="flex flex-col gap-6"
                    >
                      <SidebarWeatherCard
                        v-if="weather"
                        :weather="weather"
                      />
                      <SidebarLeaderboardCard
                        v-if="leaderboard"
                        :title="leaderboard.title"
                        :live-label="leaderboard.live"
                        :participants="leaderboard.participants"
                      />
                      <SidebarRatingCard
                        v-if="rating"
                        :rating="rating"
                      />
                    </div>
                  </slot>
                </AppSidebarRight>
              </div>
              <template #fallback>
                <div
                  v-if="canShowRightWidgets"
                  class="pane-scroll px-3 py-4"
                >
                  <div class="flex flex-col gap-6">
                    <v-skeleton-loader
                      type="list-item-two-line"
                      class="rounded-2xl"
                    />
                    <v-skeleton-loader
                      v-for="index in 2"
                      :key="index"
                      type="card"
                      class="rounded-2xl"
                    />
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </template>
        <template #fallback>
          <div class="right-drawer-wrapper">
            <div
              v-if="canShowRightWidgets"
              class="pane-scroll px-3 py-4"
            >
              <div class="flex flex-col gap-6">
                <v-skeleton-loader
                  type="list-item-two-line"
                  class="rounded-2xl"
                />
                <v-skeleton-loader
                  v-for="index in 2"
                  :key="index"
                  type="card"
                  class="rounded-2xl"
                />
              </div>
            </div>
          </div>
        </template>
      </Suspense>
    </v-navigation-drawer>

    <v-main class="app-surface">
      <div class="main-scroll pane-scroll">
        <ClientOnly>
          <ParticlesBg
            class="sidebar-default-card__particles"
            :quantity="120"
            :ease="120"
            :staticity="12"
            refresh
          />
          <template #fallback>
            <span
              class="sidebar-default-card__particles"
              aria-hidden="true"
            />
          </template>
        </ClientOnly>
        <div
          v-show="areSidebarsReady"
          class="app-container"
          :aria-hidden="!areSidebarsReady"
        >
          <slot />
        </div>
        <div
          v-show="!areSidebarsReady"
          class="app-container py-6"
          :aria-hidden="areSidebarsReady"
        >
          <div class="flex flex-col gap-4">
            <v-skeleton-loader
              type="heading"
              class="rounded-2xl"
            />
            <v-skeleton-loader
              v-for="index in 3"
              :key="index"
              type="article"
              class="rounded-2xl"
            />
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch, computed, ref, defineAsyncComponent, onMounted, nextTick } from "vue";
import { useDisplay, useTheme } from "vuetify";
import { useRequestHeaders, useState } from "#imports";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopBar from "@/components/layout/AppTopBar.vue";
import { useRightSidebarData } from "@/composables/useRightSidebarData";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useCookieColorMode } from "~/composables/useCookieColorMode";
import type { LayoutSidebarItem } from "~/lib/navigation/sidebar";
import {
  ADMIN_ROLE_KEYS,
  buildSidebarItems,
  buildProfileSidebarItems,
} from "~/lib/navigation/sidebar";
import { useAuthSession } from "~/stores/auth-session";
import SidebarWeatherCard from "~/components/layout/SidebarWeatherCard.vue";
import SidebarLeaderboardCard from "~/components/layout/SidebarLeaderboardCard.vue";
import SidebarRatingCard from "~/components/layout/SidebarRatingCard.vue";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings, SiteThemeDefinition } from "~/types/settings";

const AppSidebarRight = defineAsyncComponent({
  loader: () => import("~/components/layout/AppSidebarRight.vue"),
  suspensible: false,
});

const colorMode = useCookieColorMode();

const colorSchemeHint = import.meta.server
  ? ((useRequestHeaders(["sec-ch-prefers-color-scheme"])["sec-ch-prefers-color-scheme"] ?? null) as
      | "light"
      | "dark"
      | null)
  : null;
const layoutClientHints = import.meta.server
  ? useRequestHeaders(["sec-ch-viewport-width", "sec-ch-ua-mobile"])
  : null;
const viewportWidthHint = import.meta.server
  ? Number.parseInt(layoutClientHints?.["sec-ch-viewport-width"] ?? "", 10)
  : null;
const resolvedViewportWidth =
  typeof viewportWidthHint === "number" && Number.isFinite(viewportWidthHint)
    ? viewportWidthHint
    : null;
const mobileUaHint = import.meta.server ? (layoutClientHints?.["sec-ch-ua-mobile"] ?? null) : null;

const initialResolvedColorMode = useState<"light" | "dark">("layout-initial-color-mode", () => {
  if (colorMode.value === "dark" || colorMode.value === "light") {
    return colorMode.value;
  }

  if (colorSchemeHint === "dark") {
    return "dark";
  }

  return "light";
});

const isHydrated = ref(false);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

const resolvedColorMode = computed<"light" | "dark">(() => {
  if (colorMode.value === "dark" || colorMode.value === "light") {
    return colorMode.value;
  }

  if (!isHydrated.value) {
    return initialResolvedColorMode.value;
  }

  return colorMode.system.value === "dark" ? "dark" : "light";
});

const isDark = computed(() => resolvedColorMode.value === "dark");
const themeName = computed(() => (isDark.value ? "dark" : "light"));
const vuetifyTheme = useTheme();

watch(
  themeName,
  (name) => {
    if (vuetifyTheme.name.value !== name) {
      vuetifyTheme.change(name);
    }
  },
  { immediate: true },
);

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const showNavigation = computed(() => currentRoute.value?.meta?.showNavbar !== false);
const { rightSidebarContent } = useLayoutRightSidebar();
const topBarRef = ref<InstanceType<typeof AppTopBar> | null>(null);

const initialShowRightWidgets = useState(
  "layout-initial-show-right-widgets",
  () => currentRoute.value?.meta?.showRightWidgets !== false,
);
const display = useDisplay();
const initialIsMobile = useState("layout-initial-is-mobile", () => {
  if (import.meta.server) {
    if (mobileUaHint === "?1") {
      return true;
    }

    if (mobileUaHint === "?0") {
      return false;
    }

    if (resolvedViewportWidth !== null) {
      const { sm } = display.thresholds.value;
      return resolvedViewportWidth < sm;
    }
  }

  return display.mobile.value;
});
const { locale, availableLocales, setLocale } = useI18n();
const auth = useAuthSession();

const leftDrawerState = ref(showNavigation.value && !initialIsMobile.value);
const rightDrawerState = ref(
  showNavigation.value && !initialIsMobile.value && initialShowRightWidgets.value,
);

const isLeftDrawerReady = ref(import.meta.server || !showNavigation.value);

const isTopBarReady = ref(import.meta.server || !showNavigation.value);

if (import.meta.client) {
  onMounted(() => {
    if (!showNavigation.value) {
      isLeftDrawerReady.value = true;
      isTopBarReady.value = true;
      return;
    }

    isLeftDrawerReady.value = true;
    isTopBarReady.value = Boolean(topBarRef.value);
  });
}

const leftDrawer = computed({
  get() {
    return leftDrawerState.value;
  },
  set(value: boolean) {
    leftDrawerState.value = value;
  },
});

const rightDrawer = computed({
  get() {
    return rightDrawerState.value;
  },
  set(value: boolean) {
    rightDrawerState.value = value;
  },
});

const drawerInlineStyle = computed(() => ({
  "z-index": isHydrated.value ? 1004 : 1006,
}));
const isMobile = computed(() => {
  if (!isHydrated.value) {
    return initialIsMobile.value;
  }

  return display.mobile.value;
});
// rail facultatif: quand mdAndDown mais pas mobile complet
const showRightWidgets = computed(() => {
  const hasDynamicSidebarContent = Boolean(rightSidebarContent.value);

  if (!isHydrated.value) {
    return initialShowRightWidgets.value || hasDynamicSidebarContent;
  }

  const metaAllowsSidebar = currentRoute.value?.meta?.showRightWidgets !== false;
  return metaAllowsSidebar || hasDynamicSidebarContent;
});

const canShowRightWidgets = computed(() => showNavigation.value && showRightWidgets.value);

const isRightDrawerReady = ref(import.meta.server || !canShowRightWidgets.value);

const siteSettingsState = useSiteSettingsState();
const theme = useTheme();

watch(
  themeName,
  (value) => {
    theme.change(value);
  },
  { immediate: true },
);

const { data: fetchedSiteSettings } = await useAsyncData("site-settings", () =>
  $fetch<{ data: SiteSettings }>("/api/settings").then((response) => response.data),
);

watch(
  () => fetchedSiteSettings.value,
  (value) => {
    if (value) {
      siteSettingsState.value = value;
    }
  },
  { immediate: true },
);

const siteSettings = computed(() => siteSettingsState.value ?? getDefaultSiteSettings());

watch(
  () => siteSettings.value.ui,
  (ui) => {
    if (!ui) return;

    const desiredMode = ui.defaultThemeMode ?? "system";

    if (ui.allowThemeSwitching === false) {
      colorMode.value = desiredMode === "system" ? "auto" : desiredMode;
      return;
    }

    if (desiredMode !== "system" && colorMode.value === "auto") {
      colorMode.value = desiredMode;
    }
  },
  { immediate: true, deep: true },
);

const { weather: weatherData, leaderboard, rating } = useRightSidebarData();
const weather = computed(() => weatherData.value);
const activeTheme = computed<SiteThemeDefinition | null>(() => {
  const current = siteSettings.value;
  const found = current.themes.find((theme) => theme.id === current.activeThemeId);

  return found ?? current.themes[0] ?? null;
});

watch(
  activeTheme,
  (value) => {
    if (!value) return;

    theme.themes.value.light.colors.primary = value.primaryColor;
    theme.themes.value.dark.colors.primary = value.primaryColor;
    theme.themes.value.light.colors.secondary = value.accentColor;
    theme.themes.value.dark.colors.secondary = value.accentColor;
  },
  { immediate: true },
);

function filterUndefinedValues<T extends Record<string, string | undefined>>(variables: T) {
  return Object.fromEntries(
    Object.entries(variables)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, value as string]),
  ) as Record<string, string>;
}

const layoutInsets = computed(() => {
  if (!showNavigation.value) {
    return {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };
  }

  const top = "var(--app-bar-height)";
  const isDesktop = !isMobile.value;
  const left = isDesktop && leftDrawer.value ? "320px" : "0px";
  const right = isDesktop && canShowRightWidgets.value && rightDrawer.value ? "340px" : "0px";

  return {
    top,
    right,
    bottom: "0px",
    left,
  };
});

const appIcons = [
  { name: "mdi-school-outline", label: "layout.appIcons.academy", size: 22, to: "/academy" },
  { name: "mdi-briefcase-outline", label: "layout.appIcons.briefcase" },
  { name: "mdi-store-outline", label: "layout.appIcons.store" },
  { name: "mdi-database", label: "layout.appIcons.database" },
  { name: "mdi-gamepad-variant-outline", label: "layout.appIcons.game" },
];

const canAccessAdmin = computed(() => {
  if (!auth.isAuthenticated.value) return false;
  const roles = auth.currentUser.value?.roles ?? [];
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role));
});

const sidebarVariant = computed<"default" | "profile">(() =>
  currentRoute.value?.meta?.sidebarVariant === "profile" ? "profile" : "default",
);

const isAdminRoute = computed(() => currentRoute.value?.path?.startsWith("/admin") ?? false);

const sidebarItems = computed<LayoutSidebarItem[]>(() => {
  if (sidebarVariant.value === "profile") {
    return buildProfileSidebarItems(siteSettings.value.profile);
  }

  const items = buildSidebarItems(siteSettings.value, canAccessAdmin.value);
  const adminItem = items.find((item) => item.key === "admin");

  if (isAdminRoute.value && canAccessAdmin.value) {
    return adminItem?.children ?? [];
  }

  if (adminItem) {
    return items.filter((item) => item.key !== "admin");
  }

  return items;
});

const activeSidebar = ref("");

/** Données de démonstration pour ProfileSidebar */
const user = computed(() => auth.currentUser.value ?? null);

function handleRightDrawerPending() {
  if (import.meta.server) return;
  isRightDrawerReady.value = false;
}

function handleRightDrawerResolve() {
  isRightDrawerReady.value = true;
}

const shouldRenderRightSidebarContent = computed(
  () => canShowRightWidgets.value && rightDrawer.value,
);

const areSidebarsReady = computed(() => {
  if (!showNavigation.value) {
    return isTopBarReady.value;
  }

  const rightReady = canShowRightWidgets.value ? isRightDrawerReady.value : true;
  return isTopBarReady.value && isLeftDrawerReady.value && rightReady;
});

watch(
  showNavigation,
  (visible) => {
    if (!visible) {
      isLeftDrawerReady.value = true;
      isTopBarReady.value = true;
      return;
    }

    if (import.meta.client) {
      isLeftDrawerReady.value = false;
      isTopBarReady.value = Boolean(topBarRef.value);
      nextTick(() => {
        isLeftDrawerReady.value = true;
      });
      return;
    }

    isLeftDrawerReady.value = true;
    isTopBarReady.value = true;
  },
  { immediate: true },
);

if (import.meta.client) {
  watch(
    () => topBarRef.value,
    (instance) => {
      if (instance && showNavigation.value) {
        isTopBarReady.value = true;
      }
    },
    { immediate: true },
  );
}

/** Réactivité aux points de rupture / route */
watch(
  [isMobile, showNavigation],
  ([mobile, navigationVisible]) => {
    if (!navigationVisible) {
      leftDrawer.value = false;
      rightDrawer.value = false;
      return;
    }

    if (mobile) {
      leftDrawer.value = false;
      rightDrawer.value = false;
      return;
    }

    leftDrawer.value = true;
    rightDrawer.value = canShowRightWidgets.value;
  },
  { immediate: true },
);

watch(canShowRightWidgets, (value) => {
  if (!value) {
    rightDrawer.value = false;
    isRightDrawerReady.value = true;
    return;
  }

  isRightDrawerReady.value = import.meta.server;
  if (!isMobile.value) {
    rightDrawer.value = true;
  }
});

watch(
  () => currentRoute.value?.fullPath ?? "",
  (path) => {
    if (isMobile.value) {
      leftDrawer.value = false;
      rightDrawer.value = false;
    }
    updateActiveSidebar(path, sidebarItems.value);
  },
  { immediate: true },
);

watch(
  sidebarItems,
  (items) => {
    const path = currentRoute.value?.fullPath ?? "/";
    updateActiveSidebar(path, items);
  },
  { immediate: true },
);

/** Actions UI */
function toggleTheme() {
  colorMode.value = resolvedColorMode.value === "dark" ? "light" : "dark";
}
function toggleLeftDrawer() {
  if (!showNavigation.value) return;
  leftDrawer.value = !leftDrawer.value;
}
function toggleRightDrawer() {
  if (!canShowRightWidgets.value) return;
  rightDrawer.value = !rightDrawer.value;
}
function goBack() {
  router.back();
}
function refreshPage() {
  refreshNuxtData();
}
function handleSidebarSelect(key: string) {
  activeSidebar.value = key;
  if (isMobile.value) leftDrawer.value = false;
}
async function handleLocaleChange(newLocale: string) {
  await setLocale(newLocale);
}

/** Helpers routes */
function findActiveSidebarKey(path: string, items: LayoutSidebarItem[]): string | null {
  let bestMatch: { key: string; score: number } | null = null;

  for (const item of items) {
    if (item.children?.length) {
      const childMatch = findActiveSidebarKey(path, item.children);
      if (childMatch && (!bestMatch || childMatch.score > bestMatch.score)) {
        bestMatch = childMatch;
      }
    }

    if (!item.to) continue;

    const score = getRouteMatchScore(path, item.to);
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key: item.key, score };
    }
  }

  return bestMatch?.key ?? null;
}

function getRouteMatchScore(path: string, target: string) {
  if (target === "/") {
    return path === "/" || path.startsWith("/?") ? 1 : 0;
  }

  if (path === target) {
    return target.length + 1000;
  }

  if (path.startsWith(`${target}/`) || path.startsWith(`${target}?`)) {
    return target.length;
  }

  return 0;
}

function updateActiveSidebar(path: string, items: LayoutSidebarItem[]) {
  const matchedKey = findActiveSidebarKey(path, items);
  if (matchedKey) {
    activeSidebar.value = matchedKey;
    return;
  }

  activeSidebar.value = "";
}
</script>

<style scoped>
.app-surface {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  min-height: 100vh;
  background: transparent;
  overflow: hidden;
}

.app-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  background: transparent;
  opacity: 0.9;
  pointer-events: none;
  transform: translateZ(0);
  z-index: 0;
}

.app-drawer {
  border-color: transparent;
}

.pane-scroll {
  height: calc(100vh - var(--app-bar-height));
  overflow-y: auto;
  scrollbar-gutter: stable both-edges;
}

.right-drawer-wrapper {
  display: contents;
}

.main-scroll {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: calc(100vh - var(--app-bar-height));
  display: flex;
  flex-direction: column;
}

.app-container {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  width: 100%;
  max-width: min(1120px, 100%);
  margin-inline: auto;
  box-sizing: border-box;
  padding: 10px;
}
.sidebar-default-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

/* Responsive */
@media (max-width: 960px) {
  .app-container {
    border-radius: 24px;
    padding: clamp(20px, 6vw, 32px);
  }
}
</style>
