import {
  markRaw,
  onBeforeUnmount,
  toValue,
  watchEffect,
  type Component,
  type MaybeRefOrGetter,
} from "vue";
import { skipHydrate } from "#imports";

export interface LayoutRightSidebarContent {
  component: Component;
  props?: Record<string, unknown>;
  wrapperClass?: string;
}

const STATE_KEY = "layout-right-sidebar-content";

export function useLayoutRightSidebar() {
  const rightSidebarContent = useState<LayoutRightSidebarContent | null>(STATE_KEY, () => null);
  skipHydrate(rightSidebarContent);

  function normalizeContent(content: LayoutRightSidebarContent | null) {
    if (!content) {
      return null;
    }

    return {
      ...content,
      component: markRaw(content.component),
    } satisfies LayoutRightSidebarContent;
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
