<template>
  <v-app :style="cssVars">
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
      <div class="pane-scroll px-3 py-4">
        <AppSidebar
          :items="sidebarItems"
          :active-key="activeSidebar"
          @select="handleSidebarSelect"
        />
      </div>
    </v-navigation-drawer>

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
    >
      <div class="pane-scroll px-4 py-6">
        <RightSidebarContent
          :weather="weather"
          :leaderboard="leaderboard"
          :rating="rating"
        />
      </div>
    </v-navigation-drawer>

    <v-main class="app-surface">
      <div class="main-scroll">
        <div class="app-container">
          <slot />
      <div class="app-container">
        <div
          class="layout-grid"
          :class="layoutGridClasses"
        >
          <div v-if="showPrimarySidebar" class="layout-sidebar">
            <AppSidebar
              :items="sidebarItems"
              :active-key="activeSidebar"
              @select="handleSidebarSelect"
            />
          </div>

          <div class="content-area">
            <slot />

            <div
              v-if="showInlineRightWidgets"
              class="layout-right-widgets"
            >
              <RightSidebar
                  ref="rightSidebarRef"
                  :items="sidebarItems"
                  :active-key="activeSidebar"
                  @select="handleSidebarSelect"
              />
            </div>
          </div>

          <div
            v-if="showRightWidgets"
            class="layout-right-rail"
          >
            <RightSidebar
              ref="rightSidebarRef"
              :items="sidebarItems"
              :active-key="activeSidebar"
              @select="handleSidebarSelect"
            />
          </div>
        </div>
      </div>
    </v-main>
    <RightSidebar
        ref="rightSidebarRef"
        :items="sidebarItems"
        :active-key="activeSidebar"
        @select="handleSidebarSelect"
    />
    <Toaster />

    <v-footer
      app
      border="top"
      class="px-4 py-3 text-sm text-muted-foreground"
    >
      <span class="mr-1">&copy; {{ currentYear }}</span>
      <span>Bro World</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import RightSidebarContent from '@/components/layout/RightSidebarContent.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import Toaster from 'shadcn-docs-nuxt/components/ui/toast/Toaster.vue'
import { useRightSidebarData } from '@/composables/useRightSidebarData'

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const theme = useTheme()
const { locale, availableLocales } = useI18n()

const leftDrawer = ref(true)
const rightDrawer = ref(true)
const isMobile = computed(() => !display.mdAndUp.value)
const isRail = computed(() => display.mdAndDown.value && !isMobile.value)

const isDark = computed(() => theme.global.current.value.dark)
const showRightWidgets = computed(() => route.meta?.showRightWidgets !== false)

const showPrimarySidebar = computed(
  () => !isMobile.value && !showRightWidgets.value,
)
const layoutGridClasses = computed(() => ({
  'layout-grid--with-sidebar': showPrimarySidebar.value,
  'layout-grid--with-widgets': showRightWidgets.value,
}))
const showInlineRightWidgets = computed(
  () => showRightWidgets.value && !isDesktop.value && !isMobile.value,
)
const { weather, leaderboard, rating } = useRightSidebarData()

const cssVars = computed(() => ({
  '--app-bar-height': '72px',
  '--pink-shadow': isDark.value
    ? '0px 16px 32px rgba(243, 126, 205, 0.18)'
    : '0px 20px 45px rgba(243, 126, 205, 0.28)',
}))

const appIcons = [
  { name: 'mdi-school-outline', label: 'layout.appIcons.academy' },
  { name: 'mdi-briefcase-outline', label: 'layout.appIcons.briefcase' },
  { name: 'mdi-store-outline', label: 'layout.appIcons.store' },
  { name: 'mdi-database', label: 'layout.appIcons.database' },
  { name: 'mdi-gamepad-variant-outline', label: 'layout.appIcons.game' },
]

const sidebarItems = [
  { key: 'apps', label: 'layout.sidebar.items.apps', icon: 'mdi-apps', to: '/' },
  { key: 'calendar', label: 'layout.sidebar.items.calendar', icon: 'mdi-calendar-month', to: '/' },
  { key: 'cv', label: 'layout.sidebar.items.cv', icon: 'mdi-file-account', to: '/' },
  { key: 'jobs', label: 'layout.sidebar.items.jobs', icon: 'mdi-briefcase-search', to: '/' },
  { key: 'help', label: 'layout.sidebar.items.help', icon: 'mdi-lifebuoy', to: '/' },
  { key: 'about', label: 'layout.sidebar.items.about', icon: 'mdi-information-outline', to: '/' },
  { key: 'contact', label: 'layout.sidebar.items.contact', icon: 'mdi-email-outline', to: '/' },
]

const activeSidebar = ref('apps')

watch(
  isMobile,
  (mobile) => {
    if (mobile) {
      leftDrawer.value = false
      rightDrawer.value = false
      return
    }

    leftDrawer.value = true
    rightDrawer.value = showRightWidgets.value
  },
  { immediate: true },
)

watch(showRightWidgets, (value) => {
  if (!value) {
    rightDrawer.value = false
    return
  }

  if (!isMobile.value) {
    rightDrawer.value = true
  }
})

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      leftDrawer.value = false
      rightDrawer.value = false
    }
  },
)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

function toggleLeftDrawer() {
  leftDrawer.value = !leftDrawer.value
}

function toggleRightDrawer() {
  if (!showRightWidgets.value) {
    return
  }

  rightDrawer.value = !rightDrawer.value
}

function goBack() {
  router.back()
}

function refreshPage() {
  refreshNuxtData()
}

function handleSidebarSelect(key: string) {
  activeSidebar.value = key
  if (isMobile.value) {
    leftDrawer.value = false
  }
}

function setLocale(newLocale: string) {
  locale.value = newLocale
}

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.app-surface {
  background: #f7f8fb;
  min-height: 100vh;
}

.app-drawer {
  border-color: transparent;
}

.pane-scroll {
  height: calc(100vh - var(--app-bar-height));
  overflow-y: auto;
}

.main-scroll {
  height: calc(100vh - var(--app-bar-height));
  overflow-y: auto;
  padding: 32px clamp(16px, 3vw, 40px) 48px;
}

.app-container {
  margin: 0 auto;
  width: 100%;
  max-width: 1440px;
}

@media (max-width: 959px) {
  .main-scroll {
    padding: 24px 20px 32px;
.app-container {
  margin: 0 auto;
  width: 100%;
  max-width: 1440px;
  padding: 32px clamp(16px, 3vw, 40px) 48px;
}

.layout-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "content";
}

.layout-sidebar {
  display: none;
  grid-area: sidebar;
}

.layout-right-rail {
  display: none;
  grid-area: widgets;
}

.content-area {
  min-height: calc(100vh - var(--app-bar-height) - 120px);
  border-radius: 32px;
  background: transparent;
  padding-top: 8px;
  grid-area: content;
}

@media (min-width: 768px) {
  .layout-grid--with-sidebar {
    grid-template-columns: 320px minmax(0, 1fr);
    grid-template-areas: "sidebar content";
  }

  .layout-grid--with-sidebar .layout-sidebar {
    display: block;
  }
}

@media (min-width: 1280px) {
  .layout-grid--with-widgets {
    grid-template-columns: 320px minmax(0, 1fr);
    grid-template-areas: "widgets content";
  }

  .layout-grid--with-widgets .layout-right-rail {
    display: block;
  }

  .layout-grid--with-widgets.layout-grid--with-sidebar {
    grid-template-columns: 320px minmax(0, 1fr) 320px;
    grid-template-areas: "widgets content sidebar";
  }
}
</style>
