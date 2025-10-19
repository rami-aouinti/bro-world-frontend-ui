<template>
  <v-app
    :style="appInlineStyle"
    :theme="themeName"
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
      :refreshing="isRefreshing"
      @toggle-left="toggleLeftDrawer"
      @toggle-right="toggleRightDrawer"
      @toggle-theme="toggleTheme"
      @go-back="goBack"
      @refresh="refreshPage"
      @update:locale="handleLocaleChange"
    />

    <div
      id="menu-bar-world"
      class="menu-bar-world-slot"
    />

    <!-- LEFT DRAWER -->
    <v-navigation-drawer
      v-if="showNavigation"
      v-model="leftDrawer"
      app
      :mobile="isMobile"
      :permanent="!isMobile"
      :temporary="isMobile"
      :scrim="isMobile"
      location="start"
      width="320"
      class="app-drawer"
      :style="drawerInlineStyle"
    >
      <template v-if="isHydrated && shouldRenderParticles">
        <ParticlesBg
          ref="leftParticlesRef"
          class="sidebar-default-card__particles"
          :quantity="30"
          :ease="40"
          :staticity="12"
          :auto-start="false"
          refresh
        />
      </template>
      <span
        v-else
        class="sidebar-default-card__particles"
        aria-hidden="true"
      />
      <div class="pane-scroll py-5">
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
      :mobile="isMobile"
      :permanent="!isMobile"
      :temporary="isMobile"
      :scrim="canShowRightWidgets && isMobile"
      location="end"
      width="340"
      class="app-drawer"
      data-test="app-right-drawer"
      :style="drawerInlineStyle"
    >
      <template v-if="isHydrated && canShowRightWidgets && shouldRenderParticles">
        <ParticlesBg
          ref="rightParticlesRef"
          class="sidebar-default-card__particles"
          :quantity="30"
          :ease="40"
          :staticity="12"
          :auto-start="false"
          refresh
        />
      </template>
      <span
        v-else-if="canShowRightWidgets"
        class="sidebar-default-card__particles"
        aria-hidden="true"
      />
      <Suspense
        @resolve="handleRightDrawerResolve"
        @pending="handleRightDrawerPending"
      >
        <template #default>
          <div class="right-drawer-wrapper">
            <template v-if="isHydrated">
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
                      v-else-if="shouldShowDashboardRightSidebar"
                      class="flex flex-col gap-6"
                    >
                      <SidebarWeatherCard
                        v-if="weather"
                        :weather="weather"
                      />
                      <SidebarLeaderboardCard
                        v-if="leaderboard.participants.length > 0"
                        :title="leaderboard.title"
                        :live-label="leaderboard.live"
                        :participants="leaderboard.participants"
                      />
                      <SidebarRatingCard
                        v-if="rating"
                        :rating="{
                          title: rating.title,
                          subtitle: rating.subtitle,
                          icon: rating.icon,
                        }"
                      />
                      <SidebarContactCard v-if="shouldShowContactSidebarCard" />
                    </div>
                  </slot>
                </AppSidebarRight>
              </div>
            </template>
            <template v-else>
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
      <div
        ref="mainParticlesContainerRef"
        class="main-scroll py-4"
      >
        <template v-if="isHydrated && shouldRenderParticles">
          <ParticlesBg
            ref="mainParticlesRef"
            class="sidebar-default-card__particles"
            :quantity="90"
            :ease="100"
            :staticity="12"
            :auto-start="false"
            refresh
          />
        </template>
        <span
          v-else
          class="sidebar-default-card__particles"
          aria-hidden="true"
        />
        <div
          class="main-scroll__viewport"
          :style="mainInlineStyle"
        >
          <div
            class="app-container-wrapper"
            :class="{ 'app-container-wrapper--loading': !areSidebarsReady }"
          >
            <div
              class="app-container app-container--content"
              :class="{ 'app-container--content-hidden': !areSidebarsReady }"
              :aria-hidden="!areSidebarsReady"
              :inert="!areSidebarsReady ? '' : undefined"
            >
              <slot />
            </div>
            <div
              v-if="!areSidebarsReady"
              class="app-container app-container--skeleton py-6"
              aria-hidden="true"
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
        </div>
      </div>
    </v-main>
    <ClientOnly>
      <component
        :is="LazyAnalytics"
        v-if="shouldRenderAnalytics"
      />
      <component
        :is="LazySpeedInsights"
        v-if="shouldRenderSpeedInsights"
      />
    </ClientOnly>
  </v-app>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useDisplay, useTheme } from "vuetify";
import { useRequestHeaders, useState, refreshNuxtData, useCookie } from "#imports";
import { useIntersectionObserver, useResizeObserver } from "@vueuse/core";
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
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings, SiteThemeDefinition } from "~/types/settings";
import { withSecureCookieOptions } from "~/lib/cookies";
import { applyPrimaryColorCssVariables, normalizeHexColor } from "~/lib/theme/colors";
import type { RightSidebarPreset } from "~/types/right-sidebar";
import AppTopBar from "@/components/layout/AppTopBar.vue";

const AppSidebar = defineAsyncComponent({
  loader: () => import("@/components/layout/AppSidebar.vue"),
  suspensible: false,
});

const AppSidebarRight = defineAsyncComponent({
  loader: () => import("~/components/layout/AppSidebarRight.vue"),
  suspensible: false,
});

const SidebarContactCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarContactCard.vue"),
  suspensible: false,
});

const SidebarWeatherCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarWeatherCard.vue"),
  suspensible: false,
});

const SidebarLeaderboardCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarLeaderboardCard.vue"),
  suspensible: false,
});

const SidebarRatingCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarRatingCard.vue"),
  suspensible: false,
});

const LazyAnalytics = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return defineComponent({
        name: "VercelAnalyticsPlaceholder",
        render: () => null,
      });
    }

    const module = await import("@vercel/analytics/vue");
    return module.Analytics;
  },
  suspensible: false,
});

const LazySpeedInsights = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return defineComponent({
        name: "SpeedInsightsPlaceholder",
        render: () => null,
      });
    }

    const module = await import("@vercel/speed-insights/nuxt");
    return module.SpeedInsights;
  },
  suspensible: false,
});

const shouldRenderAnalytics = ref(false);
const shouldRenderSpeedInsights = ref(false);

type ParticlesBgInstance = { start: () => void; stop: () => void };

const leftParticlesRef = ref<ParticlesBgInstance | null>(null);
const rightParticlesRef = ref<ParticlesBgInstance | null>(null);
const mainParticlesRef = ref<ParticlesBgInstance | null>(null);
const mainParticlesContainerRef = ref<HTMLElement | null>(null);
const isMainParticlesVisible = ref(false);
const shouldRenderParticles = ref(false);
const display = useDisplay();
const isLargeViewportForParticles = computed(() => {
  const mdThreshold = display.thresholds.value.md ?? 0;

  if (import.meta.server) {
    return false;
  }

  const width = display.width?.value;

  if (typeof width === "number" && Number.isFinite(width) && width > 0) {
    return width >= mdThreshold;
  }

  return !display.mobile.value;
});

type IdleScheduler = (callback: () => void, options?: { timeout?: number }) => void;

const scheduleIdleRender: IdleScheduler | null = import.meta.client
  ? (callback, options) => {
      const idleWindow = window as typeof window & {
        requestIdleCallback?: (
          cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
          opts?: { timeout?: number },
        ) => number;
      };

      if (typeof idleWindow.requestIdleCallback === "function") {
        idleWindow.requestIdleCallback(() => callback(), options);
        return;
      }

      const timeout = typeof options?.timeout === "number" ? options.timeout : 1;
      window.setTimeout(callback, timeout);
    }
  : null;

if (import.meta.client) {
  let hasScheduledParticlesRender = false;

  function scheduleParticlesRender() {
    if (shouldRenderParticles.value || hasScheduledParticlesRender) {
      return;
    }

    hasScheduledParticlesRender = true;

    scheduleIdleRender?.(
      () => {
        hasScheduledParticlesRender = false;
        if (isLargeViewportForParticles.value) {
          shouldRenderParticles.value = true;
        }
      },
      { timeout: 2000 },
    );
  }

  onMounted(() => {
    scheduleParticlesRender();

    scheduleIdleRender?.(
      () => {
        shouldRenderAnalytics.value = true;
      },
      { timeout: 4500 },
    );

    scheduleIdleRender?.(
      () => {
        shouldRenderSpeedInsights.value = true;
      },
      { timeout: 6500 },
    );
  });

  watch(
    () => isLargeViewportForParticles.value,
    (isLarge) => {
      if (isLarge && !shouldRenderParticles.value) {
        scheduleParticlesRender();
      }
    },
    { immediate: true },
  );
}

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

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const routeRightSidebarPreset = computed<RightSidebarPreset>(() => {
  const preset = currentRoute.value?.meta?.rightSidebarPreset;

  if (preset === "dashboard") {
    return "dashboard";
  }

  return "none";
});

const initialShowContactSidebarCard = useState(
  "layout-initial-show-contact-card",
  () => Boolean(currentRoute.value?.meta?.showContactSidebarCard),
);

const shouldShowContactSidebarCard = computed(() => {
  if (!isHydrated.value) {
    return initialShowContactSidebarCard.value;
  }

  return Boolean(currentRoute.value?.meta?.showContactSidebarCard);
});

const initialShowNavigation = useState(
  "layout-initial-show-navigation",
  () => currentRoute.value?.meta?.showNavbar !== false,
);

const showNavigation = computed(() => {
  if (!isHydrated.value) {
    return initialShowNavigation.value;
  }

  return currentRoute.value?.meta?.showNavbar !== false;
});
const { rightSidebarContent } = useLayoutRightSidebar();
const shouldShowDashboardRightSidebar = computed(
  () => routeRightSidebarPreset.value === "dashboard" && !rightSidebarContent.value,
);
const topBarRef = ref<InstanceType<typeof AppTopBar> | null>(null);
const DEFAULT_APP_BAR_HEIGHT = 72;
const DEFAULT_APP_BAR_HEIGHT_VALUE = `${DEFAULT_APP_BAR_HEIGHT}px`;
const topBarHeight = ref(showNavigation.value ? DEFAULT_APP_BAR_HEIGHT_VALUE : "0px");
const resolvedAppBarHeight = computed(() => (showNavigation.value ? topBarHeight.value : "0px"));

const initialShowRightWidgets = useState(
  "layout-initial-show-right-widgets",
  () => currentRoute.value?.meta?.showRightWidgets !== false,
);
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
const routeLoadingState = useState("route:loading", () => false);

const leftDrawerState = ref(showNavigation.value && !initialIsMobile.value);
const rightDrawerState = ref(
  showNavigation.value && !initialIsMobile.value && initialShowRightWidgets.value,
);

const isLeftDrawerReady = ref(!showNavigation.value);

const isTopBarReady = ref(!showNavigation.value);
const isRefreshing = ref(false);

const appInlineStyle = computed(() => ({
  "--app-bar-height": resolvedAppBarHeight.value,
}));

if (import.meta.client) {
  function getTopBarElement() {
    const instance = topBarRef.value;
    if (!instance) return null;
    const element = instance.$el as HTMLElement | null;
    return element instanceof HTMLElement ? element : null;
  }

  function applyTopBarHeight(height: number | null | undefined) {
    if (!showNavigation.value) {
      topBarHeight.value = "0px";
      return;
    }

    if (typeof height === "number" && Number.isFinite(height) && height > 0) {
      const nextValue = `${Math.round(height)}px`;
      if (topBarHeight.value !== nextValue) {
        topBarHeight.value = nextValue;
      }
      return;
    }

    if (topBarHeight.value !== DEFAULT_APP_BAR_HEIGHT_VALUE) {
      topBarHeight.value = DEFAULT_APP_BAR_HEIGHT_VALUE;
    }
  }

  function measureTopBarHeight() {
    const element = getTopBarElement();
    if (!element) {
      applyTopBarHeight(null);
      return;
    }

    applyTopBarHeight(element.getBoundingClientRect().height);
  }

  onMounted(() => {
    nextTick(measureTopBarHeight);
  });

  watch(showNavigation, (visible) => {
    if (!visible) {
      topBarHeight.value = "0px";
      return;
    }

    nextTick(measureTopBarHeight);
  });

  const topBarElement = computed(() => getTopBarElement());

  useResizeObserver(topBarElement, (entries) => {
    const entry = entries[0];
    if (!entry || !showNavigation.value) return;
    applyTopBarHeight(entry.contentRect.height);
  });
}

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
  "--app-bar-height": resolvedAppBarHeight.value,
  "z-index": isHydrated.value ? 1004 : 1006,
}));
const mainInlineStyle = computed(() => ({
  "--app-bar-height": resolvedAppBarHeight.value,
  "--layout-inset-top": layoutInsets.value.top,
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

if (import.meta.client) {
  const { stop: stopMainParticlesObserver } = useIntersectionObserver(
    mainParticlesContainerRef,
    (entries) => {
      const entry = entries[0];
      isMainParticlesVisible.value = Boolean(entry?.isIntersecting && entry.intersectionRatio > 0);
    },
    {
      threshold: [0, 0.25, 0.5],
    },
  );

  const stopLeftParticlesEffect = watchEffect(() => {
    const instance = leftParticlesRef.value;

    if (!instance) {
      return;
    }

    if (!shouldRenderParticles.value) {
      instance.stop();
      return;
    }

    if (isHydrated.value && showNavigation.value && leftDrawer.value) {
      instance.start();
    } else {
      instance.stop();
    }
  });

  const stopRightParticlesEffect = watchEffect(() => {
    const instance = rightParticlesRef.value;

    if (!instance) {
      return;
    }

    if (!shouldRenderParticles.value) {
      instance.stop();
      return;
    }

    if (
      isHydrated.value &&
      showNavigation.value &&
      canShowRightWidgets.value &&
      rightDrawer.value
    ) {
      instance.start();
    } else {
      instance.stop();
    }
  });

  const stopMainParticlesEffect = watchEffect(() => {
    const instance = mainParticlesRef.value;

    if (!instance) {
      return;
    }

    if (!shouldRenderParticles.value) {
      instance.stop();
      return;
    }

    if (isHydrated.value && isMainParticlesVisible.value) {
      instance.start();
    } else {
      instance.stop();
    }
  });

  onBeforeUnmount(() => {
    stopMainParticlesObserver();
    stopLeftParticlesEffect();
    stopRightParticlesEffect();
    stopMainParticlesEffect();
    leftParticlesRef.value?.stop();
    rightParticlesRef.value?.stop();
    mainParticlesRef.value?.stop();
  });
}

const isRightDrawerReady = ref(!canShowRightWidgets.value);

const siteSettingsState = useSiteSettingsState();

watch(
  themeName,
  (value) => {
    if (vuetifyTheme.name.value !== value) {
      vuetifyTheme.change(value);
    }
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

const themePrimaryCookie = useCookie<string | null>(
  "theme-primary",
  withSecureCookieOptions({
    sameSite: "lax",
  }),
);

watch(
  activeTheme,
  (value) => {
    if (!value) return;

    vuetifyTheme.themes.value.light.colors.primary = value.primaryColor;
    vuetifyTheme.themes.value.dark.colors.primary = value.primaryColor;
    vuetifyTheme.themes.value.light.colors.secondary = value.accentColor;
    vuetifyTheme.themes.value.dark.colors.secondary = value.accentColor;

    const normalizedThemePrimary = normalizeHexColor(value.primaryColor);
    const normalizedCookiePrimary = normalizeHexColor(themePrimaryCookie.value);
    const shouldAdoptThemePrimary =
      !normalizedCookiePrimary || normalizedCookiePrimary === normalizedThemePrimary;

    if (shouldAdoptThemePrimary) {
      if (import.meta.client) {
        themePrimaryCookie.value = normalizedThemePrimary ?? null;
      }
      applyPrimaryColorCssVariables(value.primaryColor);
    }
  },
  { immediate: true },
);

watch(themePrimaryCookie, (value, oldValue) => {
  if (normalizeHexColor(value)) {
    return;
  }

  if (normalizeHexColor(oldValue)) {
    const theme = activeTheme.value;

    if (theme) {
      applyPrimaryColorCssVariables(theme.primaryColor);
    }
  }
});

const layoutInsets = computed(() => {
  if (!showNavigation.value) {
    return {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };
  }

  const top = resolvedAppBarHeight.value || DEFAULT_APP_BAR_HEIGHT_VALUE;
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
  { name: "mdi:shopping-outline", label: "layout.appIcons.ecommerce", to: "/ecommerce" },
  { name: "mdi:school-outline", label: "layout.appIcons.education", to: "/education" },
  { name: "mdi:clipboard-text-outline", label: "layout.appIcons.quiz", to: "/quiz" },
  { name: "mdi:briefcase-outline", label: "layout.appIcons.briefcase" },
  { name: "mdi:database", label: "layout.appIcons.database" },
  { name: "mdi:gamepad-variant-outline", label: "layout.appIcons.game", to: "/game" },
];

const canAccessAdmin = computed(() => {
  if (!auth.isAuthenticated.value) return false;
  const roles = auth.currentUser.value?.roles ?? [];
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role));
});

const sidebarVariant = computed<"default" | "profile">(() =>
  currentRoute.value?.meta?.sidebarVariant === "profile" ? "profile" : "default",
);

type LoadingIndicator = ReturnType<typeof useLoadingIndicator>;
let loadingIndicator: LoadingIndicator | null = null;

if (import.meta.client) {
  loadingIndicator = useLoadingIndicator({ throttle: 0 });
}

const isAdminRoute = computed(() => {
  const path = currentRoute.value?.path ?? "";
  if (!path) return false;

  const segments = path.split("/").filter(Boolean);
  return segments.includes("admin");
});

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
  if (!isHydrated.value) {
    return true;
  }

  if (!showNavigation.value) {
    return true;
  }

  return isTopBarReady.value && isLeftDrawerReady.value;
});

/**
 * Centralise la réactivité autour de la navigation.
 * Chaque watcher met à jour un état réellement consommé :
 * - readiness : `areSidebarsReady` s'appuie sur `isTopBarReady` et `isLeftDrawerReady`
 * - tiroirs : `leftDrawer` / `rightDrawer` sont utilisés directement par les `<v-navigation-drawer>`
 * - surlignage : `activeSidebar` est injecté dans `<AppSidebar>` et `<AppSidebarRight>`
 */
function setupNavigationReactivity() {
  watch(
    () => [isHydrated.value, showNavigation.value],
    ([hydrated, visible]) => {
      if (!visible) {
        isLeftDrawerReady.value = true;
        isTopBarReady.value = true;
        return;
      }

      if (!hydrated) {
        isLeftDrawerReady.value = false;
        isTopBarReady.value = false;
        return;
      }

      if (!isHydrated.value) {
        return;
      }

      isTopBarReady.value = Boolean(topBarRef.value);
      nextTick(() => {
        isLeftDrawerReady.value = true;
      });
    },
    { immediate: import.meta.server },
  );

  if (import.meta.client) {
    watch(
      () => topBarRef.value,
      (instance) => {
        if (!isHydrated.value) return;
        if (instance && showNavigation.value) {
          isTopBarReady.value = true;
        }
      },
      { immediate: false },
    );
  }

  watch(
    () => [isHydrated.value, isMobile.value, showNavigation.value, canShowRightWidgets.value],
    ([hydrated, mobile, navigationVisible, canShowRight]) => {
      if (!hydrated) {
        return;
      }

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
      rightDrawer.value = canShowRight;
    },
    { immediate: import.meta.server },
  );

  watch(
    () => [isHydrated.value, canShowRightWidgets.value, isMobile.value],
    ([hydrated, value, mobile]) => {
      if (!hydrated) {
        return;
      }

      if (!value) {
        rightDrawer.value = false;
        isRightDrawerReady.value = true;
        return;
      }

      if (mobile) {
        rightDrawer.value = false;
        isRightDrawerReady.value = true;
        return;
      }

      isRightDrawerReady.value = false;
      rightDrawer.value = true;
    },
    { immediate: true },
  );

  watchEffect(() => {
    const hydrated = isHydrated.value;
    const items = sidebarItems.value;
    const path = currentRoute.value?.fullPath ?? "/";

    if (!hydrated) {
      if (import.meta.server) {
        updateActiveSidebar(path, items);
      }
      return;
    }

    if (isMobile.value) {
      leftDrawer.value = false;
      rightDrawer.value = false;
    }

    updateActiveSidebar(path, items);
  });
}

setupNavigationReactivity();

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
async function refreshPage() {
  if (isRefreshing.value) {
    return;
  }

  isRefreshing.value = true;
  routeLoadingState.value = true;

  try {
    if (loadingIndicator) {
      loadingIndicator.start();
    }
    await refreshNuxtData();
  } catch (error) {
    console.error("Failed to refresh page data", error);
  } finally {
    if (loadingIndicator) {
      loadingIndicator.finish();
    }
    routeLoadingState.value = false;
    isRefreshing.value = false;
  }
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
:global(:root) {
  --app-viewport-height: 100vh;
}

@supports (height: 100dvh) {
  :global(:root) {
    --app-viewport-height: 100dvh;
  }
}

.app-surface {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: flex-start;
  min-height: var(--app-viewport-height, 100vh);
  background: transparent;
  overflow-x: hidden;
  overflow-y: visible;
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
  overflow-y: auto;
  scrollbar-gutter: stable both-edges;
}

.app-drawer .pane-scroll {
  height: calc(var(--app-viewport-height, 100vh) - var(--app-bar-height));
}

.right-drawer-wrapper {
  display: contents;
}

.main-scroll {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: calc(var(--app-viewport-height, 100vh) - var(--app-bar-height));
  display: flex;
  flex-direction: column;
}

.main-scroll__viewport {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(var(--app-viewport-height, 100vh) - var(--app-bar-height));
  padding-block-end: clamp(8px, 2vw, 16px);
  box-sizing: border-box;
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

.app-container-wrapper {
  position: relative;
}

.app-container-wrapper--loading {
  min-height: 100%;
}

.app-container--content {
  transition: opacity 180ms ease-in-out;
}

.app-container--content-hidden {
  opacity: 0;
  visibility: hidden;
}

.app-container--skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
}

.app-container--skeleton > * {
  pointer-events: none;
}
.sidebar-default-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

/* Responsive */
@media (max-width: 960px) {
  .app-container {
    border-radius: var(--radius, var(--ui-card-radius));
    padding: clamp(20px, 6vw, 32px);
  }
}
</style>
