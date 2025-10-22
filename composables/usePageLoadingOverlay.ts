import type { AsyncComponentLoader, Component, MaybeRefOrGetter } from "vue";
import { onScopeDispose, toValue, watch } from "vue";
import { useRoute } from "#imports";

export type PageLoadingOverlayLoader = AsyncComponentLoader<Component>;

export type PageLoadingOverlayDefinition =
  | {
      loader: PageLoadingOverlayLoader;
      component?: never;
      props?: Record<string, unknown>;
      key?: string;
    }
  | {
      loader?: never;
      component: Component;
      props?: Record<string, unknown>;
      key?: string;
    };

export type PageLoadingOverlayMetaEntry = PageLoadingOverlayDefinition & {
  __pageLoadingOverlay?: symbol;
};

export function usePageLoadingOverlay(
  definition: MaybeRefOrGetter<PageLoadingOverlayDefinition | null | undefined>,
) {
  const route = useRoute();
  const marker = Symbol("page-loading-overlay");

  function assignOverlay(value: PageLoadingOverlayDefinition | null | undefined) {
    if (!value) {
      if ((route.meta.pageLoadingOverlay as PageLoadingOverlayMetaEntry | undefined)?.__pageLoadingOverlay === marker) {
        delete route.meta.pageLoadingOverlay;
      }
      return;
    }

    const meta = route.meta as RouteMetaWithOverlay;

    meta.pageLoadingOverlay = {
      ...value,
      __pageLoadingOverlay: marker,
    } satisfies PageLoadingOverlayMetaEntry;
  }

  watch(
    () => toValue(definition),
    (value) => {
      assignOverlay(value ?? null);
    },
    { immediate: true, deep: true },
  );

  onScopeDispose(() => {
    const meta = route.meta as RouteMetaWithOverlay;

    if ((meta.pageLoadingOverlay as PageLoadingOverlayMetaEntry | undefined)?.__pageLoadingOverlay === marker) {
      delete meta.pageLoadingOverlay;
    }
  });
}

type RouteMetaWithOverlay = {
  pageLoadingOverlay?: PageLoadingOverlayMetaEntry;
} & Record<string, unknown>;
