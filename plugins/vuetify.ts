import type { IconProps } from 'vuetify'
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
        light: { colors: { primary } },
        dark: { colors: { primary } },
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
