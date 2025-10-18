import { defineNuxtPlugin } from "#app";
import { useLocalStorage } from "@vueuse/core";
import type { PiniaPluginContext } from "pinia";

type PersistOption = boolean | { key?: string; paths?: string[] };

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function pickPaths(state: Record<string, unknown>, paths?: string[]) {
  if (!paths || !paths.length) {
    return cloneState(state);
  }

  const picked: Record<string, unknown> = {};
  for (const key of paths) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      picked[key] = cloneState(state[key]);
    }
  }
  return picked;
}

export default defineNuxtPlugin({
  name: "pinia-persisted-state",
  dependsOn: ["pinia-plugin"],
  setup(nuxtApp) {
    const pinia = nuxtApp.$pinia;
    if (!pinia) {
      return;
    }

    pinia.use((context: PiniaPluginContext) => {
      const persist = (context.options as { persist?: PersistOption }).persist;
      if (!persist) {
        return;
      }

      const options = typeof persist === "object" ? persist : {};
      const key = options.key ?? `pinia-${context.store.$id}`;
      const paths = options.paths;

      const storage = useLocalStorage<Record<string, unknown> | null>(key, null, { deep: true });
      const storedValue = storage.value;

      if (storedValue) {
        context.store.$patch(storedValue as Record<string, unknown>);
      } else {
        storage.value = pickPaths(context.store.$state as Record<string, unknown>, paths);
      }

      context.store.$subscribe(
        (_mutation, state) => {
          storage.value = pickPaths(state as Record<string, unknown>, paths);
        },
        { detached: true },
      );
    });
  },
});
