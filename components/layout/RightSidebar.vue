<template>
  <ClientOnly>
    <teleport to="body">
      <div class="fixed inset-y-0 right-0 z-50 flex justify-end">
        <div class="pointer-events-none flex h-full">
          <section
            ref="panelRef"
            role="complementary"
            aria-label="Right sidebar"
            :aria-hidden="!isDrawerActive"
            tabindex="-1"
            class="pointer-events-auto flex h-full flex-col overflow-hidden border-l border-border bg-background transition-all duration-300 ease-out"
            :class="panelClass"
            @mouseenter="handlePanelEnter"
            @mouseleave="handlePanelLeave"
            @keydown="handlePanelKeydown"
          >
            <UiScrollArea
              v-show="showContent"
              orientation="vertical"
              type="hover"
              class="h-full w-full overflow-hidden"
            >
              <div class="flex h-full flex-col gap-6 px-6 py-6">
                <SidebarWeatherCard :weather="weather" />
                <SidebarLeaderboardCard
                  :title="leaderboard.title"
                  :live-label="leaderboard.live"
                  :participants="leaderboard.participants"
                />
                <SidebarRatingCard :rating="rating" />
              </div>
            </UiScrollArea>
          </section>
        </div>
      </div>
      <div
        v-if="showBackdrop"
        class="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ease-out"
        :class="[isDrawerActive ? 'opacity-100' : 'pointer-events-none opacity-0']"
        @click="closeSidebar({ returnFocus: false })"
      />
      <div
        class="fixed inset-y-0 right-0 z-40"
        :class="edgeClasses"
        :style="edgeStyle"
        aria-hidden="true"
        @mouseenter="handleEdgeEnter"
        @mouseleave="handleEdgeLeave"
      />
    </teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useEventListener, useMediaQuery } from "@vueuse/core";

interface SidebarWeatherContent {
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  location: string;
  temperature: string;
  tip: string;
  locationLabel: string;
  temperatureLabel: string;
  tipLabel: string;
}

interface SidebarParticipant {
  name: string;
  role: string;
  score: string;
}

interface SidebarLeaderboardContent {
  title: string;
  live: string;
  participants: Record<"first" | "second" | "third", SidebarParticipant>;
}

interface SidebarRatingCategory {
  label: string;
  value: number;
}

interface SidebarRatingContent {
  title: string;
  subtitle: string;
  average: string;
  total: number;
  icon: string;
  stars: number;
  categories: Record<string, SidebarRatingCategory>;
}

interface SidebarPersistedState {
  expanded: boolean;
}

const EDGE_ZONE_WIDTH = 14;
const HOVER_CLOSE_DELAY = 180;

const { tm } = useI18n();
const route = useRoute();

const weather = computed(() => tm("sidebar.weather") as SidebarWeatherContent);

const leaderboard = computed(() => {
  const raw = tm("sidebar.leaderboard") as SidebarLeaderboardContent | undefined;
  const order: Array<keyof SidebarLeaderboardContent["participants"]> = [
    "first",
    "second",
    "third",
  ];

  const participants = order
    .map((key) => raw?.participants?.[key])
    .filter((participant): participant is SidebarParticipant => Boolean(participant))
    .map((participant, index) => ({
      position: index + 1,
      ...participant,
    }));

  return {
    title: raw?.title ?? "",
    live: raw?.live ?? "",
    participants,
  };
});

const rating = computed(() => {
  const raw = tm("sidebar.rating") as SidebarRatingContent;

  return {
    ...raw,
    categories: Object.values(raw.categories ?? {}),
  };
});

const isLg = import.meta.client
  ? useMediaQuery("(min-width: 1024px)")
  : ref(false);
const isMd = import.meta.client
  ? useMediaQuery("(min-width: 768px)")
  : ref(false);

const viewportVariant = computed<"lg" | "md" | "sm">(() => {
  if (isLg.value) {
    return "lg";
  }

  if (isMd.value) {
    return "md";
  }

  return "sm";
});

const rawState = useState<Record<string, SidebarPersistedState>>("right-sidebar-state", () => ({}));

const currentKey = computed(() => route.fullPath || route.path || "");

watch(
  currentKey,
  (key) => {
    if (key && !rawState.value[key]) {
      rawState.value[key] = { expanded: false };
    }
  },
  { immediate: true },
);

const isExpanded = computed({
  get: () => Boolean(rawState.value[currentKey.value]?.expanded),
  set: (value: boolean) => {
    if (!currentKey.value) {
      return;
    }

    const existing = rawState.value[currentKey.value] ?? { expanded: false };
    rawState.value[currentKey.value] = { ...existing, expanded: value };
  },
});

const isPeeking = ref(false);
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);
const lastKeyboardTrigger = ref<HTMLElement | null>(null);
const lastTouchPoint = ref<{ x: number; y: number; startOnDrawer: boolean } | null>(null);

const isDrawerActive = computed(() => {
  if (viewportVariant.value === "lg") {
    return isExpanded.value || isPeeking.value;
  }

  return isExpanded.value;
});

const showBackdrop = computed(() => viewportVariant.value !== "lg");

const panelClass = computed(() => {
  if (viewportVariant.value === "lg") {
    return [
      "max-w-[320px]",
      isDrawerActive.value ? "w-80 shadow-xl" : "w-[72px] shadow-none",
    ];
  }

  if (viewportVariant.value === "md") {
    return [
      "w-80 shadow-xl transition-transform",
      isDrawerActive.value ? "translate-x-0" : "translate-x-full",
    ];
  }

  return [
    "w-screen max-w-full shadow-xl transition-transform",
    isDrawerActive.value ? "translate-x-0" : "translate-x-full",
  ];
});

const showContent = computed(() => viewportVariant.value !== "lg" || isDrawerActive.value);

const edgeStyle = computed(() => ({
  width: `${EDGE_ZONE_WIDTH}px`,
}));

const edgeClasses = computed(() => {
  if (showBackdrop.value && isExpanded.value) {
    return "pointer-events-none";
  }

  return null;
});

function clearHoverTimeout() {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
}

function handleEdgeEnter() {
  if (!import.meta.client) {
    return;
  }

  clearHoverTimeout();

  if (viewportVariant.value === "lg" && !isExpanded.value) {
    isPeeking.value = true;
  } else {
    openSidebar();
  }
}

function handleEdgeLeave() {
  if (viewportVariant.value !== "lg") {
    return;
  }

  scheduleCollapse();
}

function handlePanelEnter() {
  if (viewportVariant.value === "lg" && !isExpanded.value) {
    isPeeking.value = true;
  }

  clearHoverTimeout();
}

function handlePanelLeave() {
  if (viewportVariant.value !== "lg") {
    return;
  }

  scheduleCollapse();
}

function scheduleCollapse() {
  clearHoverTimeout();

  hoverTimeout.value = setTimeout(() => {
    if (!isExpanded.value) {
      isPeeking.value = false;
    }
  }, HOVER_CLOSE_DELAY);
}

function openSidebar(options: { focus?: boolean; trigger?: HTMLElement | null } = {}) {
  if (viewportVariant.value === "lg") {
    isPeeking.value = false;
  }

  isExpanded.value = true;

  if (options.trigger) {
    lastKeyboardTrigger.value = options.trigger;
  }

  if (options.focus) {
    previousFocus.value = options.trigger ?? (document.activeElement as HTMLElement | null);

    nextTick(() => {
      focusFirstElement();
    });
  }
}

function closeSidebar(options: { returnFocus?: boolean } = {}) {
  isExpanded.value = false;
  isPeeking.value = false;

  if (options.returnFocus !== false) {
    nextTick(() => {
      const target = lastKeyboardTrigger.value || previousFocus.value;
      target?.focus({ preventScroll: true });
      lastKeyboardTrigger.value = null;
      previousFocus.value = null;
    });
  } else {
    lastKeyboardTrigger.value = null;
    previousFocus.value = null;
  }
}

function toggleSidebar(trigger: HTMLElement | null) {
  if (isExpanded.value) {
    closeSidebar({ returnFocus: true });
    return;
  }

  openSidebar({ focus: true, trigger });
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (!isExpanded.value) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeSidebar({ returnFocus: true });
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
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "]" || event.code === "BracketRight") {
      if (isTextInput(event.target)) {
        return;
      }

      event.preventDefault();
      toggleSidebar(event.target as HTMLElement | null);
      return;
    }

    if ((event.key === "Escape" || event.code === "Escape") && isDrawerActive.value) {
      event.preventDefault();
      closeSidebar({ returnFocus: true });
    }
  });

  useEventListener(window, "touchstart", (event: TouchEvent) => {
    if (event.touches.length === 0) {
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
    if (!lastTouchPoint.value) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      lastTouchPoint.value = null;
      return;
    }

    const deltaX = touch.clientX - lastTouchPoint.value.x;
    const deltaY = touch.clientY - lastTouchPoint.value.y;

    const mostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30;

    if (!mostlyHorizontal) {
      lastTouchPoint.value = null;
      return;
    }

    if (lastTouchPoint.value.startOnDrawer && deltaX > 0) {
      closeSidebar({ returnFocus: false });
      lastTouchPoint.value = null;
      return;
    }

    const fromRightEdge = window.innerWidth - lastTouchPoint.value.x;

    if (!lastTouchPoint.value.startOnDrawer && fromRightEdge <= EDGE_ZONE_WIDTH * 2 && deltaX < 0) {
      openSidebar();
    }

    lastTouchPoint.value = null;
  });
}

watch(
  () => viewportVariant.value,
  (variant) => {
    if (variant !== "lg") {
      isPeeking.value = false;
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    if (viewportVariant.value === "sm") {
      closeSidebar({ returnFocus: false });
    }

    isPeeking.value = false;
  },
);

onBeforeUnmount(() => {
  clearHoverTimeout();
});
</script>
