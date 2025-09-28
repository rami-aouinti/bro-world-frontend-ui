import type { IconProps, ThemeDefinition } from 'vuetify'
import { h } from 'vue'
import type { VDataTable } from 'vuetify/components'
import {
  VAlert,
  VApp,
  VAppBar,
  VAvatar,
  VBtn,
  VBtnToggle,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
  VCol,
  VContainer,
  VDataTable as VDataTableComponent,
  VDialog,
  VDivider,
  VExpansionPanel,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VExpansionPanels,
  VForm,
  VIcon,
  VImg,
  VList,
  VListItem,
  VListItemTitle,
  VMain,
  VMenu,
  VNavigationDrawer,
  VPagination,
  VProgressCircular,
  VProgressLinear,
  VRow,
  VSelect,
  VSheet,
  VSkeletonLoader,
  VSnackbar,
  VSpacer,
  VSwitch,
  VTextField,
  VTextarea,
  VTimeline,
  VTimelineItem,
  VToolbar,
  VTooltip,
} from 'vuetify/components'
import { Ripple } from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { createVuetify } from 'vuetify'
import { aliases } from 'vuetify/iconsets/mdi'
import DateFnsAdapter from '@date-io/date-fns'
import enUSLocale from 'date-fns/locale/en-US'
import frLocale from 'date-fns/locale/fr'
import deLocale from 'date-fns/locale/de'
import itLocale from 'date-fns/locale/it'
import esLocale from 'date-fns/locale/es'
import ruLocale from 'date-fns/locale/ru'
import arLocale from 'date-fns/locale/ar-SA'

export type DataTableHeaders = VDataTable['$props']['headers']

export default defineNuxtPlugin((nuxtApp) => {
  const primaryCookie = useCookie<string | null>('theme-primary', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    watch: false,
  })
  const primary = primaryCookie.value ?? '#E91E63'

  const localeCookie = useCookie<string | null>('i18n_redirected', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    watch: false,
  })
  const locale = localeCookie.value ?? 'en'
  const nuxtIconComponent = nuxtApp.vueApp.component('Icon')

  const sharedVariables = {
    'font-family-base': "'Inter', 'Helvetica Neue', Arial, sans-serif",
    'font-family-display': "'Plus Jakarta Sans', 'Inter', sans-serif",
    'font-size-root': '16px',
    'line-height-base': 1.5,
    'text-h1-size': '3.25rem',
    'text-h1-line-height': 1.2,
    'text-h1-letter-spacing': '-0.02em',
    'text-h1-weight': 600,
    'text-h2-size': '2.5rem',
    'text-h2-line-height': 1.25,
    'text-h2-letter-spacing': '-0.015em',
    'text-h2-weight': 600,
    'text-h3-size': '2rem',
    'text-h3-line-height': 1.3,
    'text-h3-letter-spacing': '-0.01em',
    'text-h3-weight': 600,
    'text-h4-size': '1.5rem',
    'text-h4-line-height': 1.35,
    'text-h4-letter-spacing': '-0.005em',
    'text-h4-weight': 600,
    'text-h5-size': '1.25rem',
    'text-h5-line-height': 1.4,
    'text-h5-letter-spacing': '-0.0025em',
    'text-h5-weight': 600,
    'text-h6-size': '1rem',
    'text-h6-line-height': 1.45,
    'text-h6-letter-spacing': '0',
    'text-h6-weight': 600,
    'text-body-1-size': '1rem',
    'text-body-1-line-height': 1.6,
    'text-body-2-size': '0.875rem',
    'text-body-2-line-height': 1.6,
    'btn-letter-spacing': '0.02em',
    'btn-height': '2.75rem',
    'btn-padding-x': 'var(--v-space-4)',
    'input-font-size': '0.9375rem',
    'input-line-height': 1.4,
    'input-min-height': '2.75rem',
    'field-border-radius': 'var(--v-radius-md)',
    'space-0': '0rem',
    'space-1': '0.25rem',
    'space-2': '0.5rem',
    'space-3': '0.75rem',
    'space-4': '1rem',
    'space-5': '1.5rem',
    'space-6': '2rem',
    'space-7': '2.5rem',
    'space-8': '3rem',
    'radius-none': '0',
    'radius-xs': '0.125rem',
    'radius-sm': '0.25rem',
    'radius-md': '0.5rem',
    'radius-lg': '0.75rem',
    'radius-xl': '1rem',
    'radius-pill': '9999px',
    'border-width': '1px',
  } as const

  const lightTheme: ThemeDefinition = {
    dark: false,
    colors: {
      primary,
      'on-primary': '#FFFFFF',
      'primary-container': '#FFD9E2',
      'on-primary-container': '#400019',
      secondary: '#475569',
      'on-secondary': '#FFFFFF',
      'secondary-container': '#E2E8F0',
      'on-secondary-container': '#0F172A',
      success: '#2E7D32',
      'on-success': '#FFFFFF',
      warning: '#ED6C02',
      'on-warning': '#1F1300',
      error: '#D32F2F',
      'on-error': '#FFFFFF',
      info: '#0288D1',
      'on-info': '#FFFFFF',
      background: '#F5F7FA',
      'on-background': '#1F2933',
      surface: '#FFFFFF',
      'on-surface': '#1F2933',
      'surface-bright': '#FDFEFF',
      'surface-light': '#F7F9FC',
      'surface-variant': '#E4E7EC',
      'on-surface-variant': '#52616B',
      outline: '#CBD2D9',
      'outline-variant': '#E4E7EC',
      shadow: '#0B1526',
      scrim: '#000000',
      'inverse-surface': '#1F2933',
      'inverse-on-surface': '#F5F7FA',
      'inverse-primary': '#FFB0C5',
    },
    variables: {
      ...sharedVariables,
      'elevation-shadow': '0px 1px 2px rgba(15, 23, 42, 0.08)',
      'border-color': '#E4E7EC',
    },
  }

  const darkTheme: ThemeDefinition = {
    dark: true,
    colors: {
      primary,
      'on-primary': '#1B0410',
      'primary-container': '#930039',
      'on-primary-container': '#FFD9E2',
      secondary: '#9CA3AF',
      'on-secondary': '#111827',
      'secondary-container': '#1F2937',
      'on-secondary-container': '#E5E7EB',
      success: '#81C784',
      'on-success': '#0F2610',
      warning: '#FFB74D',
      'on-warning': '#301800',
      error: '#EF5350',
      'on-error': '#2B0A0A',
      info: '#4FC3F7',
      'on-info': '#062434',
      background: '#0F172A',
      'on-background': '#E5E7EB',
      surface: '#111827',
      'on-surface': '#F9FAFB',
      'surface-bright': '#1F2937',
      'surface-light': '#1C2534',
      'surface-variant': '#1F2937',
      'on-surface-variant': '#CBD5F5',
      outline: '#374151',
      'outline-variant': '#1F2937',
      shadow: '#000000',
      scrim: '#000000',
      'inverse-surface': '#F9FAFB',
      'inverse-on-surface': '#0F172A',
      'inverse-primary': '#FFB0C5',
    },
    variables: {
      ...sharedVariables,
      'elevation-shadow': '0px 1px 2px rgba(15, 23, 42, 0.35)',
      'border-color': '#1F2937',
    },
  }

  const vuetify = createVuetify({
    ssr: true,
    components: {
      VAlert,
      VApp,
      VAppBar,
      VAvatar,
      VBtn,
      VBtnToggle,
      VCard,
      VCardActions,
      VCardText,
      VCardTitle,
      VCheckbox,
      VChip,
      VCol,
      VContainer,
      VDataTable: VDataTableComponent,
      VDialog,
      VDivider,
      VExpansionPanel,
      VExpansionPanelText,
      VExpansionPanelTitle,
      VExpansionPanels,
      VForm,
      VIcon,
      VImg,
      VList,
      VListItem,
      VListItemTitle,
      VMain,
      VMenu,
      VNavigationDrawer,
      VPagination,
      VProgressCircular,
      VProgressLinear,
      VRow,
      VSelect,
      VSheet,
      VSkeletonLoader,
      VSnackbar,
      VSpacer,
      VSwitch,
      VTextField,
      VTextarea,
      VTimeline,
      VTimelineItem,
      VToolbar,
      VTooltip,
      VDateInput,
    },
    directives: {
      Ripple,
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
    },
    locale: {
      locale,
      fallback: 'en',
    },
    date: {
      adapter: DateFnsAdapter,
      locale: {
        en: enUSLocale,
        fr: frLocale,
        de: deLocale,
        ar: arLocale,
        it: itLocale,
        es: esLocale,
        ru: ruLocale,
      },
    },
    icons: {
      defaultSet: 'nuxtIcon',
      sets: {
        nuxtIcon: {
          component: ({ icon, tag = 'span', ...rest }: IconProps) => {
            const resolvedIconName =
              typeof icon === 'string'
                ? (aliases[icon] as string | undefined) ?? icon
                : icon

            if (!nuxtIconComponent || typeof resolvedIconName !== 'string') {
              return h(tag, rest)
            }

            return h(tag, rest, [h(nuxtIconComponent, { name: resolvedIconName })])
          },
        },
      },
      aliases,
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
