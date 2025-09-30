import { promises as fs } from "node:fs";
import path from "node:path";

import fg from "fast-glob";
import postcss from "postcss";
import type { AtRule, Rule } from "postcss";
import type { PluginOption, ResolvedConfig } from "vite";

type SafelistEntry = string | RegExp;

export interface SimplePurgeCssOptions {
  content: string[];
  safelist?: {
    standard?: SafelistEntry[];
    deep?: RegExp[];
    greedy?: RegExp[];
  };
  include?: RegExp;
}

export function simplePurgeCssPlugin(options: SimplePurgeCssOptions): PluginOption {
  const { content, safelist = {}, include = /material-dashboard/i } = options;
  const usedClasses = new Set<string>();
  const selectorSafelist: RegExp[] = [];
  const normalizedStandard = new Set<string>();

  for (const entry of safelist.standard ?? []) {
    if (typeof entry === "string") {
      normalizedStandard.add(entry);
    } else {
      selectorSafelist.push(entry);
    }
  }

  for (const entry of safelist.deep ?? []) {
    selectorSafelist.push(entry);
  }

  for (const entry of safelist.greedy ?? []) {
    selectorSafelist.push(entry);
  }

  let resolvedConfig: ResolvedConfig | null = null;

  return {
    name: "vite-plugin-simple-purgecss",
    apply: "build",
    configResolved(config) {
      resolvedConfig = config;
    },
    async buildStart() {
      if (!content.length) {
        return;
      }

      const rootDir = resolvedConfig?.root ?? process.cwd();
      const files = await fg(content, { cwd: rootDir, absolute: true });

      await Promise.all(
        files.map(async (file) => {
          try {
            const source = await fs.readFile(file, "utf8");
            for (const token of extractClassCandidates(source)) {
              usedClasses.add(token);
            }
          } catch (error) {
            this.warn(
              `simple-purgecss: unable to read ${path.relative(rootDir, file)} - ${(error as Error).message}`,
            );
          }
        }),
      );

      for (const entry of normalizedStandard) {
        usedClasses.add(entry);
      }
    },
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "asset" || typeof chunk.source === "undefined") {
          continue;
        }

        if (typeof chunk.source !== "string" && !(chunk.source instanceof Uint8Array)) {
          continue;
        }

        if (!chunk.fileName.endsWith(".css")) {
          continue;
        }

        const rawSource =
          typeof chunk.source === "string"
            ? chunk.source
            : Buffer.from(chunk.source).toString("utf8");
        if (!include.test(chunk.fileName) && !/Vuetify Material Dashboard/i.test(rawSource)) {
          continue;
        }

        const purged = purgeCss(rawSource, usedClasses, selectorSafelist);
        chunk.source = purged;
      }
    },
  };
}

function extractClassCandidates(content: string): Set<string> {
  const candidates = new Set<string>();

  const classAttrRegex = /(?:class|className)\s*=\s*(["'])([^"']+)\1/g;
  let match: RegExpExecArray | null;

  while ((match = classAttrRegex.exec(content))) {
    match[2]
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => candidates.add(token));
  }

  const classBindingRegex = /:class\s*=\s*"([^"]+)"|:class\s*=\s*'([^']+)'/g;
  while ((match = classBindingRegex.exec(content))) {
    const group = match[1] ?? match[2];
    if (!group) continue;
    for (const token of extractStringLiterals(group)) {
      candidates.add(token);
    }
  }

  const stringLiteralInScript = /['"]([A-Za-z0-9:_/-]+)['"]/g;
  while ((match = stringLiteralInScript.exec(content))) {
    const token = match[1];
    if (token.includes(":") || token.includes("-")) {
      candidates.add(token);
    }
  }

  return candidates;
}

function extractStringLiterals(expression: string): string[] {
  const tokens: string[] = [];
  const literalRegex = /['"]([^'"`]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = literalRegex.exec(expression))) {
    tokens.push(...match[1].split(/\s+/).filter(Boolean));
  }

  return tokens;
}

function purgeCss(css: string, usedClasses: Set<string>, selectorSafelist: RegExp[]): string {
  const root = postcss.parse(css);

  root.walkRules((rule) => {
    if (!rule.selector) {
      return;
    }

    const selectors = (rule.selectors ?? rule.selector.split(","))
      .map((selector) => selector.trim())
      .filter(Boolean);
    const keptSelectors = selectors.filter((selector) =>
      shouldKeepSelector(selector, usedClasses, selectorSafelist),
    );

    if (keptSelectors.length === 0) {
      rule.remove();
    } else if (keptSelectors.length !== selectors.length) {
      (rule as Rule).selector = keptSelectors.join(", ");
    }
  });

  root.walkAtRules((atRule) => {
    if ((atRule as AtRule).name === "media" || (atRule as AtRule).name === "supports") {
      if (!atRule.nodes || atRule.nodes.length === 0) {
        atRule.remove();
      }
    }
  });

  return root.toString();
}

function shouldKeepSelector(
  selector: string,
  usedClasses: Set<string>,
  selectorSafelist: RegExp[],
): boolean {
  if (!selector || selector.startsWith("@")) {
    return true;
  }

  for (const pattern of selectorSafelist) {
    if (pattern.test(selector)) {
      return true;
    }
  }

  const classMatches = selector.match(/\.(-?[_a-zA-Z\\][-_a-zA-Z0-9\\/:]*)/g);

  if (!classMatches) {
    return true;
  }

  for (const rawMatch of classMatches) {
    const normalized = normalizeClassName(rawMatch.slice(1));

    if (usedClasses.has(normalized)) {
      return true;
    }

    if (selectorSafelist.some((pattern) => pattern.test(normalized))) {
      return true;
    }
  }

  return false;
}

function normalizeClassName(className: string): string {
  return className.replace(/\\:/g, ":").replace(/\\\//g, "/").replace(/\\\./g, ".").trim();
}
