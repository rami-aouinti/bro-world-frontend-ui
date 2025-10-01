import { computed, type ComputedRef } from "vue";
import { tryUseNuxtApp, useConfig } from "#imports";

interface DocsSiteConfig {
  name?: string;
  description?: string;
  ogImage?: string;
}

interface DocsSearchConfig {
  enable?: boolean;
  inAside?: boolean;
  style?: "input" | "button" | string;
  placeholder?: string;
  placeholderDetailed?: string;
}

interface DocsThemeConfig {
  customizable?: boolean;
  color?: string;
  radius?: number;
}

interface DocsHeaderConfig {
  title?: string;
  showTitle?: boolean;
  showLoadingIndicator?: boolean;
  darkModeToggle?: boolean;
  nav?: unknown[];
  links?: unknown[];
}

interface DocsAsideConfig {
  useLevel?: boolean;
  collapse?: boolean;
  folderStyle?: string;
  levelStyle?: string;
}

interface DocsMainConfig {
  breadCrumb?: boolean;
  showTitle?: boolean;
  codeCopyToast?: boolean;
  codeCopyToastText?: string;
  codeCopyIcon?: string;
}

interface DocsFooterConfig {
  credits?: string;
  links?: unknown[];
}

interface DocsTocConfig {
  enable?: boolean;
  enableInMobile?: boolean;
  enableInHomepage?: boolean;
  title?: string;
  links?: unknown[];
}

interface DocsBannerConfig {
  enable?: boolean;
  showClose?: boolean;
  border?: boolean;
  content?: string;
  to?: string;
  target?: string;
}

export interface DocsConfig {
  site?: DocsSiteConfig;
  search: DocsSearchConfig;
  theme: DocsThemeConfig;
  header: DocsHeaderConfig;
  aside: DocsAsideConfig;
  main: DocsMainConfig;
  footer: DocsFooterConfig;
  toc: DocsTocConfig;
  banner: DocsBannerConfig;
}

const fallbackConfig: DocsConfig = {
  site: {
    name: "Bro World",
    description: "Welcome to Bro World — your unique community platform.",
    ogImage: undefined,
  },
  search: {
    enable: true,
    inAside: false,
    style: "input",
    placeholder: "Search...",
    placeholderDetailed: "Search documentation...",
  },
  theme: {
    customizable: true,
    color: "zinc",
    radius: 0.75,
  },
  header: {
    title: "Bro World",
    showTitle: true,
    showLoadingIndicator: true,
    darkModeToggle: true,
    nav: [],
    links: [],
  },
  aside: {
    useLevel: true,
    collapse: false,
    folderStyle: "default",
    levelStyle: "aside",
  },
  main: {
    breadCrumb: true,
    showTitle: true,
    codeCopyToast: true,
    codeCopyToastText: "Copied to clipboard!",
    codeCopyIcon: "lucide:clipboard",
  },
  footer: {
    credits: "",
    links: [],
  },
  toc: {
    enable: true,
    enableInMobile: false,
    enableInHomepage: false,
    title: "On This Page",
    links: [],
  },
  banner: {
    enable: false,
    showClose: true,
    border: true,
    content: "",
    to: "",
    target: "_self",
  },
};

/**
 * Safe wrapper around `useConfig` from shadcn-docs-nuxt.
 *
 * Some parts of the application (e.g. tests or early module evaluation)
 * may execute before Nuxt has created a Vue instance. In that case calling
 * `useConfig` would throw because it relies on `useNuxtApp` internally.
 *
 * This helper attempts to call `useConfig` when a Nuxt app instance is
 * available, and otherwise returns a reactive fallback configuration that
 * mirrors the structure used throughout the UI.
 */
export function useDocsConfig(): ComputedRef<DocsConfig> {
  const nuxtApp = tryUseNuxtApp();

  if (!nuxtApp) {
    return computed(() => fallbackConfig);
  }

  return useConfig() as ComputedRef<DocsConfig>;
}
