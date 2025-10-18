import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useState } from "#imports";

import { defineStore } from "~/lib/pinia-shim";

type QueryFiltersDictionary = Record<string, Record<string, string>>;
type QuerySortsDictionary = Record<string, string[]>;
type QueryStringDictionary = Record<string, string | string[] | undefined>;

type QueryParams = {
  filter?: Record<string, string> | null;
  sort?: string[] | null;
  page?: string | null;
};

function normalizeFilter(query: string | string[] | undefined): Record<string, string> | null {
  if (!query) {
    return null;
  }

  const values = Array.isArray(query) ? query : [query];
  const filters: Record<string, string> = {};

  for (const item of values) {
    const trimmed = item.trim();

    if (!trimmed) {
      continue;
    }

    const [key, ...rest] = trimmed.split("|");

    if (!key) {
      continue;
    }

    filters[key] = rest.join("|") || "";
  }

  return Object.keys(filters).length ? filters : null;
}

function normalizeSort(query: string | string[] | undefined): string[] | null {
  if (!query) {
    return null;
  }

  const values = Array.isArray(query) ? query : [query];
  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);

  return normalized.length ? normalized.sort() : null;
}

function normalizePage(query: string | string[] | undefined): string | null {
  if (!query) {
    return null;
  }

  const value = Array.isArray(query) ? query[0] : query;
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export const useCrmQueryStore = defineStore("crm-query", () => {
  const filtersState = useState<QueryFiltersDictionary>("crm-query:filters", () => ({}));
  const sortsState = useState<QuerySortsDictionary>("crm-query:sorts", () => ({}));
  const pagesState = useState<Record<string, string | null>>("crm-query:pages", () => ({}));
  const watchingState = useState<boolean>("crm-query:watching", () => false);
  const route = useRoute();

  function syncFromRoute(query: QueryStringDictionary) {
    const normalizedFilter = normalizeFilter(query.filter);
    const normalizedSort = normalizeSort(query.sort);
    const normalizedPage = normalizePage(query.page);
    const path = route.path;

    filtersState.value = {
      ...filtersState.value,
      [path]: normalizedFilter ?? {},
    };

    sortsState.value = {
      ...sortsState.value,
      [path]: normalizedSort ?? [],
    };

    pagesState.value = {
      ...pagesState.value,
      [path]: normalizedPage ?? null,
    };
  }

  if (!watchingState.value) {
    syncFromRoute(route.query);

    if (import.meta.client) {
      watch(
        () => route.query,
        (query) => {
          syncFromRoute(query);
        },
        { deep: false },
      );
    }

    watchingState.value = true;
  }

  const getParams = computed<QueryParams>(() => {
    const path = route.path;
    const filter = filtersState.value[path];
    const sort = sortsState.value[path];
    const page = pagesState.value[path];

    return {
      filter: filter && Object.keys(filter).length > 0 ? filter : null,
      sort: Array.isArray(sort) && sort.length > 0 ? sort : null,
      page: page ?? null,
    };
  });

  const getHash = computed(() => JSON.stringify(getParams.value ?? {}));

  return {
    getParams,
    getHash,
  };
});
