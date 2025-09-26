<template>
  <v-app :style="cssVars">
    <AppTopBar
      :app-icons="appIcons"
      :is-dark="isDark"
      :is-mobile="isMobile"
      :locale="locale"
      :locales="availableLocales"
      @toggle-left="toggleLeftDrawer"
      @toggle-right="toggleRightDrawer"
      @toggle-theme="toggleTheme"
      @go-back="goBack"
      @refresh="refreshPage"
      @update:locale="setLocale"
    />

    <v-navigation-drawer
      v-if="isMobile"
      v-model="leftDrawer"
      temporary
      location="start"
      scrim
      width="320"
      class="bg-transparent"
    >
      <div class="px-3 py-4">
        <AppSidebar
          :items="sidebarItems"
          :active-key="activeSidebar"
          @select="handleSidebarSelect"
        />
      </div>
    </v-navigation-drawer>

    <v-main class="app-surface">
      <div class="app-container">
        <div
          class="layout-grid"
          :class="{ 'layout-grid--no-right': !showRightWidgets }"
        >
          <div v-if="!isMobile" class="layout-sidebar">
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
              <RightSidebarContent
                :weather="weather"
                :leaderboard="leaderboard"
                :rating="rating"
              />
            </div>
          </div>

          <div
            v-if="showRightWidgets"
            class="layout-right-rail"
          >
            <RightSidebar ref="rightSidebarRef" />
          </div>
        </div>
      </div>
    </v-main>

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
import RightSidebar from '@/components/layout/RightSidebar.vue'
import RightSidebarContent from '@/components/layout/RightSidebarContent.vue'
import Toaster from 'shadcn-docs-nuxt/components/ui/toast/Toaster.vue'
import { useRightSidebarData } from '@/composables/useRightSidebarData'

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const theme = useTheme()
const { locale, availableLocales } = useI18n()

const leftDrawer = ref(false)
type RightSidebarExpose = {
  openDrawer: (options?: { focus?: boolean; trigger?: HTMLElement | null }) => void
  closeDrawer: (options?: { returnFocus?: boolean }) => void
  toggleDrawer: (trigger?: HTMLElement | null) => void
}

const rightSidebarRef = ref<RightSidebarExpose | null>(null)

const isDesktop = computed(() => display.lgAndUp.value)
const isMobile = computed(() => !display.mdAndUp.value)

const isDark = computed(() => theme.global.current.value.dark)
const showRightWidgets = computed(() => route.meta?.showRightWidgets !== false)
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
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      leftDrawer.value = false
      rightSidebarRef.value?.closeDrawer({ returnFocus: false })
    }
  },
)

watch(isMobile, (value) => {
  if (!value) {
    leftDrawer.value = false
    rightSidebarRef.value?.closeDrawer({ returnFocus: false })
  }
})

watch(showRightWidgets, (value) => {
  if (!value) {
    rightSidebarRef.value?.closeDrawer({ returnFocus: false })
  }
})

watch(isDesktop, (value) => {
  if (value) {
    leftDrawer.value = false
  }
})

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

function toggleLeftDrawer() {
  leftDrawer.value = !leftDrawer.value
}

function toggleRightDrawer(event?: MouseEvent) {
  if (!showRightWidgets.value) {
    return
  }

  if (!isMobile.value) {
    return
  }

  const trigger = (event?.currentTarget ?? null) as HTMLElement | null
  rightSidebarRef.value?.toggleDrawer(trigger)
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
}

.layout-sidebar {
  display: none;
}

.layout-right-widgets {
  margin-top: 24px;
  display: none;
}

.layout-right-rail {
  display: none;
}

.layout-grid--no-right {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 768px) {
  .layout-sidebar {
    display: block;
  }

  .layout-grid {
    grid-template-columns: 320px minmax(0, 1fr);
  }

  .layout-grid--no-right {
    grid-template-columns: 320px minmax(0, 1fr);
  }

  .layout-right-widgets {
    display: block;
  }
}

@media (min-width: 1280px) {
  .layout-right-widgets {
    display: none;
  }

  .layout-right-rail {
    display: block;
  }

  .layout-grid {
    grid-template-columns: 320px minmax(0, 1fr) 360px;
  }

  .layout-grid--no-right {
    grid-template-columns: 320px minmax(0, 1fr);
  }
}

.content-area {
  min-height: calc(100vh - var(--app-bar-height) - 120px);
  border-radius: 32px;
  background: transparent;
  padding-top: 8px;
  grid-column: 1 / -1;
}

@media (min-width: 768px) {
  .content-area {
    grid-column: 2 / 3;
  }

  .layout-grid--no-right .content-area {
    grid-column: 2 / 3;
  }
}

@media (min-width: 1280px) {
  .layout-grid--no-right .content-area {
    grid-column: 2 / 3;
  }
}
</style>
