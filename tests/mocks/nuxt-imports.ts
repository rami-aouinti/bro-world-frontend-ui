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

const docsConfig = ref<DocsConfig>(createDefaultDocsConfig());

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
  return {
    public: {
      siteUrl: "",
      apiBase: "/api",
      postsApiBase: "https://fallback.test/",
      redis: {
        listTtl: 60,
        itemTtl: 300,
      },
      crmProjects: {
        useMocks: true,
      },
    },
    redis: {
      listTtl: 60,
      itemTtl: 300,
    },
  };
}

export async function callOnce<T>(fn: () => T | Promise<T>) {
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

export function __resetNuxtStateMocks() {
  stateRegistry.clear();
  cookieRegistry.clear();
  docsConfig.value = createDefaultDocsConfig();
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
