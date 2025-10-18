import type { PiniaPluginContext, StateTree } from "pinia";

export interface StorageLike {
  getItem(key: string): string | null | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistedStateSerializer {
  serialize(value: unknown): string;
  deserialize(value: string): unknown;
}

export interface PersistedStateOptions {
  key?: string;
  storage?: StorageLike | null;
  paths?: string[];
  serializer?: PersistedStateSerializer;
}

interface NormalizedPersistedStateOption {
  key: string;
  storage: StorageLike;
  paths?: string[];
  serializer: PersistedStateSerializer;
}

export const persistedState = {
  localStorage: createBrowserStorage("localStorage"),
  sessionStorage: createBrowserStorage("sessionStorage"),
};

function createBrowserStorage(type: "localStorage" | "sessionStorage"): StorageLike {
  return {
    getItem(key: string) {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        return window[type]?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string) {
      if (typeof window === "undefined") {
        return;
      }

      try {
        window[type]?.setItem(key, value);
      } catch {
        // noop
      }
    },
    removeItem(key: string) {
      if (typeof window === "undefined") {
        return;
      }

      try {
        window[type]?.removeItem(key);
      } catch {
        // noop
      }
    },
  } satisfies StorageLike;
}

const defaultSerializer: PersistedStateSerializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value) as unknown,
};

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

function getNestedValue(state: StateTree, pathSegments: string[]) {
  return pathSegments.reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }

    return undefined;
  }, state);
}

function setNestedValue(target: Record<string, unknown>, pathSegments: string[], value: unknown) {
  let current = target;

  for (let index = 0; index < pathSegments.length; index += 1) {
    const segment = pathSegments[index];
    const isLast = index === pathSegments.length - 1;

    if (isLast) {
      current[segment] = cloneDeep(value);
      return;
    }

    if (!current[segment] || typeof current[segment] !== "object") {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }
}

function pickPersistedState(state: StateTree, paths?: string[]) {
  if (!paths || paths.length === 0) {
    return cloneDeep(state);
  }

  const picked: Record<string, unknown> = {};

  for (const path of paths) {
    if (!path) {
      continue;
    }

    const segments = path.split(".").filter(Boolean);

    if (!segments.length) {
      continue;
    }

    const value = getNestedValue(state, segments);

    if (value === undefined) {
      continue;
    }

    setNestedValue(picked, segments, value);
  }

  return picked;
}

function normalizeOptions(
  raw: PersistedStateOptions | PersistedStateOptions[],
  storeId: string,
): NormalizedPersistedStateOption[] {
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((entry) => ({
      key: entry.key ?? `pinia-${storeId}`,
      storage: entry.storage ?? persistedState.localStorage,
      paths: entry.paths,
      serializer: entry.serializer ?? defaultSerializer,
    }))
    .filter((entry): entry is NormalizedPersistedStateOption => Boolean(entry.storage));
}

export default function piniaPersistedStatePlugin(context: PiniaPluginContext) {
  const rawOptions = (context.options as { persist?: PersistedStateOptions | PersistedStateOptions[] }).persist;

  if (!rawOptions) {
    return;
  }

  const normalized = normalizeOptions(rawOptions, context.store.$id);

  if (!normalized.length) {
    return;
  }

  for (const options of normalized) {
    const storage = options.storage;
    const serializer = options.serializer;
    const storageKey = options.key;

    try {
      const storedValue = storage.getItem(storageKey);

      if (typeof storedValue === "string" && storedValue) {
        const value = serializer.deserialize(storedValue);

        if (value && typeof value === "object") {
          context.store.$patch(value as StateTree);
        }
      }
    } catch (error) {
      if (import.meta.dev) {
        console.warn("[pinia-persisted-state] Failed to restore store state", error);
      }
    }

    context.store.$subscribe(
      (_mutation, state) => {
        try {
          const toStore = pickPersistedState(state, options.paths);
          storage.setItem(storageKey, serializer.serialize(toStore));
        } catch (error) {
          if (import.meta.dev) {
            console.warn("[pinia-persisted-state] Failed to persist store state", error);
          }
        }
      },
      { detached: true },
    );
  }
}

declare module "pinia" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: PersistedStateOptions | PersistedStateOptions[];
  }
}
