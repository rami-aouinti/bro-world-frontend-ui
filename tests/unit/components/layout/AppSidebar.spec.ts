import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";

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

vi.mock("~/lib/navigation/sidebar", () => ({
  ADMIN_ROLE_KEYS: [],
  buildProfileSidebarItems: () => [],
  buildSidebarItems: () => [],
}));

vi.mock("~/composables/useSiteSettingsState", () => ({
  useSiteSettingsState: () => ref(null),
}));

vi.mock("~/composables/useResolvedLocalePath", () => ({
  useResolvedLocalePath: () => (path: string) => path,
}));

vi.mock("~/composables/useNonBlockingTask", () => ({
  useNonBlockingTask: () => ({
    schedule: (task: () => void) => task(),
  }),
}));

vi.mock("~/lib/auth/social", () => ({
  resolveSocialRedirect: () => "/auth/social",
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

vi.mock("~/components/auth/LoginForm.vue", () => {
  const component = defineComponent({
    name: "AuthLoginFormStub",
    props: ["disabled", "variant"],
    template: "<form class=\"auth-login-form-stub\"><slot /></form>",
  });

  return {
    __esModule: true,
    default: Object.assign(component, { __isTeleport: false }),
  };
});


const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

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

async function mountSidebar() {
  const AppSidebar = (await import("~/components/layout/AppSidebar.vue")).default;

  return mount(AppSidebar, {
    global: {
      stubs: {
        SidebarCard: defineComponent({
          name: "SidebarCardStub",
          template: "<div class=\"sidebar-card-stub\"><slot /></div>",
        }),
        Icon: defineComponent({
          name: "IconStub",
          props: ["name", "size"],
          template: "<i class=\"icon-stub\"><slot /></i>",
        }),
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
});
