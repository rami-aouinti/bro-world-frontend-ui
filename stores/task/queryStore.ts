import { computed } from "vue";
import { useRoute } from "#imports";
import type { RouteLocationNormalizedLoaded } from "vue-router";

import { defineStore } from "~/lib/pinia-shim";

function normalizeQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeQueryValue(item));
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, normalizeQueryValue(item)] as const)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    return entries.reduce<Record<string, unknown>>((accumulator, [key, item]) => {
      accumulator[key] = item;
      return accumulator;
    }, {});
  }

  return value;
}

function buildQueryKey(query: RouteLocationNormalizedLoaded["query"]): string {
  const normalized = normalizeQueryValue(query ?? {});
  try {
    return JSON.stringify(normalized);
  } catch (error) {
    return "{}";
  }
}

export const useQueryStore = defineStore("task-query", () => {
  const route = useRoute();
  const paramsKey = computed(() => buildQueryKey(route.query));

  return {
    paramsKey,
    getParams: paramsKey,
  };
});
