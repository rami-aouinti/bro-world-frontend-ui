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
      <Suspense>
        <template #default>
          <div class="pane-scroll px-3 py-4">
            <AppSidebarRight
                :items="sidebarItems"
                :active-key="activeSidebar"
                @select="handleSidebarSelect"
            />
          </div>
        </template>
        <template #fallback>
          <div class="pane-scroll px-3 py-4">
            <div class="flex flex-col gap-4">
              <div class="h-10 rounded-2xl bg-slate-200/60" />
              <div class="h-24 rounded-2xl bg-slate-200/60" />
              <div class="h-24 rounded-2xl bg-slate-200/60" />
            </div>
          </div>
        </template>
      </Suspense>
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
import { watch, computed, ref, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useRightSidebarData } from '@/composables/useRightSidebarData'
import type { LayoutSidebarItem } from '~/lib/navigation/sidebar'
import { ADMIN_ROLE_KEYS, buildSidebarItems } from '~/lib/navigation/sidebar'
import { useAuthSession } from '~/stores/auth-session'

const AppSidebarRight = defineAsyncComponent(() => import('~/components/layout/AppSidebarRight.vue'))

const isDark = computed(() => useColorMode().value == "dark");
const route = useRoute()
const router = useRouter()
const display = useDisplay()
const { locale, availableLocales } = useI18n()
const auth = useAuthSession()

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

const canAccessAdmin = computed(() => {
  if (!auth.isAuthenticated.value) {
    return false
  }

  const roles = auth.currentUser.value?.roles ?? []
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role))
})

const sidebarItems = computed<LayoutSidebarItem[]>(() => buildSidebarItems(canAccessAdmin.value))

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
  (path) => {
    if (isMobile.value) {
      leftDrawer.value = false
      rightDrawer.value = false
    }

    const matchedKey = findActiveSidebarKey(path, sidebarItems.value)
    if (matchedKey) {
      activeSidebar.value = matchedKey
    }
  },
  { immediate: true },
)

function toggleTheme() {
  return isDark.value ? 'light' : 'dark'
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

function findActiveSidebarKey(path: string, items: LayoutSidebarItem[]): string | null {
  for (const item of items) {
    if (item.to && matchesRoute(path, item.to)) {
      return item.key
    }

    if (item.children?.length) {
      const childMatch = findActiveSidebarKey(path, item.children)
      if (childMatch) {
        return childMatch
      }
    }
  }

  return null
}

function matchesRoute(path: string, target: string) {
  if (target === '/') {
    return path === '/' || path.startsWith('/?')
  }

  return path === target || path.startsWith(`${target}/`) || path.startsWith(`${target}?`)
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
