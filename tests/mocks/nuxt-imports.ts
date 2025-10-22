import { computed, ref } from "vue";
import { vi } from "vitest";

import {
  __requestFetchSpy,
  __resetRequestFetchMock,
  __setRequestFetchMock,
  useRequestFetch as useAppRequestFetch,
} from "./nuxt-app";

type StateRef<T> = ReturnType<typeof ref<T>>;

const stateRegistry = new Map<string, StateRef<unknown>>();
const cookieRegistry = new Map<string, StateRef<unknown>>();
const routeRef = ref({
  path: "/",
  name: "index",
  meta: {} as Record<string, unknown>,
});

type DocsConfig = {
  site: {
    name: string;
    description: string;
  };
  header: {
    border: boolean;
    links: Array<Record<string, unknown>>;
    showTitleInMobile: boolean;
    darkModeToggle: boolean;
  };
  banner: {
    enable: boolean;
    showClose: boolean;
    border: boolean;
  };
  main: {
    padded: boolean;
  };
  aside: {
    useLevel: boolean;
    levelStyle: "aside" | "header";
  };
  search: {
    enable: boolean;
    inAside: boolean;
    style: "input" | "button";
    placeholder: string;
  };
  theme: {
    customizable: boolean;
    color: string;
    radius: number;
  };
  toc: {
    enable: boolean;
  };
  footer: Record<string, unknown>;
};

function createDefaultDocsConfig(): DocsConfig {
  return {
    site: {
      name: "Test Site",
      description: "Mock documentation site for tests.",
    },
    header: {
      border: false,
      links: [],
      showTitleInMobile: true,
      darkModeToggle: true,
    },
    banner: {
      enable: false,
      showClose: true,
      border: false,
    },
    main: {
      padded: true,
    },
    aside: {
      useLevel: false,
      levelStyle: "aside",
    },
    search: {
      enable: false,
      inAside: false,
      style: "input",
      placeholder: "search.placeholder",
    },
    theme: {
      customizable: true,
      color: "zinc",
      radius: 0.75,
    },
    toc: {
      enable: true,
    },
    footer: {},
  };
}

type RuntimeConfig = {
  useMockData: boolean;
  users: {
    useMocks: boolean;
  };
  public: {
    siteUrl: string;
    apiBase: string;
    postsApiBase: string;
    useMockData: boolean;
    redis: {
      listTtl: number;
      itemTtl: number;
      quizTtl: number;
      jobTtl: number;
      educationTtl: number;
      certificateTtl: number;
    };
    crmParticipants: {
      useMocks: boolean;
    };
    crmRequests: {
      useMocks: boolean;
    };
    crmProjects: {
      useMocks: boolean;
    };
    crmTasks: {
      useMocks: boolean;
    };
  };
  redis: {
    url: string;
    tls: boolean;
    keyPrefix: string;
    listTtl: number;
    itemTtl: number;
    helpTtl: number;
    profileTtl: number;
    settingsTtl: number;
    mercureTtl: number;
    quizTtl: number;
    educationTtl: number;
    certificateTtl: number;
  };
};

function createDefaultRuntimeConfig(): RuntimeConfig {
  return {
    useMockData: true,
    users: {
      useMocks: true,
    },
    public: {
      siteUrl: "",
      apiBase: "/api",
      postsApiBase: "https://fallback.test/",
      useMockData: true,
      redis: {
        listTtl: 60,
        itemTtl: 300,
        quizTtl: 300,
        jobTtl: 300,
        educationTtl: 300,
        certificateTtl: 60 * 60 * 24 * 7,
      },
      crmParticipants: {
        useMocks: true,
      },
      crmRequests: {
        useMocks: true,
      },
      crmProjects: {
        useMocks: true,
      },
      crmTasks: {
        useMocks: true,
      },
    },
    redis: {
      url: "",
      tls: false,
      keyPrefix: "bro-world",
      listTtl: 60,
      itemTtl: 300,
      jobTtl: 300,
      helpTtl: 300,
      profileTtl: 300,
      settingsTtl: 300,
      mercureTtl: 600,
      quizTtl: 300,
      educationTtl: 300,
      certificateTtl: 60 * 60 * 24 * 7,
    },
  } satisfies RuntimeConfig;
}

const docsConfig = ref<DocsConfig>(createDefaultDocsConfig());
let runtimeConfigOverride: Partial<RuntimeConfig> | null = null;

export function useRequestEvent() {
  return null;
}

export function useState<T>(key: string, init: () => T): StateRef<T> {
  if (!stateRegistry.has(key)) {
    stateRegistry.set(key, ref(init()));
  }

  return stateRegistry.get(key) as StateRef<T>;
}

export function useRequestFetch() {
  return useAppRequestFetch();
}

export function useRuntimeConfig() {
  const globalOverride = (globalThis as { useRuntimeConfig?: unknown }).useRuntimeConfig;

  if (typeof globalOverride === "function" && globalOverride !== useRuntimeConfig) {
    return (globalOverride as () => RuntimeConfig)();
  }

  const base = createDefaultRuntimeConfig();

  if (!runtimeConfigOverride) {
    return base;
  }

  return mergeRuntimeConfig(base, runtimeConfigOverride);
}

function mergeRuntimeConfig(base: RuntimeConfig, override: Partial<RuntimeConfig>): RuntimeConfig {
  const result = structuredClone(base);

  function assign(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const current = (target[key] ?? {}) as Record<string, unknown>;
        target[key] = assign({ ...current }, value as Record<string, unknown>);
        continue;
      }

      target[key] = value;
    }

    return target;
  }

  assign(result as unknown as Record<string, unknown>, override as Record<string, unknown>);

  return result;
}

export function __setMockRuntimeConfig(override: Partial<RuntimeConfig>) {
  runtimeConfigOverride = structuredClone(override);
}

export function __resetMockRuntimeConfig() {
  runtimeConfigOverride = null;
}

export async function callOnce<T>(_key: string, fn: () => T | Promise<T>) {
  return await fn();
}

export function useLocalePath() {
  return (path: string) => path;
}

export function useCookie<T>(name: string, _options?: Record<string, unknown>) {
  if (!cookieRegistry.has(name)) {
    cookieRegistry.set(name, ref<T | null>(null));
  }

  return cookieRegistry.get(name) as StateRef<T | null>;
}

const notifyMock = vi.fn();

export function useConfig() {
  return computed(() => docsConfig.value);
}

export function __setMockDocsConfig(override: Partial<DocsConfig>) {
  const base = createDefaultDocsConfig();
  docsConfig.value = {
    ...base,
    ...override,
    site: {
      ...base.site,
      ...override.site,
    },
    header: {
      ...base.header,
      ...override.header,
    },
    banner: {
      ...base.banner,
      ...override.banner,
    },
    main: {
      ...base.main,
      ...override.main,
    },
    aside: {
      ...base.aside,
      ...override.aside,
    },
    search: {
      ...base.search,
      ...override.search,
    },
    theme: {
      ...base.theme,
      ...override.theme,
    },
    toc: {
      ...base.toc,
      ...override.toc,
    },
    footer: {
      ...base.footer,
      ...override.footer,
    },
  };
}

export function useNuxtApp() {
  return {
    $fetch: useAppRequestFetch(),
    $notify: notifyMock,
  };
}

export function tryUseNuxtApp() {
  return useNuxtApp();
}

export function useI18n() {
  return {
    t: (key: string, params?: Record<string, unknown>) => {
      if (params && "name" in params) {
        return `${key}:${(params as { name: string }).name}`;
      }

      return key;
    },
  };
}

export function useRoute() {
  return routeRef.value;
}

export function __setMockRoute(
  route: Partial<{ path: string; name: string | null; meta: Record<string, unknown> }> | null,
) {
  if (!route) {
    routeRef.value = { path: "/", name: "index", meta: {} };
    return;
  }

  routeRef.value = {
    path: typeof route.path === "string" ? route.path : routeRef.value.path,
    name: (route.name ?? routeRef.value.name) as string | null,
    meta: {
      ...(routeRef.value.meta ?? {}),
      ...(route.meta ?? {}),
    },
  };
}

export function __resetNuxtStateMocks() {
  stateRegistry.clear();
  cookieRegistry.clear();
  docsConfig.value = createDefaultDocsConfig();
  routeRef.value = { path: "/", name: "index", meta: {} };
}

export function __getNuxtStateRef<T>(key: string): StateRef<T> | undefined {
  return stateRegistry.get(key) as StateRef<T> | undefined;
}

export function __getNotifyMock() {
  return notifyMock;
}

export function __resetNuxtNotifyMock() {
  notifyMock.mockReset();
}

export { __requestFetchSpy, __resetRequestFetchMock, __setRequestFetchMock };
