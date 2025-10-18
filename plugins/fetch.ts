import { $fetch as ofetch } from "ofetch"
import { useRequestFetch } from "#imports"

type FetchFunction = typeof ofetch

function resolveAppFetch() {
  if (import.meta.server) {
    const requestFetch = useRequestFetch()

    return ((request: Parameters<FetchFunction>[0], options?: Parameters<FetchFunction>[1]) =>
      requestFetch(request, options)) as FetchFunction
  }

  const globalScope = globalThis as typeof globalThis & { $fetch?: FetchFunction }
  const globalFetch = globalScope.$fetch ?? ofetch

  return ((request: Parameters<FetchFunction>[0], options?: Parameters<FetchFunction>[1]) =>
    globalFetch(request, options)) as FetchFunction
}

export default defineNuxtPlugin(() => {
  const appFetch = resolveAppFetch()

  return {
    provide: {
      fetch: appFetch,
    },
  }
})
