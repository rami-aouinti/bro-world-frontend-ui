import {
  markRaw,
  onBeforeUnmount,
  toValue,
  watchEffect,
  type Component,
  type MaybeRefOrGetter,
} from "vue";

export interface LayoutRightSidebarContent {
  component: Component;
  props?: Record<string, unknown>;
  wrapperClass?: string;
}

type LayoutRightSidebarState = Omit<LayoutRightSidebarContent, "component"> & {
  component?: Component;
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

    return {
      ...content,
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

    watchEffect(() => {
      rightSidebarContent.value = normalizeContent(toValue(content));
    });

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
