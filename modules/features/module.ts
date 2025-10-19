import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addServerScanDir,
  createResolver,
  defineNuxtModule,
  extendPages,
} from "@nuxt/kit";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

type ModuleOptions = {
  /**
   * Explicit list of feature directories to enable. When empty every feature is loaded.
   */
  enabled?: string[];
  /**
   * Feature directories to ignore even when discovered on disk.
   */
  disabled?: string[];
};

const JS_EXTENSIONS = new Set([".ts", ".js", ".mjs", ".cjs", ".tsx", ".jsx"]);
const PAGE_EXTENSIONS = new Set([".vue"]);

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function scanFeatureSlugs(rootDir: string): string[] {
  if (!existsSync(rootDir)) {
    return [];
  }

  return readdirSync(rootDir)
    .map((name) => ({ name, path: join(rootDir, name) }))
    .filter((entry) => isDirectory(entry.path))
    .map((entry) => entry.name)
    .sort();
}

function normalizeToPosix(path: string): string {
  return path.replace(/\\+/g, "/");
}

function collectFiles(dir: string, predicate: (file: string) => boolean, accumulator: string[] = []): string[] {
  if (!existsSync(dir)) {
    return accumulator;
  }

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (isDirectory(path)) {
      collectFiles(path, predicate, accumulator);
      continue;
    }

    if (predicate(path)) {
      accumulator.push(path);
    }
  }

  return accumulator;
}

function withoutExtension(path: string): string {
  const extension = extname(path);
  return extension ? path.slice(0, -extension.length) : path;
}

function transformSegmentToRoute(segment: string, isLast: boolean): string {
  if (segment === "index" && isLast) {
    return "";
  }

  const dynamic = /^(\[\[?)(.*?)(\]?\])$/.exec(segment);

  if (!dynamic) {
    return segment;
  }

  const [, opening, innerRaw] = dynamic;
  const optional = opening.length === 2;
  const catchAll = innerRaw.startsWith("...");
  const inner = catchAll ? innerRaw.slice(3) : innerRaw;

  if (!inner) {
    return "";
  }

  let route = `:${inner}`;

  if (catchAll) {
    route += "(.*)*";
  }

  if (optional && !catchAll) {
    route += "?";
  }

  return route;
}

function createRouteName(feature: string, segments: string[]): string {
  const cleaned = segments
    .filter((segment, index) => !(segment === "index" && index === segments.length - 1))
    .map((segment) =>
      segment
        .replace(/^\[\[?\.\.\./, "")
        .replace(/^\[\[/, "")
        .replace(/\]\]$/, "")
        .replace(/\]$/, "")
        .replace(/[^a-zA-Z0-9]+/g, "-"),
    )
    .filter(Boolean);

  const base = [feature, ...cleaned].join("-");
  return base || `${feature}-index`;
}

function createPageRoute(feature: string, pagesDir: string, file: string) {
  const relativePath = normalizeToPosix(relative(pagesDir, file));
  const withoutExt = withoutExtension(relativePath);
  const segments = withoutExt.split("/");

  const pathSegments = segments
    .map((segment, index) => transformSegmentToRoute(segment, index === segments.length - 1))
    .filter(Boolean);

  const path = `/${pathSegments.join("/")}`.replace(/\/+/g, "/") || "/";

  return {
    name: createRouteName(feature, segments),
    path,
    file,
    meta: { feature },
  };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "bro-world-features",
    configKey: "featureModules",
  },
  defaults: {
    enabled: undefined,
    disabled: [],
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const featuresRoot = resolve(nuxt.options.srcDir, "features");
    const availableFeatures = scanFeatureSlugs(featuresRoot);

    if (!availableFeatures.length) {
      return;
    }

    const enabled = new Set(options.enabled?.length ? options.enabled : availableFeatures);
    const disabled = new Set(options.disabled ?? []);

    const selected = availableFeatures.filter((feature) => enabled.has(feature) && !disabled.has(feature));

    if (!selected.length) {
      return;
    }

    const pendingPages: ReturnType<typeof createPageRoute>[] = [];
    nuxt.options.watch ||= [];

    for (const feature of selected) {
      const featureDir = join(featuresRoot, feature);
      nuxt.options.watch.push(featureDir);

      const componentsDir = join(featureDir, "components");
      if (isDirectory(componentsDir)) {
        addComponentsDir({
          path: componentsDir,
          pathPrefix: false,
        });
      }

      const storesDir = join(featureDir, "stores");
      if (isDirectory(storesDir)) {
        addImportsDir(storesDir);
      }

      const composablesDir = join(featureDir, "composables");
      if (isDirectory(composablesDir)) {
        addImportsDir(composablesDir);
      }

      const pluginsDir = join(featureDir, "plugins");
      for (const plugin of collectFiles(pluginsDir, (path) => JS_EXTENSIONS.has(extname(path)))) {
        addPlugin(plugin);
      }

      const serverDir = join(featureDir, "server");
      if (isDirectory(serverDir)) {
        addServerScanDir(serverDir);
      }

      const pagesDir = join(featureDir, "pages");
      for (const page of collectFiles(pagesDir, (path) => PAGE_EXTENSIONS.has(extname(path)))) {
        pendingPages.push(createPageRoute(feature, pagesDir, page));
      }
    }

    if (pendingPages.length) {
      extendPages((pages) => {
        for (const page of pendingPages) {
          pages.push(page);
        }
      });
    }
  },
});
