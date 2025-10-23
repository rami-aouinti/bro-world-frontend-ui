import {
  markRaw,
  onBeforeUnmount,
  toValue,
  watch,
  type Component,
  type MaybeRefOrGetter,
} from "vue";

export const DEFAULT_RIGHT_SIDEBAR_INTRINSIC_HEIGHT = 600;

export interface LayoutRightSidebarContent {
  component: Component;
  props?: Record<string, unknown>;
  wrapperClass?: string;
  intrinsicHeight?: number | string;
}

type LayoutRightSidebarState = Omit<LayoutRightSidebarContent, "component" | "intrinsicHeight"> & {
  component?: Component;
  intrinsicHeight: number | string;
};

const STATE_KEY = "layout-right-sidebar-content";

export function useLayoutRightSidebar() {
  const rightSidebarContent = useState<LayoutRightSidebarState | null>(STATE_KEY, () => null);

  function normalizeContent(
    content: LayoutRightSidebarContent | null,
  ): LayoutRightSidebarState | null {
    if (!content) {
      return null;
    }

    const normalizedIntrinsicHeight = (() => {
      const rawHeight = content.intrinsicHeight;

      if (typeof rawHeight === "number") {
        if (Number.isFinite(rawHeight) && rawHeight > 0) {
          return rawHeight;
        }
        return DEFAULT_RIGHT_SIDEBAR_INTRINSIC_HEIGHT;
      }

      if (typeof rawHeight === "string") {
        const trimmed = rawHeight.trim();
        if (trimmed) {
          return trimmed;
        }
      }

      return DEFAULT_RIGHT_SIDEBAR_INTRINSIC_HEIGHT;
    })();

    return {
      ...content,
      intrinsicHeight: normalizedIntrinsicHeight,
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

    rightSidebarContent.value = normalizeContent(toValue(content));

    const stopWatch = watch(
      () => toValue(content),
      (value) => {
        rightSidebarContent.value = normalizeContent(value);
      },
      { flush: "pre" },
    );

    onBeforeUnmount(() => {
      stopWatch();
      rightSidebarContent.value = null;
    });
  }

  return {
    rightSidebarContent,
    setRightSidebarContent,
    registerRightSidebarContent,
  };
}
