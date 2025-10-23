import { computed } from "vue";
import { useRoute, useState } from "#imports";

type NavbarSearchContext = string;

export interface UseNavbarSearchQueryOptions {
  /**
   * When provided, forces the composable to use the given context key.
   * Components can rely on this to share a query between multiple routes that
   * render the same feed (e.g., the home feed and world feeds).
   */
  context?: string | null | undefined;
  /**
   * Optional fallback context to use when the current route does not expose a
   * dedicated navbar search context via meta data.
   */
  fallbackContext?: string | null | undefined;
}

const NAVBAR_SEARCH_STATE_KEY = "navbar-search-query";
const DEFAULT_CONTEXT = "default" satisfies NavbarSearchContext;

type NavbarSearchState = Record<NavbarSearchContext, string>;

function normalizeContext(value: string | null | undefined): NavbarSearchContext {
  if (!value) {
    return DEFAULT_CONTEXT;
  }

  const normalized = value.trim().toLowerCase();
  return normalized ? normalized : DEFAULT_CONTEXT;
}

function getRouteMetaContext(): string | null {
  try {
    const route = useRoute();

    const rawContext = route?.meta?.navbarSearchContext;

    return typeof rawContext === "string" ? rawContext : null;
  } catch (error) {
    if (import.meta.dev) {
      console.warn("[useNavbarSearchQuery] Unable to access current route.", error);
    }

    return null;
  }
}

export function useNavbarSearchQuery(options: UseNavbarSearchQueryOptions = {}) {
  const state = useState<NavbarSearchState>(NAVBAR_SEARCH_STATE_KEY, () => ({}));

  const context = computed<NavbarSearchContext>(() => {
    if (options.context) {
      return normalizeContext(options.context);
    }

    const fromRoute = getRouteMetaContext();

    if (fromRoute) {
      return normalizeContext(fromRoute);
    }

    if (options.fallbackContext) {
      return normalizeContext(options.fallbackContext);
    }

    return DEFAULT_CONTEXT;
  });

  const query = computed<string>({
    get: () => state.value[context.value] ?? "",
    set: (value: string | null | undefined) => {
      const nextValue = typeof value === "string" ? value : "";
      state.value = {
        ...state.value,
        [context.value]: nextValue,
      };
    },
  });

  function clear() {
    query.value = "";
  }

  function set(value: string) {
    query.value = value;
  }

  return {
    context,
    query,
    clear,
    set,
    state,
  };
}

function collectPostSegments(
  post: Partial<{ title?: string | null; summary?: string | null; body?: string | null }>,
): string[] {
  const segments: string[] = [];

  const add = (value: string | null | undefined) => {
    if (typeof value !== "string") {
      return;
    }

    const trimmed = value.trim();

    if (trimmed) {
      segments.push(trimmed);
    }
  };

  add(post.title ?? null);
  add(post.summary ?? null);
  add(post.body ?? null);

  return segments;
}

export function normalizeSearchQuery(rawQuery: string | null | undefined): string {
  if (typeof rawQuery !== "string") {
    return "";
  }

  const trimmed = rawQuery.trim();
  return trimmed ? trimmed.toLowerCase() : "";
}

export function createPostSearchSnippet(
  post: Partial<{ summary?: string | null; body?: string | null }>,
  maxLength = 120,
): string {
  const segments = collectPostSegments(post);

  for (const segment of segments) {
    const sanitized = segment
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!sanitized) {
      continue;
    }

    if (sanitized.length <= maxLength) {
      return sanitized;
    }

    return `${sanitized.slice(0, maxLength).trimEnd()}…`;
  }

  return "";
}

export function filterPostsByQuery<
  T extends { title?: string | null; summary?: string | null; body?: string | null },
>(posts: ReadonlyArray<T>, query: string | null | undefined): T[] {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [...posts];
  }

  return posts.filter((post) =>
    collectPostSegments(post).some((segment) => segment.toLowerCase().includes(normalizedQuery)),
  );
}
