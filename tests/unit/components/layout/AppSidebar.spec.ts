import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";

const AuthLoginFormStub = Object.assign(
  defineComponent({
    name: "AuthLoginFormStub",
    props: {
      disabled: { type: Boolean, default: false },
      variant: { type: String, default: "text" },
    },
    template: '<form class="auth-login-form-stub"><slot /></form>',
  }),
  { __isTeleport: false },
);

const SidebarCardStub = {
  name: "SidebarCardStub",
  template: '<div class="sidebar-card-stub"><slot /></div>',
};

const IconStub = {
  name: "IconStub",
  props: {
    name: { type: String, default: undefined },
    size: { type: [String, Number], default: undefined },
  },
  template: '<i class="icon-stub"><slot /></i>',
};

const mockIsAuthenticated = ref(false);
const mockCurrentUser = ref<unknown | null>(null);
const sidebarCache = new Map<string, ReturnType<typeof ref>>();
const mockRoute = ref({ fullPath: "/" });

vi.mock("~/stores/auth-session", () => ({
  useAuthSession: () => ({
    isAuthenticated: mockIsAuthenticated,
    currentUser: mockCurrentUser,
  }),
}));

vi.mock("~/composables/useNonBlockingTask", () => ({
  useNonBlockingTask: () => ({
    schedule: (task: () => void) => task(),
  }),
}));

vi.mock("~/lib/auth/social", () => ({
  resolveSocialRedirect: () => "/auth/social",
}));

vi.mock("~/composables/useResolvedLocalePath", () => ({
  useResolvedLocalePath: () => (target: unknown) => target,
}));

vi.mock("#imports", () => ({
  useState: <T>(key: string, init?: () => T) => {
    if (!sidebarCache.has(key)) {
      sidebarCache.set(key, ref(init ? init() : undefined));
    }

    return sidebarCache.get(key)!;
  },
  useRouter: () => ({
    currentRoute: mockRoute,
  }),
  useI18n: () => ({
    t: (key: string) => key,
    locale: ref("en"),
  }),
}));

vi.mock("~/components/auth/LoginForm.vue", () => ({
  __esModule: true,
  default: AuthLoginFormStub,
}));

async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  mockIsAuthenticated.value = false;
  mockCurrentUser.value = null;
  sidebarCache.clear();
  mockRoute.value = { fullPath: "/" };
  const localeRef = ref("en");
  vi.stubGlobal("useI18n", () => ({
    t: (key: string) => key,
    locale: localeRef,
  }));
  vi.stubGlobal("useRouter", () => ({
    currentRoute: mockRoute,
  }));
  vi.stubGlobal("useState", <T>(key: string, init?: () => T) => {
    if (!sidebarCache.has(key)) {
      sidebarCache.set(key, ref(init ? init() : undefined));
    }

    return sidebarCache.get(key)!;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountSidebar(props: Record<string, unknown> = {}) {
  const AppSidebar = (await import("~/components/layout/AppSidebar.vue")).default;

  return mount(AppSidebar, {
    props,
    global: {
      stubs: {
        SidebarCard: SidebarCardStub,
        Icon: IconStub,
      },
    },
  });
}

describe("AppSidebar", () => {
  it("renders the guest login card when unauthenticated", async () => {
    const wrapper = await mountSidebar();

    await flushPromises();
    await nextTick();

    expect(wrapper.find(".sidebar-login-card__content").exists()).toBe(true);
    expect(wrapper.find("nav").exists()).toBe(false);
  });

  it("shows navigation when authenticated", async () => {
    mockIsAuthenticated.value = true;
    mockCurrentUser.value = { roles: [] } as unknown;

    const wrapper = await mountSidebar();

    await flushPromises();
    await nextTick();

    expect(wrapper.find("nav").exists()).toBe(true);
    expect(wrapper.find(".sidebar-login-card__content").exists()).toBe(false);
  });

  it("displays provided world and plugin items", async () => {
    mockIsAuthenticated.value = true;
    mockCurrentUser.value = { roles: [] } as unknown;

    const items = [
      { key: "world-bro", label: "Bro World", to: "/world/bro" },
      { key: "plugin-game", label: "Game", to: "/world/bro/game" },
    ];

    const wrapper = await mountSidebar({ items });

    await flushPromises();
    await nextTick();

    const labels = wrapper
      .findAll(".sidebar-item .text-sm.font-medium")
      .map((node) => node.text().trim());

    expect(labels).toContain("Bro World");
    expect(labels).toContain("Game");
  });
});
