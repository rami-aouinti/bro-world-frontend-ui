import { ref } from 'vue'

type StateRef<T> = ReturnType<typeof ref<T>>

const stateRegistry = new Map<string, StateRef<any>>()

export function useState<T>(key: string, init: () => T): StateRef<T> {
  if (!stateRegistry.has(key)) {
    stateRegistry.set(key, ref(init()))
  }

  return stateRegistry.get(key) as StateRef<T>
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

export function __resetNuxtStateMocks() {
  stateRegistry.clear()
}

export function __getNuxtStateRef<T>(key: string): StateRef<T> | undefined {
  return stateRegistry.get(key) as StateRef<T> | undefined
}
