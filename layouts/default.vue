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
      data-test="app-right-drawer"
    >
      <Suspense>
        <template #default>
          <ClientOnly>
            <div v-if="rightDrawer" class="pane-scroll px-3 py-4">
              <AppSidebarRight
                :items="sidebarItems"
                :active-key="activeSidebar"
                :eager="rightDrawer"
                @select="handleSidebarSelect"
              >
                <div class="flex flex-col gap-4">
                  <ProfileSidebar
                      :user="user"
                      :photos="photos"
                      :friends="friends"
                      :friends-count="1599"
                      :life-events="events"
                      @edit-bio="onEditBio"
                      @edit-details="onEditDetails"
                      @add-featured="onAddFeatured"
                      @view-all-photos="onViewAllPhotos"
                      @view-all-friends="onViewAllFriends"
                      @open-friend="openFriend"
                      @view-all-events="onViewAllEvents"
                      @add-event="onAddEvent"
                  />
                  <SidebarWeatherCard v-if="weather" :weather="weather" />
                  <SidebarLeaderboardCard
                    v-if="leaderboard"
                    :title="leaderboard.title"
                    :live-label="leaderboard.live"
                    :participants="leaderboard.participants"
                  />
                  <SidebarRatingCard v-if="rating" :rating="rating" />
                </div>
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
import SidebarWeatherCard from '~/components/layout/SidebarWeatherCard.vue'
import SidebarLeaderboardCard from '~/components/layout/SidebarLeaderboardCard.vue'
import SidebarRatingCard from '~/components/layout/SidebarRatingCard.vue'
import ProfileSidebar from "~/components/layout/ProfileSidebar.vue";

const AppSidebarRight = defineAsyncComponent({
  loader: () => import('~/components/layout/AppSidebarRight.vue'),
  suspensible: false,
})

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
  '--surface-gradient-start': isDark.value
    ? 'rgba(120, 106, 255, 0.28)'
    : 'rgba(125, 196, 255, 0.45)',
  '--surface-gradient-end': isDark.value
    ? 'rgba(255, 153, 214, 0.24)'
    : 'rgba(255, 183, 236, 0.4)',
  '--surface-base': isDark.value ? 'rgba(12, 14, 24, 0.9)' : 'rgba(244, 247, 252, 0.95)',
  '--card-bg': isDark.value ? 'rgba(20, 22, 33, 0.94)' : 'rgba(255, 255, 255, 0.92)',
  '--card-border': isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
  '--card-shadow': isDark.value
    ? '0 28px 60px -30px rgba(12, 14, 24, 0.9)'
    : '0 28px 60px -30px rgba(15, 23, 42, 0.45)',
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
const user = {
  name: 'Rami Aouinti',
  bio: 'عامل الناس بأخلاقك لا بأخلاقهم',
  livesIn: 'Köln',
  from: 'Tunis',
  schools: [
    'Hat hier studiert: INSAT',
    'Ist hier zur Schule gegangen: Lycée el Menazah 6',
    'Hat hier studiert: Hochschulenzentrum - Beuth Hochschule für Technik Berlin'
  ]
}

const photos = Array.from({ length: 12 }).map((_, i) => ({
  src: `https://picsum.photos/seed/p${i}/300/300`,
  alt: `photo ${i}`
}))

const friends = [
  { name: 'Nihal Rmili', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Ahlam Chermiti', avatar: 'https://i.pravatar.cc/150?img=6' },
  { name: 'Oussama Bacha', avatar: 'https://i.pravatar.cc/150?img=7' },
  { name: 'Wafâ Mahdaoui', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Hiba Souab', avatar: 'https://i.pravatar.cc/150?img=9' },
  { name: 'Nedra K.', avatar: 'https://i.pravatar.cc/150?img=10' },
  { name: 'Mongi Souab', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Sana Boualima', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Friend 9', avatar: 'https://i.pravatar.cc/150?img=13' }
]

const events = [
  { title: 'Studium abgeschlossen: INSAT', date: 'Dezember 2015', description: '' }
]

function onEditBio() {}
function onEditDetails() {}
function onAddFeatured() {}
function onViewAllPhotos() {}
function onViewAllFriends() {}
function openFriend(f: any) {}
function onViewAllEvents() {}
function onAddEvent() {}
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
  position: relative;
  display: flex;
  min-height: 100vh;
  background: transparent;
  overflow: hidden;
}

.app-surface::before {
  content: '';
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



@media (max-width: 960px) {
  .app-container {
    border-radius: 24px;
    padding: clamp(20px, 6vw, 32px);
  }
}
</style>
