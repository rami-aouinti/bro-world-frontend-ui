import { effectScope, getCurrentInstance, reactive } from "vue";
import type { App } from "vue";

interface PiniaInstance {
  install: (app: App) => void;
  _a: App | null;
  _s: Map<string, unknown>;
  state: Record<string, unknown>;
}

const PINIA_SYMBOL: unique symbol = Symbol("pinia");

let activePinia: PiniaInstance | null = null;

export function setActivePinia(pinia: PiniaInstance | null) {
  activePinia = pinia;
}

export function getActivePinia(): PiniaInstance | null {
  return activePinia;
}

function resolveInjectedPinia(instance: ReturnType<typeof getCurrentInstance>) {
  if (!instance) {
    return undefined;
  }

  return instance.appContext.provides[PINIA_SYMBOL as symbol] as PiniaInstance | undefined;
}

export function createPinia(): PiniaInstance {
  const stores = new Map<string, unknown>();
  const state = reactive<Record<string, unknown>>({});

  const pinia: PiniaInstance = {
    install(app: App) {
      if (pinia._a && pinia._a !== app) {
        return;
      }

      pinia._a = app;
      app.provide(PINIA_SYMBOL as symbol, pinia);
      app.config.globalProperties.$pinia = pinia;
      setActivePinia(pinia);
    },
    _a: null,
    _s: stores,
    state,
  };

  return pinia;
}

export function defineStore<StoreReturn>(
  id: string,
  setup: () => StoreReturn,
): (pinia?: PiniaInstance | null) => StoreReturn {
  return function useStore(passedPinia?: PiniaInstance | null) {
    const currentInstance = getCurrentInstance();
    const resolvedPinia =
      passedPinia ?? resolveInjectedPinia(currentInstance) ?? activePinia;
    const pinia = resolvedPinia ?? null;

    if (!pinia) {
      throw new Error(
        "[pinia-shim] Pinia instance is not available. Ensure the Pinia plugin is registered.",
      );
    }

    setActivePinia(pinia);

    if (!pinia._s.has(id)) {
      const scope = effectScope(true);
      const store = scope.run(() => {
        setActivePinia(pinia);
        return setup();
      });

      if (!store) {
        throw new Error(`[pinia-shim] Store setup for "${id}" did not return a value.`);
      }

      pinia._s.set(id, store);
    }

    return pinia._s.get(id) as StoreReturn;
  };
}
