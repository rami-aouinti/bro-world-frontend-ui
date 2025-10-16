import { effectScope, getCurrentInstance, inject, reactive } from "vue";
import type { App } from "vue";

interface PiniaInstance {
  install: (app: App) => void;
  _a: App | null;
  _s: Map<string, unknown>;
  state: Record<string, unknown>;
}

const PINIA_SYMBOL = Symbol("pinia");
let activePinia: PiniaInstance | null = null;

function setActivePinia(pinia: PiniaInstance | null) {
  activePinia = pinia;
}

let activePinia: PiniaInstance | null = null;

function setActivePinia(pinia: PiniaInstance | null) {
  activePinia = pinia;
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
      app.provide(PINIA_SYMBOL, pinia);
      app.config.globalProperties.$pinia = pinia;
      setActivePinia(pinia);
    },
    _a: null,
    _s: stores,
    state,
  };

  setActivePinia(pinia);

  return pinia;
}

export function defineStore<StoreReturn>(id: string, setup: () => StoreReturn): () => StoreReturn {
  return function useStore() {
    const instance = getCurrentInstance();
    let pinia: PiniaInstance | undefined;

    if (instance) {
      pinia = inject<PiniaInstance | undefined>(PINIA_SYMBOL);
    }

    if (!pinia && activePinia) {
      pinia = activePinia;
    }

    if (!pinia) {
      throw new Error(
        "[pinia-shim] Pinia instance is not available. Ensure the Pinia plugin is registered.",
      );
    }

    setActivePinia(pinia);

    if (!pinia._s.has(id)) {
      const scope = effectScope(true);
      const store = scope.run(setup);

      if (!store) {
        throw new Error(`[pinia-shim] Store setup for "${id}" did not return a value.`);
      }

      pinia._s.set(id, store);
    }

    return pinia._s.get(id) as StoreReturn;
  };
}
