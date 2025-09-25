<template>
  <v-app-bar
    app
    flat
    height="72"
    class="app-top-bar"
  >
    <div class="flex items-center gap-3">
      <button
        v-if="isMobile"
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.openNavigation')"
        @click="emit('toggle-left')"
      >
        <v-icon
          icon="mdi-menu"
          size="24"
        />
      </button>
      <div class="flex items-center gap-2">
        <NuxtLink
          class="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold text-xl text-primary"
          to="/"
        >
          <span class="rounded-full bg-primary/10 px-2 py-1 text-base text-primary">Bro</span>
          <span class="text-foreground">World</span>
        </NuxtLink>
      </div>
    </div>

    <div class="hidden shrink-0 items-center gap-2 md:flex">
      <v-tooltip
        v-for="icon in appIcons"
        :key="icon.label"
        :text="t(icon.label)"
      >
        <template #activator="{ props: tooltipProps }">
          <button
            type="button"
            :class="iconPillClasses"
            v-bind="tooltipProps"
            :aria-label="t(icon.label)"
          >
            <v-icon
              :icon="icon.name"
              size="22"
            />
          </button>
        </template>
      </v-tooltip>
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

    <v-spacer />

    <div class="flex items-center gap-1">
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.toggleTheme')"
        @click="emit('toggle-theme')"
      >
        <v-icon
          :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          size="22"
        />
      </button>
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.goBack')"
        @click="emit('go-back')"
      >
        <v-icon
          icon="mdi-arrow-left"
          size="22"
        />
      </button>
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.refresh')"
        @click="emit('refresh')"
      >
        <v-icon
          icon="mdi-refresh"
          size="22"
        />
      </button>
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.notifications')"
      >
        <v-icon
          icon="mdi-bell"
          size="22"
        />
      </button>
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.cart')"
      >
        <v-icon
          icon="mdi-shopping"
          size="22"
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
            <v-avatar
              size="34"
              class="bg-primary/10 text-primary"
            >
              <span class="text-sm font-semibold">BW</span>
            </v-avatar>
          </button>
        </template>
        <v-list density="compact">
          <v-list-item
            :title="t('layout.actions.viewProfile')"
            prepend-icon="mdi-account"
          />
          <v-list-item
            :title="t('layout.actions.signOut')"
            prepend-icon="mdi-logout"
          />
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
            <v-avatar
              size="30"
              class="bg-transparent text-lg"
            >
              <span>{{ localeToFlag(props.locale) }}</span>
            </v-avatar>
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
        v-if="isMobile"
        type="button"
        :class="iconTriggerClasses"
        :aria-label="t('layout.actions.openWidgets')"
        @click="emit('toggle-right')"
      >
        <v-icon
          icon="mdi-dots-vertical"
          size="22"
        />
      </button>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
interface AppIcon {
  name: string
  label: string
}

const props = defineProps<{
  appIcons: AppIcon[]
  isDark: boolean
  isMobile: boolean
  locale: string
  locales: string[]
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

const iconPillClasses =
  'flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent bg-white/70 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2'

const { t } = useI18n()

const config = useConfig()

const showInlineSearch = computed(
  () => !config.value.search.inAside && config.value.search.style === 'input',
)

const showSearchButton = computed(
  () => !config.value.search.inAside && config.value.search.style === 'button',
)

const localeLabel = computed(() => formatLocaleLabel(props.locale))

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
</script>

<style scoped>
.app-top-bar {
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}
</style>
