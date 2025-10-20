import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import AppBrand from "~/components/layout/app-bar/AppBrand.vue";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createMatchMedia = (matches: boolean) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mediaQuery: MediaQueryList & { dispatch: (matchesOverride: boolean) => void } = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatch(matchesOverride: boolean) {
      mediaQuery.matches = matchesOverride;
      listeners.forEach((listener) => {
        listener({ matches: matchesOverride } as MediaQueryListEvent);
      });
    },
  };

  return mediaQuery;
};

vi.mock("~/composables/usePrimaryGradient", () => ({
  usePrimaryGradient: () => ({
    colors: ref(["#111111", "#222222", "#333333"]),
  }),
}));

vi.mock("~/composables/useSiteSettingsState", () => ({
  useSiteSettingsState: () =>
    ref({
      siteName: "Bro World",
    }),
}));

vi.mock("~/composables/useResolvedLocalePath", () => ({
  useResolvedLocalePath: () => (path: string) => path,
}));

vi.mock("~/components/content/ColourfulText.vue", () => ({
  default: {
    name: "ColourfulText",
    props: ["text"],
    template: '<span class="colourful-text-stub">{{ text }}</span>',
  },
}));

describe("AppBrand", () => {
  const originalMatchMedia = window.matchMedia;
  const originalRequestIdleCallback = (window as any).requestIdleCallback;
  const originalCancelIdleCallback = (window as any).cancelIdleCallback;
  let idleCallbacks: Array<
    (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
  >;

  beforeEach(() => {
    idleCallbacks = [];
    (window as any).requestIdleCallback = vi.fn(
      (callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void) => {
        idleCallbacks.push(callback);
        return idleCallbacks.length;
      },
    );
    (window as any).cancelIdleCallback = vi.fn((id: number) => {
      idleCallbacks[id - 1] = () => {};
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    (window as any).requestIdleCallback = originalRequestIdleCallback;
    (window as any).cancelIdleCallback = originalCancelIdleCallback;
    vi.restoreAllMocks();
  });

  it("renders static brand text until the animation is loaded", async () => {
    const mockMediaQuery = createMatchMedia(false);
    window.matchMedia = vi.fn(() => mockMediaQuery as unknown as MediaQueryList);

    const wrapper = mount(AppBrand, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const highlight = wrapper.get('[data-testid="app-brand-highlight"]');
    expect(highlight.text()).toBe("World");
    expect(wrapper.find(".colourful-text-stub").exists()).toBe(false);
    expect(idleCallbacks.length).toBeGreaterThan(0);

    idleCallbacks.forEach((callback) => callback({ didTimeout: false, timeRemaining: () => 10 }));
    await flushPromises();
    await nextTick();

    expect(wrapper.find(".colourful-text-stub").exists()).toBe(true);
    expect(highlight.text()).toBe("World");
  });

  it("honours reduced motion by keeping the static brand", async () => {
    const mockMediaQuery = createMatchMedia(true);
    window.matchMedia = vi.fn(() => mockMediaQuery as unknown as MediaQueryList);
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const wrapper = mount(AppBrand, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const highlight = wrapper.get('[data-testid="app-brand-highlight"]');
    expect(highlight.text()).toBe("World");
    expect(wrapper.find(".colourful-text-stub").exists()).toBe(false);
    expect((window as any).requestIdleCallback).not.toHaveBeenCalled();
    expect(timeoutSpy).not.toHaveBeenCalled();

    mockMediaQuery.dispatch(false);

    idleCallbacks.forEach((callback) => callback({ didTimeout: false, timeRemaining: () => 10 }));
    await flushPromises();
    await nextTick();

    expect(wrapper.find(".colourful-text-stub").exists()).toBe(true);
  });
});
