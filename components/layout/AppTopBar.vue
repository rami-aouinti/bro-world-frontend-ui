<template>
  <v-app-bar
      class="app-top-bar"
      :class="isDark ? 'text-white' : 'text-black'"
      :color="textGradient"
      app
      :elevation="10" rounded
      height="50"
  >
    <template v-slot:image>
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
        <Icon
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
          <Icon
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
          <Icon
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
          <Icon
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

    <UiButton
        v-if="isAuthenticated"
        variant="ghost"
        size="icon"
        class="flex gap-2"
        :aria-label="t('auth.signOut')"
        :disabled="loggingOut"
        @click="handleLogout"
    >
      <AppSmartIcon
          name="mdi:logout"
          :size="18"
      />
      <span class="sr-only">{{ t('auth.signOut') }}</span>
    </UiButton>
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
            <Icon
                :name="resolveIconName(icon.name)"
                :size="26"
            />
          </v-btn>
        </template>
      </v-tooltip>
    </div>
    <template v-slot:append>
      <div class="flex items-center gap-3">
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.notifications')"
        >
          <Icon
              name="mdi:bell-outline"
              :size="22"
          />
        </button>
        <button
            type="button"
            :class="iconTriggerClasses"
            :aria-label="t('layout.actions.cart')"
        >
          <Icon
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
              <Icon
                  name="mdi:person-outline"
                  :size="22"
              />
            </button>
          </template>
          <v-list density="compact">
            <v-list-item :title="t('layout.actions.viewProfile')">
              <template #prepend>
                <Icon
                    name="mdi:account"
                    :size="20"
                />
              </template>
            </v-list-item>
            <v-list-item :title="t('layout.actions.signOut')">
              <template #prepend>
                <Icon
                    name="mdi:logout"
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
              <Icon
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
            @click="emit('toggle-right')"
        >
          <Icon
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
          <Icon
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

const isDark = computed(() => useColorMode().value == "dark");

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

const props = defineProps<{
  appIcons: AppIcon[]
  isDark: boolean
  isMobile: boolean
  locale: string
  locales: string[]
  showRightToggle: boolean
}>()

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
const gradient = computed(() => (isDark.value ? "#000" : "#fff"));
const textGradient = computed(() => (isDark.value ? "#fff" : "#000"));

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

function resolveIconName(name?: string) {
  if (!name)
    return ''

  if (name.includes(':'))
    return name

  if (name.startsWith('mdi-'))
    return `mdi:${name.slice(4)}`

  return name
}

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
