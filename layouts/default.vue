<template>
  <v-app
    :theme="isDark ? 'dark' : 'light'"
    :style="cssVars"
  >
    <AppTopBar
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
      @update:locale="setLocale"
    />

    <!-- LEFT DRAWER -->
    <v-navigation-drawer
      v-model="leftDrawer"
      app
      :permanent="!isMobile"
      :temporary="isMobile"
      :rail="isRail"
      :scrim="isMobile"
      location="start"
      width="320"
      class="app-drawer"
      :style="drawerInlineStyle"
    >
      <ParticlesBg
        class="sidebar-default-card__particles"
        :quantity="50"
        :ease="50"
        :staticity="12"
        refresh
      />
      <div class="pane-scroll py-4 bg-card">
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
      v-if="showRightWidgets"
      v-model="rightDrawer"
      app
      :permanent="!isMobile"
      :temporary="isMobile"
      :scrim="isMobile"
      location="end"
      width="340"
      class="app-drawer"
      data-test="app-right-drawer"
      :style="drawerInlineStyle"
    >
      <ParticlesBg
        class="sidebar-default-card__particles"
        :quantity="50"
        :ease="50"
        :staticity="12"
        refresh
      />
      <Suspense>
        <template #default>
          <ClientOnly>
            <div
              v-if="rightDrawer"
              class="pane-scroll px-3 py-4 bg-card"
            >
              <AppSidebarRight
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
                    :class="rightSidebarContent.wrapperClass ?? 'flex flex-col gap-4'"
                  >
                    <component
                      :is="rightSidebarContent.component"
                      v-bind="rightSidebarContent.props"
                    />
                  </div>
                  <div
                    v-else
                    class="flex flex-col gap-4"
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
              <div class="pane-scroll px-3 py-4 bg-card">
                <div class="flex flex-col gap-4">
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
        </template>
        <template #fallback>
          <div class="pane-scroll px-3 py-4 bg-card">
            <div class="flex flex-col gap-4">
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
      </Suspense>
    </v-navigation-drawer>

    <v-main
      v-show="areSidebarsVisible"
      class="app-surface"
    >
      <ParticlesBg
        class="sidebar-default-card__particles"
        :quantity="120"
        :ease="120"
        :color="isDark ? '#ffffff' : '#111827'"
        :staticity="12"
        refresh
      />
      <div class="main-scroll bg-card">
        <div class="app-container">
          <slot />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch, computed, ref, defineAsyncComponent, onMounted } from "vue";
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

const initialResolvedColorMode = useState<"light" | "dark">(
  "layout-initial-color-mode",
  () => {
    if (colorMode.value === "dark" || colorMode.value === "light") {
      return colorMode.value;
    }

    if (colorSchemeHint === "dark") {
      return "dark";
    }

    return "light";
  },
);

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

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const initialShowRightWidgets = useState(
  "layout-initial-show-right-widgets",
  () => currentRoute.value?.meta?.showRightWidgets !== false,
);
const display = useDisplay();
const initialIsMobile = useState("layout-initial-is-mobile", () => display.mobile.value);
const initialIsRail = useState(
  "layout-initial-is-rail",
  () => display.mdAndDown.value && !display.mobile.value,
);
const { locale, availableLocales } = useI18n();
const auth = useAuthSession();

const leftDrawerState = ref(true);
const rightDrawerState = ref(true);

const leftDrawer = computed({
  get() {
    if (!isHydrated.value) {
      return false;
    }

    return leftDrawerState.value;
  },
  set(value: boolean) {
    leftDrawerState.value = value;
  },
});

const rightDrawer = computed({
  get() {
    if (!isHydrated.value) {
      return false;
    }

    return rightDrawerState.value;
  },
  set(value: boolean) {
    rightDrawerState.value = value;
  },
});

const drawerInlineStyle = { zIndex: 1004 } as const;
const isMobile = computed(() => {
  if (!isHydrated.value) {
    return initialIsMobile.value;
  }

  return display.mobile.value;
});
// rail facultatif: quand mdAndDown mais pas mobile complet
const isRail = computed(() => {
  if (!isHydrated.value) {
    return initialIsRail.value;
  }

  return display.mdAndDown.value && !display.mobile.value;
});
const showRightWidgets = computed(() => {
  if (!isHydrated.value) {
    return initialShowRightWidgets.value;
  }

  return currentRoute.value?.meta?.showRightWidgets !== false;
});

const siteSettingsState = useSiteSettingsState();
const theme = useTheme();

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

const { weather, leaderboard, rating } = useRightSidebarData();
const { rightSidebarContent } = useLayoutRightSidebar();

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

const cssVars = computed(() => {
  const base = {
    "--app-bar-height": "50px",
    "--pink-shadow": isDark.value
      ? "0px 16px 32px rgba(243, 126, 205, 0.18)"
      : "0px 20px 45px rgba(243, 126, 205, 0.28)",
    "--surface-gradient-start": isDark.value
      ? "rgba(120, 106, 255, 0.28)"
      : "rgba(125, 196, 255, 0.45)",
    "--surface-gradient-end": isDark.value
      ? "rgba(255, 153, 214, 0.24)"
      : "rgba(255, 183, 236, 0.4)",
    "--surface-base": isDark.value ? "rgba(12, 14, 24, 0.9)" : "rgba(244, 247, 252, 0.95)",
    "--card-bg": isDark.value ? "rgba(20, 22, 33, 0.94)" : "rgba(255, 255, 255, 0.92)",
    "--card-border": isDark.value ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
    "--card-shadow": isDark.value
      ? "0 28px 60px -30px rgba(12, 14, 24, 0.9)"
      : "0 28px 60px -30px rgba(15, 23, 42, 0.45)",
  } as Record<string, string>;

  if (activeTheme.value) {
    if (!isDark.value) {
      base["--surface-base"] = activeTheme.value.surfaceColor;
    }

    base["--brand-primary"] = activeTheme.value.primaryColor;
    base["--brand-accent"] = activeTheme.value.accentColor;
  }

  return base;
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
    return buildProfileSidebarItems();
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

const activeSidebar = ref("apps");

/** Données de démonstration pour ProfileSidebar */
const user = computed(() => auth.currentUser.value ?? null);

/** ✅ Règle d’affichage du contenu: gauche ouverte ET (droite ouverte si demandée) */
const areSidebarsVisible = computed(() => {
  if (!isHydrated.value) {
    return true;
  }

  const leftVisible = leftDrawer.value;
  const rightOk = showRightWidgets.value ? rightDrawer.value : true;
  return leftVisible && rightOk;
});

/** Réactivité aux points de rupture / route */
watch(
  isMobile,
  (mobile) => {
    if (mobile) {
      leftDrawer.value = false;
      rightDrawer.value = false;
      return;
    }
    leftDrawer.value = true;
    rightDrawer.value = showRightWidgets.value;
  },
  { immediate: true },
);

watch(showRightWidgets, (value) => {
  if (!value) {
    rightDrawer.value = false;
    return;
  }
  if (!isMobile.value) rightDrawer.value = true;
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
  leftDrawer.value = !leftDrawer.value;
}
function toggleRightDrawer() {
  if (!showRightWidgets.value) return;
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
function setLocale(newLocale: string) {
  locale.value = newLocale;
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

  const fallbackKey = findFirstSidebarKey(items);
  if (fallbackKey) activeSidebar.value = fallbackKey;
}

function findFirstSidebarKey(items: LayoutSidebarItem[]): string | null {
  for (const item of items) {
    if (item.children?.length) {
      const childKey = findFirstSidebarKey(item.children);
      if (childKey) return childKey;
      continue;
    }

    return item.key;
  }

  return null;
}
</script>

<style scoped>
.app-surface {
  position: relative;
  display: flex;
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
