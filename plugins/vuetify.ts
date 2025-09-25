import type { IconProps } from 'vuetify'
import { h } from 'vue'
import type { VDataTable } from 'vuetify/components'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import { useStorage } from '@vueuse/core'
import { aliases } from 'vuetify/iconsets/mdi'
import DateFnsAdapter from '@date-io/date-fns'
import enUSLocale from 'date-fns/locale/en-US'
import frLocale from 'date-fns/locale/fr'
import deLocale from 'date-fns/locale/de'
import itLocale from 'date-fns/locale/it'
import esLocale from 'date-fns/locale/es'
import ruLocale from 'date-fns/locale/ru'
import arLocale from 'date-fns/locale/ar-SA'

import '@/assets/styles/material-dashboard.scss'
import "flag-icons"

export type DataTableHeaders = VDataTable['$props']['headers']

function getStoredValue<T>(key: string, fallback: T): T {
  if (import.meta.client) {
    return useStorage<T>(key, fallback).value
  }

  return fallback
}

export default defineNuxtPlugin((nuxtApp) => {
  const primary = getStoredValue('theme-primary', '#E91E63')
  const locale = getStoredValue('locale', 'en')
  const nuxtIconComponent = nuxtApp.vueApp.component('Icon')

  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...vuetifyComponents,
      VDateInput,
    },
    directives: {
      ...vuetifyDirectives,
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
