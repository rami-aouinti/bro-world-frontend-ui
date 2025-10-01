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
    >
      <ParticlesBg
        class="sidebar-default-card__particles"
        :quantity="50"
        :ease="50"
        :color="isDark ? '#ffffff' : '#111827'"
        :staticity="12"
        refresh
      />
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
    >
      <ParticlesBg
        class="sidebar-default-card__particles"
        :quantity="50"
        :ease="50"
        :color="isDark ? '#ffffff' : '#111827'"
        :staticity="12"
        refresh
      />
      <Suspense>
        <template #default>
          <ClientOnly>
            <div
              v-if="rightDrawer"
              class="pane-scroll px-3 py-4"
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
                  <div class="flex flex-col gap-4">
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
              <div class="pane-scroll px-3 py-4">
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
          <div class="pane-scroll px-3 py-4">
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
      v-if="areSidebarsVisible"
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
      <div class="main-scroll">
        <div class="app-container">
          <slot />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch, computed, ref, defineAsyncComponent } from "vue";
import { useDisplay } from "vuetify";
import { useCookieColorMode } from "~/composables/useCookieColorMode";
import { useRequestHeaders } from "#imports";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopBar from "@/components/layout/AppTopBar.vue";
import { useRightSidebarData } from "@/composables/useRightSidebarData";
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

const AppSidebarRight = defineAsyncComponent({
  loader: () => import("~/components/layout/AppSidebarRight.vue"),
  suspensible: false,
});
const colorMode = useCookieColorMode();
const colorSchemeHint = import.meta.server
  ? useRequestHeaders(["sec-ch-prefers-color-scheme"])["sec-ch-prefers-color-scheme"]
  : null;

const resolvedColorMode = computed(() => {
  if (colorMode.value === "auto") {
    if (import.meta.server) {
      if (colorSchemeHint === "dark" || colorSchemeHint === "light") {
        return colorSchemeHint;
      }
      return "light";
    }

    return colorMode.system.value;
  }

  return colorMode.value;
});

const isDark = computed(() => resolvedColorMode.value === "dark");
const route = useRoute();
const router = useRouter();
const display = useDisplay();
const { locale, availableLocales } = useI18n();
const auth = useAuthSession();

const leftDrawer = ref(true);
const rightDrawer = ref(true);
const isMobile = computed(() => !display.mdAndUp.value);
// rail facultatif: quand mdAndDown mais pas mobile complet
const isRail = computed(() => display.mdAndDown.value && !isMobile.value);
const showRightWidgets = computed(() => route.meta?.showRightWidgets !== false);

const { weather, leaderboard, rating } = useRightSidebarData();

const cssVars = computed(() => ({
  "--app-bar-height": "50px",
  "--pink-shadow": isDark.value
    ? "0px 16px 32px rgba(243, 126, 205, 0.18)"
    : "0px 20px 45px rgba(243, 126, 205, 0.28)",
  "--surface-gradient-start": isDark.value
    ? "rgba(120, 106, 255, 0.28)"
    : "rgba(125, 196, 255, 0.45)",
  "--surface-gradient-end": isDark.value ? "rgba(255, 153, 214, 0.24)" : "rgba(255, 183, 236, 0.4)",
  "--surface-base": isDark.value ? "rgba(12, 14, 24, 0.9)" : "rgba(244, 247, 252, 0.95)",
  "--card-bg": isDark.value ? "rgba(20, 22, 33, 0.94)" : "rgba(255, 255, 255, 0.92)",
  "--card-border": isDark.value ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
  "--card-shadow": isDark.value
    ? "0 28px 60px -30px rgba(12, 14, 24, 0.9)"
    : "0 28px 60px -30px rgba(15, 23, 42, 0.45)",
}));

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
  route.meta?.sidebarVariant === "profile" ? "profile" : "default",
);

const sidebarItems = computed<LayoutSidebarItem[]>(() => {
  if (sidebarVariant.value === "profile") {
    return buildProfileSidebarItems();
  }

  return buildSidebarItems(canAccessAdmin.value);
});

const activeSidebar = ref("apps");

/** Données de démonstration pour ProfileSidebar */
const user = computed(() => auth.currentUser.value ?? null);

/** ✅ Règle d’affichage du contenu: gauche ouverte ET (droite ouverte si demandée) */
const areSidebarsVisible = computed(() => {
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
  () => route.fullPath,
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
    updateActiveSidebar(route.fullPath, items);
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
  for (const item of items) {
    if (item.to && matchesRoute(path, item.to)) return item.key;
    if (item.children?.length) {
      const childMatch = findActiveSidebarKey(path, item.children);
      if (childMatch) return childMatch;
    }
  }
  return null;
}

function matchesRoute(path: string, target: string) {
  if (target === "/") return path === "/" || path.startsWith("/?");
  return path === target || path.startsWith(`${target}/`) || path.startsWith(`${target}?`);
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
