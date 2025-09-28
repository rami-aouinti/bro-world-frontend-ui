import { computed, watch } from 'vue'
import { useColorMode } from '@vueuse/core'
import type { Theme } from 'shadcn-docs-nuxt/lib/themes'
import { themes } from 'shadcn-docs-nuxt/lib/themes'

interface ThemeCookieConfig {
  theme: Theme['name']
  radius: number
}

function parseHslComponents(hsl?: string) {
  if (!hsl) {
    return null
  }

  const trimmed = hsl.trim().replace(/^hsl\(/i, '').replace(/\)$/i, '')
  const match = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%(?:\s*\/\s*(\d+(?:\.\d+)?)%)?$/,
  )

  if (!match) {
    return null
  }

  const [, hue, saturation, lightness] = match

  return {
    hue: ((Number(hue) % 360) + 360) % 360,
    saturation: Number(saturation),
    lightness: Number(lightness),
  }
}

function hslToHex({ hue, saturation, lightness }: NonNullable<ReturnType<typeof parseHslComponents>>) {
  const s = Math.max(0, Math.min(100, saturation)) / 100
  const l = Math.max(0, Math.min(100, lightness)) / 100

  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const hueSegment = hue / 60
  const intermediate = chroma * (1 - Math.abs((hueSegment % 2) - 1))

  let red = 0
  let green = 0
  let blue = 0

  if (hueSegment >= 0 && hueSegment < 1) {
    red = chroma
    green = intermediate
  } else if (hueSegment >= 1 && hueSegment < 2) {
    red = intermediate
    green = chroma
  } else if (hueSegment >= 2 && hueSegment < 3) {
    green = chroma
    blue = intermediate
  } else if (hueSegment >= 3 && hueSegment < 4) {
    green = intermediate
    blue = chroma
  } else if (hueSegment >= 4 && hueSegment < 5) {
    red = intermediate
    blue = chroma
  } else {
    red = chroma
    blue = intermediate
  }

  const matchLightness = l - chroma / 2

  function toHex(value: number) {
    return Math.round((value + matchLightness) * 255)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

export function useThemes() {
  const config = useConfig()

  function resolveThemeDefaults(): ThemeCookieConfig {
    const defaults = config.value.theme ?? {}
    const fallbackThemeName =
      (defaults.color as Theme['name'] | undefined) ?? themes[0]?.name ?? 'zinc'
    const fallbackRadius =
      typeof defaults.radius === 'number' ? defaults.radius : 0.75

    return {
      theme: fallbackThemeName,
      radius: fallbackRadius,
    }
  }

  const colorModeCookie = useCookie<'light' | 'dark' | 'auto'>('color-mode', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const colorMode = useColorMode({
    storageKey: 'color-mode',
    storage: {
      getItem: () => colorModeCookie.value ?? 'auto',
      setItem: (_, value) => {
        colorModeCookie.value = value as typeof colorModeCookie.value
      },
      removeItem: () => {
        colorModeCookie.value = null
      },
    },
  })
  const isDark = computed(() => colorMode.value === 'dark')

  const themeCookie = useCookie<ThemeCookieConfig>('theme', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    default: resolveThemeDefaults,
  })

  const theme = computed<Theme['name']>(() => themeCookie.value?.theme ?? resolveThemeDefaults().theme)
  const radius = computed(() => themeCookie.value?.radius ?? resolveThemeDefaults().radius)
  const themeClass = computed(() => `theme-${theme.value}`)

  function setTheme(themeName: Theme['name']) {
    themeCookie.value = {
      ...resolveThemeDefaults(),
      ...themeCookie.value,
      theme: themeName,
    }
  }

  function setRadius(newRadius: number) {
    themeCookie.value = {
      ...resolveThemeDefaults(),
      ...themeCookie.value,
      radius: newRadius,
    }
  }

  const primarySource = computed(() => {
    const selectedTheme = themes.find((candidate) => candidate.name === theme.value)
    const palette = selectedTheme?.cssVars[isDark.value ? 'dark' : 'light']
    const primary = palette?.primary

    return primary ? `hsl(${primary})` : null
  })

  const themePrimary = computed(() => primarySource.value ?? undefined)

  const themePrimaryHex = computed(() => {
    const components = parseHslComponents(primarySource.value ?? undefined)

    if (!components) {
      return undefined
    }

    return hslToHex(components)
  })

  const themePrimaryCookie = useCookie<string | null>('theme-primary', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  if (!themePrimaryCookie.value && themePrimaryHex.value) {
    themePrimaryCookie.value = themePrimaryHex.value
  }

  watch(
    themePrimaryHex,
    (value) => {
      themePrimaryCookie.value = value ?? null
    },
    { immediate: true },
  )

  return {
    themeClass,
    theme,
    setTheme,
    radius,
    setRadius,
    themePrimary,
    themePrimaryHex,
  }
}
