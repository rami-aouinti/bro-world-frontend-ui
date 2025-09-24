import type { IconProps } from 'vuetify'
import { h } from 'vue'
import type { VDataTable } from 'vuetify/components'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useStorage } from '@vueuse/core'
import { aliases } from 'vuetify/iconsets/mdi'

import { useNuxtApp } from '#app'
import DateFnsAdapter from '@date-io/date-fns'
import enUS from 'date-fns/locale/en-US'
import frFR from 'date-fns/locale/fr'
import deDE from 'date-fns/locale/de'
import arSA from 'date-fns/locale/ar-SA'
import { en, fr, de, ar } from 'vuetify/locale'

import '@/assets/styles/material-dashboard.scss'
import "flag-icons"

export type DataTableHeaders = VDataTable['$props']['headers']

export default defineNuxtPlugin((nuxtApp) => {
  const { $i18n } = useNuxtApp()
  const currentLocale = useStorage('locale', 'en').value
  nuxtApp.hook('vuetify:configuration', ({ vuetifyOptions }) => {


    vuetifyOptions.date = {
      adapter: DateFnsAdapter,
      locale: {
        en: enUS,
        fr: frFR,
        de: deDE,
        ar: arSA,
      },
    }

    vuetifyOptions.components = {
      ...(vuetifyOptions.components ?? {}),
      VDateInput,
    }

    const primary = useStorage('theme-primary', '#E91E63').value
    vuetifyOptions.theme = {
      themes: {
        light: { colors: { primary } },
        dark: { colors: { primary } },
      },
    }

    const nuxtIconComponent = nuxtApp.vueApp.component('Icon')
    vuetifyOptions.icons = {
      defaultSet: 'nuxtIcon',
      sets: {
        nuxtIcon: {
          component: ({ icon, tag, ...rest }: IconProps) => {
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
    }
  })
})
