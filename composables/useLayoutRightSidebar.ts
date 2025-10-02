import { onBeforeUnmount, toValue, watchEffect, type Component, type MaybeRefOrGetter } from "vue";

export interface LayoutRightSidebarContent {
  component: Component;
  props?: Record<string, unknown>;
  wrapperClass?: string;
}

const STATE_KEY = "layout-right-sidebar-content";

export function useLayoutRightSidebar() {
  const rightSidebarContent = useState<LayoutRightSidebarContent | null>(STATE_KEY, () => null);

  function setRightSidebarContent(content: LayoutRightSidebarContent | null) {
    rightSidebarContent.value = content;
  }

  function registerRightSidebarContent(
    content: MaybeRefOrGetter<LayoutRightSidebarContent | null>,
  ) {
    if (import.meta.server) {
      rightSidebarContent.value = toValue(content);
      return;
    }

    watchEffect(() => {
      rightSidebarContent.value = toValue(content);
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
