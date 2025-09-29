import { ref } from 'vue'
import { vi } from 'vitest'

import {
  __requestFetchSpy,
  __resetRequestFetchMock,
  __setRequestFetchMock,
  useRequestFetch as useAppRequestFetch,
} from './nuxt-app'

type StateRef<T> = ReturnType<typeof ref<T>>

const stateRegistry = new Map<string, StateRef<unknown>>()
const cookieRegistry = new Map<string, StateRef<unknown>>()

export function useRequestEvent() {
  return null
}

export function useState<T>(key: string, init: () => T): StateRef<T> {
  if (!stateRegistry.has(key)) {
    stateRegistry.set(key, ref(init()))
  }

  return stateRegistry.get(key) as StateRef<T>
}

export function useRequestFetch() {
  return useAppRequestFetch()
}

export function useRuntimeConfig() {
  return {
    redis: {
      listTtl: 60,
      itemTtl: 300,
    },
  }
}

export async function callOnce<T>(fn: () => T | Promise<T>) {
  return await fn()
}

export function useLocalePath() {
  return (path: string) => path
}

export function useCookie<T>(name: string, _options?: Record<string, unknown>) {
  if (!cookieRegistry.has(name)) {
    cookieRegistry.set(name, ref<T | null>(null))
  }

  return cookieRegistry.get(name) as StateRef<T | null>
}

const notifyMock = vi.fn()

export function useNuxtApp() {
  return {
    $notify: notifyMock,
  }
}

export function useI18n() {
  return {
    t: (key: string, params?: Record<string, unknown>) => {
      if (params && 'name' in params) {
        return `${key}:${(params as { name: string }).name}`
      }

      return key
    },
  }
}

export function __resetNuxtStateMocks() {
  stateRegistry.clear()
  cookieRegistry.clear()
}

export function __getNuxtStateRef<T>(key: string): StateRef<T> | undefined {
  return stateRegistry.get(key) as StateRef<T> | undefined
}

export function __getNotifyMock() {
  return notifyMock
}

export function __resetNuxtNotifyMock() {
  notifyMock.mockReset()
}

export { __requestFetchSpy, __resetRequestFetchMock, __setRequestFetchMock }
