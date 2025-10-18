import { effectScope, getCurrentInstance, reactive } from "vue";
import type { App } from "vue";

interface PiniaInstance {
  install: (app: App) => void;
  use: (plugin: unknown) => PiniaInstance;
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
    use() {
      return pinia;
    },
    _a: null,
    _s: stores,
    state,
  };

  setActivePinia(pinia);

  return pinia;
}

type StoreOptions<StoreState extends Record<string, unknown>, StoreActions> = {
  state?: () => StoreState;
  actions?: StoreActions;
};

export function defineStore<StoreReturn>(
  id: string,
  setup: () => StoreReturn,
): (pinia?: PiniaInstance | null) => StoreReturn;

export function defineStore<
  StoreState extends Record<string, unknown>,
  StoreActions extends Record<string, (...args: unknown[]) => unknown>,
>(
  id: string,
  options: StoreOptions<StoreState, StoreActions>,
): (pinia?: PiniaInstance | null) => StoreState & StoreActions;

export function defineStore(
  id: string,
  setupOrOptions:
    | (() => unknown)
    | StoreOptions<
        Record<string, unknown>,
        Record<string, (...args: unknown[]) => unknown>
      >,
): (pinia?: PiniaInstance | null) => unknown {
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
        if (typeof setupOrOptions === "function") {
          return setupOrOptions();
        }

        const { state: stateFn, actions } = setupOrOptions;
        const state = reactive(stateFn ? stateFn() : {});
        const storeWithActions = state as Record<string, unknown>;

        if (actions) {
          for (const [key, action] of Object.entries(actions)) {
            Object.defineProperty(storeWithActions, key, {
              value: (...args: unknown[]) =>
                (action as (...args: unknown[]) => unknown).apply(
                  storeWithActions,
                  args,
                ),
              enumerable: true,
              configurable: true,
              writable: true,
            });
          }
        }

        pinia.state[id] = state;

        return storeWithActions;
      });

      if (!store) {
        throw new Error(`[pinia-shim] Store setup for "${id}" did not return a value.`);
      }

      pinia._s.set(id, store);
    }

    return pinia._s.get(id) as StoreReturn;
  };
}
