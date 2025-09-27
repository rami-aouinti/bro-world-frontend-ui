<template>
  <v-app :theme="isDark ? 'dark' : 'light'" :style="cssVars">
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
      <div class="pane-scroll px-3 py-4">
        <AppSidebarRight
            :items="sidebarItems"
            :active-key="activeSidebar"
            @select="handleSidebarSelect"
        />
      </div>
    </v-navigation-drawer>

    <v-main class="app-surface">
      <div class="main-scroll">
        <div class="app-container">
          <slot />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useRightSidebarData } from '@/composables/useRightSidebarData'
import AppSidebarRight from '@/components/layout/AppSidebarRight.vue'
import type { SidebarItem } from '@/types/sidebar'

const isDark = computed(() => useColorMode().value == "dark");
const route = useRoute()
const router = useRouter()
const display = useDisplay()
const theme = useTheme()
const { locale, availableLocales } = useI18n()

const leftDrawer = ref(true)
const rightDrawer = ref(true)
const isMobile = computed(() => !display.mdAndUp.value)
const isRail = computed(() => display.mdAndDown.value && !isMobile.value)
const showRightWidgets = computed(() => route.meta?.showRightWidgets !== false)

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

const sidebarItems: SidebarItem[] = [
  {
    key: 'apps',
    label: 'layout.sidebar.items.apps',
    icon: 'mdi-apps',
    to: '/',
    children: [
      {
        key: 'planning',
        label: 'layout.sidebar.groups.planning',
        icon: 'mdi-calendar-month-outline',
        children: [
          { key: 'calendar', label: 'layout.sidebar.items.calendar', icon: 'mdi-calendar-month', to: '/' },
        ],
      },
      {
        key: 'career',
        label: 'layout.sidebar.groups.career',
        icon: 'mdi-briefcase-outline',
        children: [
          { key: 'cv', label: 'layout.sidebar.items.cv', icon: 'mdi-file-account', to: '/' },
          { key: 'jobs', label: 'layout.sidebar.items.jobs', icon: 'mdi-briefcase-search', to: '/' },
        ],
      },
    ],
  },
  { key: 'help', label: 'layout.sidebar.items.help', icon: 'mdi-lifebuoy', to: '/help' },
  { key: 'about', label: 'layout.sidebar.items.about', icon: 'mdi-information-outline', to: '/about' },
  { key: 'contact', label: 'layout.sidebar.items.contact', icon: 'mdi-email-outline', to: '/contact' },
]

const activeSidebar = ref('calendar')

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
  return  isDark.value ? 'light' : 'dark'
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

</script>

<style scoped>
.app-surface {
  border-color: transparent;
  min-height: 100vh;
}

.app-drawer {
  border-color: transparent;
}

.pane-scroll {
  height: calc(100vh - var(--app-bar-height));
  overflow-y: auto;
}

.app-container {
  margin: 0 auto;
  width: 100%;
  max-width: 1440px;
}
</style>
