import { useColorMode } from '@vueuse/core'
import { useCookie } from '#imports'

type ColorModeValue = 'light' | 'dark' | 'auto'

export function useCookieColorMode() {
  const colorModeCookie = useCookie<ColorModeValue>('color-mode', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return useColorMode<ColorModeValue>({
    storageKey: 'color-mode',
    storage: {
      getItem: () => colorModeCookie.value ?? 'auto',
      setItem: (_, value) => {
        colorModeCookie.value = value as ColorModeValue
      },
      removeItem: () => {
        colorModeCookie.value = null
      },
    },
  })
}
