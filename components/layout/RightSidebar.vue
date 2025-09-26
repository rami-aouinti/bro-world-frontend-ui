<template>
  <div class="hidden xl:block">
    <AppSidebar
      :items="items"
      :active-key="activeKey"
      @select="handleSidebarSelect"
    />
  <div class="hidden h-full flex-col xl:-translate-y-6 xl:transition xl:duration-300 xl:ease-out xl:flex">
    <UiScrollArea
      orientation="vertical"
      type="hover"
      class="relative h-full overflow-hidden py-6 pl-6 pr-0 md:pl-4"
    >
      <RightSidebarContent
        class="h-full"
        :weather="weather"
        :leaderboard="leaderboard"
        :rating="rating"
      />
    </UiScrollArea>
  </div>
  <ClientOnly>
    <teleport to="body">
      <div
        v-if="!isDesktop"
        class="fixed inset-y-0 right-0 z-50 flex justify-end"
        :class="isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'"
      >
        <section
          id="right-sidebar-drawer"
          ref="panelRef"
          role="complementary"
          aria-label="Right sidebar"
          :aria-hidden="!isDrawerOpen"
          tabindex="-1"
          class="flex h-full w-screen max-w-full flex-col overflow-hidden border-l border-border bg-background shadow-xl transition-transform duration-200 ease-out sm:max-w-sm"
          :class="isDrawerOpen ? 'translate-y-0' : '-translate-y-full'"
          @keydown="handlePanelKeydown"
        >
          <div class="h-full w-full overflow-y-auto px-6 py-6">
            <AppSidebar
              :items="items"
              :active-key="activeKey"
              :sticky="false"
              class="h-full"
              @select="handleSidebarSelect"
            />
          </div>
        </section>
      </div>
      <div
        v-if="!isDesktop"
        class="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ease-out"
        :class="isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'"
        @click="closeDrawer({ returnFocus: false })"
      />
    </teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, toRefs, watch } from "vue";
import { useEventListener, useMediaQuery } from "@vueuse/core";

import AppSidebar from "~/components/layout/AppSidebar.vue";

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  to: string;
}

const props = defineProps<{
  items: SidebarItem[];
  activeKey: string;
}>();

const emit = defineEmits<{ (e: "select", key: string): void }>();

const { items, activeKey } = toRefs(props);

const route = useRoute();
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useEventListener, useMediaQuery } from "@vueuse/core";

import RightSidebarContent from "~/components/layout/RightSidebarContent.vue";
import { useRightSidebarData } from "~/composables/useRightSidebarData";

const route = useRoute();

const { weather, leaderboard, rating } = useRightSidebarData();

const isDesktop = import.meta.client
  ? useMediaQuery("(min-width: 1280px)")
  : ref(true);

const isDrawerOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);
const lastTrigger = ref<HTMLElement | null>(null);
const lastTouchPoint = ref<{ x: number; y: number; startOnDrawer: boolean } | null>(null);

const EDGE_ZONE_OFFSET = 16;

function handleSidebarSelect(key: string) {
  emit("select", key);

  if (!isDesktop.value) {
    closeDrawer({ returnFocus: false });
  }
}

watch(
  () => route.fullPath,
  () => {
    if (!isDesktop.value) {
      closeDrawer({ returnFocus: false });
    }
  },
);

watch(isDesktop, (desktop) => {
  if (desktop) {
    closeDrawer({ returnFocus: false });
  }
});

function openDrawer(options: { focus?: boolean; trigger?: HTMLElement | null } = {}) {
  if (isDesktop.value) {
    return;
  }

  isDrawerOpen.value = true;

  if (options.trigger) {
    lastTrigger.value = options.trigger;
  }

  if (options.focus) {
    previousFocus.value = options.trigger ?? (document.activeElement as HTMLElement | null);

    nextTick(() => {
      focusFirstElement();
    });
  }
}

function closeDrawer(options: { returnFocus?: boolean } = {}) {
  isDrawerOpen.value = false;

  if (options.returnFocus !== false) {
    nextTick(() => {
      const target = lastTrigger.value ?? previousFocus.value;
      target?.focus({ preventScroll: true });
      lastTrigger.value = null;
      previousFocus.value = null;
    });

    return;
  }

  lastTrigger.value = null;
  previousFocus.value = null;
}

function toggleDrawer(trigger?: HTMLElement | null) {
  if (isDrawerOpen.value) {
    closeDrawer({ returnFocus: true });
    return;
  }

  openDrawer({ focus: true, trigger });
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (!isDrawerOpen.value) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeDrawer({ returnFocus: true });
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements();

  if (focusable.length === 0) {
    event.preventDefault();
    panelRef.value?.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !panelRef.value?.contains(active)) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    }

    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function focusFirstElement() {
  const focusable = getFocusableElements();

  if (focusable.length > 0) {
    focusable[0].focus({ preventScroll: true });
    return;
  }

  panelRef.value?.focus({ preventScroll: true });
}

function getFocusableElements() {
  if (!panelRef.value) {
    return [] as HTMLElement[];
  }

  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];

  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"),
  );
}

function isTextInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;

  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

if (import.meta.client) {
  useEventListener(window, "keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented || isDesktop.value) {
      return;
    }

    if (event.key === "]" || event.code === "BracketRight") {
      if (isTextInput(event.target)) {
        return;
      }

      event.preventDefault();
      toggleDrawer(event.target as HTMLElement | null);
      return;
    }

    if ((event.key === "Escape" || event.code === "Escape") && isDrawerOpen.value) {
      event.preventDefault();
      closeDrawer({ returnFocus: true });
    }
  });

  useEventListener(window, "touchstart", (event: TouchEvent) => {
    if (isDesktop.value || event.touches.length === 0) {
      return;
    }

    const touch = event.touches[0];
    const startOnDrawer = Boolean(panelRef.value?.contains(event.target as Node));

    lastTouchPoint.value = {
      x: touch.clientX,
      y: touch.clientY,
      startOnDrawer,
    };
  });

  useEventListener(window, "touchend", (event: TouchEvent) => {
    if (isDesktop.value || !lastTouchPoint.value) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      lastTouchPoint.value = null;
      return;
    }

    const deltaX = touch.clientX - lastTouchPoint.value.x;
    const deltaY = touch.clientY - lastTouchPoint.value.y;
    const mostlyVertical = Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30;

    if (!mostlyVertical) {
      lastTouchPoint.value = null;
      return;
    }

    if (lastTouchPoint.value.startOnDrawer && deltaY < 0) {
      closeDrawer({ returnFocus: false });
      lastTouchPoint.value = null;
      return;
    }

    const fromTopEdge = lastTouchPoint.value.y;
    const fromRightEdge = window.innerWidth - lastTouchPoint.value.x;

    if (
      !lastTouchPoint.value.startOnDrawer &&
      fromTopEdge <= EDGE_ZONE_OFFSET * 2 &&
      fromRightEdge <= EDGE_ZONE_OFFSET * 2 &&
      deltaY > 0
    ) {
      openDrawer();
    }

    lastTouchPoint.value = null;
  });
}

onBeforeUnmount(() => {
  lastTrigger.value = null;
  previousFocus.value = null;
  lastTouchPoint.value = null;
});

defineExpose({
  openDrawer,
  closeDrawer,
  toggleDrawer,
});
</script>
