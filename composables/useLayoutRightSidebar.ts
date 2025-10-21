import {
  markRaw,
  onBeforeUnmount,
  toValue,
  watch,
  type Component,
  type MaybeRefOrGetter,
} from "vue";

export interface LayoutRightSidebarContent {
  component: Component;
  props?: Record<string, unknown>;
  wrapperClass?: string;
  intrinsicHeight?: number;
}

type LayoutRightSidebarState = Omit<LayoutRightSidebarContent, "component"> & {
  component?: Component;
};

const STATE_KEY = "layout-right-sidebar-content";
export const DEFAULT_RIGHT_SIDEBAR_INTRINSIC_HEIGHT = 600;

function resolveIntrinsicHeight(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DEFAULT_RIGHT_SIDEBAR_INTRINSIC_HEIGHT;
  }

  return Math.round(numericValue);
}

export function useLayoutRightSidebar() {
  const rightSidebarContent = useState<LayoutRightSidebarState | null>(STATE_KEY, () => null);

  function normalizeContent(
    content: LayoutRightSidebarContent | null,
  ): LayoutRightSidebarState | null {
    if (!content) {
      return null;
    }

    return {
      ...content,
      intrinsicHeight: resolveIntrinsicHeight(content.intrinsicHeight),
      component: import.meta.server ? undefined : markRaw(content.component),
    } satisfies LayoutRightSidebarState;
  }

  function setRightSidebarContent(content: LayoutRightSidebarContent | null) {
    rightSidebarContent.value = normalizeContent(content);
  }

  function registerRightSidebarContent(
    content: MaybeRefOrGetter<LayoutRightSidebarContent | null>,
  ) {
    if (import.meta.server) {
      rightSidebarContent.value = normalizeContent(toValue(content));
      return;
    }

    watch(
      () => toValue(content),
      (value) => {
        rightSidebarContent.value = normalizeContent(value);
      },
      { immediate: true, flush: "post" },
    );

    onBeforeUnmount(() => {
      rightSidebarContent.value = null;
    });
  }

  return {
    rightSidebarContent,
    setRightSidebarContent,
    registerRightSidebarContent,
  };
}
