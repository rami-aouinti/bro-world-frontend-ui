<template>
  <v-app-bar
      class="app-top-bar"
      :class="isDarkMode ? 'text-white' : 'text-black'"
      :color="textGradient"
      app
      :elevation="10" rounded
      height="50"
  >
    <template #image>
      <v-img
          cover
          :gradient="gradient"
      ></v-img>
    </template>
    <div class="flex items-center gap-3">
      <v-btn
        v-if="isMobile"
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.openNavigation')"
        @click="emit('toggle-left')"
      >
        <AppIcon
          name="mdi:menu"
          :size="24"
        />
      </v-btn>
      <div class="flex items-center gap-2">
        <NuxtLink
          class="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold text-xl"
          to="/"
        >
          <h1
              class="z-2 relative text-center font-sans font-bold"
          >
            Bro <ColourfulText :colors="['#cc2b16', '#c52279', '#5b0734']" text="World" />
          </h1>
        </NuxtLink>
      </div>
      <div class="flex items-center gap-8 px-16">
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.goBack')"
            @click="emit('go-back')"
        >
          <AppIcon
              name="mdi:arrow-left"
              :size="22"
          />
        </button>
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.refresh')"
            @click="emit('refresh')"
        >
          <AppIcon
              name="mdi:refresh"
              :size="22"
          />
        </button>
        <button
            v-if="!isMobile"
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.openNavigation')"
            @click="emit('toggle-left')"
        >
          <AppIcon
              name="mdi-format-align-justify"
              :size="22"
          />
        </button>
      </div>
    </div>
    <div
      v-if="showInlineSearch"
      class="hidden flex-1 items-center px-4 md:flex"
    >
      <LayoutSearchButton class="w-full max-w-2xl" />
    </div>
    <div
      v-else-if="showSearchButton"
      class="hidden md:flex"
    >
      <LayoutSearchButton />
    </div>

    <div class="px-16">
      <v-tooltip
          v-for="icon in appIcons"
          :key="icon.label"
          :text="t(icon.label)"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
              v-bind="tooltipProps"
              :aria-label="t(icon.label)"
          >
            <AppIcon
                :name="icon.name"
                :size="26"
            />
          </v-btn>
        </template>
      </v-tooltip>
    </div>
    <template #append>
      <div class="flex items-center gap-3">
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.notifications')"
        >
          <AppIcon
              name="mdi:bell-outline"
              :size="22"
          />
        </button>
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.cart')"
        >
          <AppIcon
              name="mdi:shopping-outline"
              :size="22"
          />
        </button>
        <v-menu location="bottom end">
          <template #activator="{ props: profileProps }">
            <button
                type="button"
                :class="iconTriggerClasses"
                :aria-label="t('layout.actions.profile')"
                v-bind="profileProps"
            >
              <AppIcon
                  name="mdi:person-outline"
                  :size="22"
              />
            </button>
          </template>
          <v-list density="compact">
            <v-list-item
                v-for="item in userMenuItems"
                :key="item.title"
                :title="item.title"
                :disabled="item.action === 'logout' && loggingOut"
                @click="handleUserMenuSelect(item)"
            >
              <template #prepend>
                <AppIcon
                    :name="item.icon"
                    :size="20"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu location="bottom end">
          <template #activator="{ props: languageProps }">
            <button
                type="button"
                :class="iconTriggerClasses"
                :aria-label="t('layout.actions.changeLanguage', { locale: localeLabel })"
                v-bind="languageProps"
            >
              <AppIcon
                  name="mdi:flag-outline"
                  :size="22"
              />
            </button>
          </template>
          <v-list density="compact">
            <v-list-item
                v-for="availableLocale in locales"
                :key="availableLocale"
                :active="availableLocale === locale"
                :title="formatLocaleLabel(availableLocale)"
                role="menuitemradio"
                :aria-checked="availableLocale === locale"
                @click="changeLocale(availableLocale)"
            />
          </v-list>
        </v-menu>
        <button
            v-if="isMobile && props.showRightToggle"
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.openWidgets')"
            data-test="open-right-widgets"
            @click="emit('toggle-right')"
        >
          <AppIcon
              name="mdi:dots-vertical"
              :size="22"
          />
        </button>
        <ThemePopover v-if="config.theme.customizable" />
        <DarkModeToggle v-if="config.header.darkModeToggle" />
        <button
            v-if="!isMobile && props.showRightToggle"
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.openWidgets')"
            @click="emit('toggle-right')"
        >
          <AppIcon
              name="mdi-format-align-justify"
              :size="22"
          />
        </button>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthSession } from '~/stores/auth-session'

interface AppIcon {
  name: string
  label: string
}

type HeaderLinkMenuItem = {
  title: string
  to?: string
  icon?: string
  target?: string
  external?: boolean
}

type HeaderLink = {
  icon?: string
  to?: string
  target?: string
  label?: string
  external?: boolean
  menuItems?: HeaderLinkMenuItem[]
}

type UserMenuItem = {
  title: string
  icon: string
  to?: string
  action?: 'logout'
}

const props = defineProps<{
  appIcons: AppIcon[]
  isDark: boolean
  isMobile: boolean
  locale: string
  locales: string[]
  showRightToggle: boolean
}>()

const isDarkMode = computed(() => props.isDark)

const emit = defineEmits([
  'toggle-left',
  'toggle-right',
  'toggle-theme',
  'go-back',
  'refresh',
  'update:locale',
])

const iconTriggerClasses =
  'flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2'


const { t } = useI18n()

const config = useConfig()

const { i18nEnabled, localePath } = useI18nDocs()
const gradient = computed(() => (isDarkMode.value ? "#000" : "#fff"))
const textGradient = computed(() => (isDarkMode.value ? "#fff" : "#000"))

const showInlineSearch = computed(
  () => !config.value.search.inAside && config.value.search.style === 'input',
)

const showSearchButton = computed(
  () => !config.value.search.inAside && config.value.search.style === 'button',
)

const localeLabel = computed(() => formatLocaleLabel(props.locale))

const headerLinks = computed<HeaderLink[]>(() => config.value.header.links ?? [])

const auth = useAuthSession()

const isAuthenticated = computed(() => auth.isAuthenticated.value)

const loggingOut = ref(false)

const userMenuItems = computed<UserMenuItem[]>(() => {
  if (isAuthenticated.value) {
    return [
      {
        title: t('layout.actions.viewProfile'),
        icon: 'mdi:account',
        to: '/profile',
      },
      {
        title: t('auth.signOut'),
        icon: 'mdi:logout',
        action: 'logout',
      },
    ]
  }

  return [
    {
      title: t('auth.Login'),
      icon: 'mdi:login',
      to: '/login',
    },
    {
      title: t('auth.Register'),
      icon: 'mdi:account-plus',
      to: '/register',
    },
  ]
})

const localeFlags: Record<string, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  ru: '🇷🇺',
  ar: '🇸🇦',
  'zh-cn': '🇨🇳',
}

function changeLocale(value: string) {
  emit('update:locale', value)
}

function formatLocaleLabel(value: string) {
  switch (value) {
    case 'en':
      return 'English'
    case 'de':
      return 'Deutsch'
    case 'fr':
      return 'Français'
    case 'es':
      return 'Español'
    case 'it':
      return 'Italiano'
    case 'ru':
      return 'Русский'
    case 'ar':
      return 'العربية'
    case 'zh-cn':
      return '中文 (简体)'
    default:
      return value
  }
}

function localeToFlag(value: string) {
  const normalized = value.toLowerCase()

  if (normalized in localeFlags) {
    return localeFlags[normalized]
  }

  const parts = normalized.split(/[-_]/).filter(Boolean)
  const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('')

  if (initials.length === 1 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  if (initials) {
    return initials
  }

  return value.toUpperCase()
}

function handleMenuItemSelect(item: HeaderLinkMenuItem) {
  if (!item?.to) return

  if (item.external) {
    if (typeof window !== 'undefined')
      window.open(item.to, item.target ?? '_blank')

    return
  }

  navigateTo(localePath(item.to))
}

function handleUserMenuSelect(item: UserMenuItem) {
  if (item.action === 'logout') {
    handleLogout()
    return
  }

  if (item.to) {
    navigateTo(localePath(item.to))
  }
}

async function handleLogout() {
  if (loggingOut.value)
    return

  loggingOut.value = true

  try {
    await auth.logout()
  }
  finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>

</style>
