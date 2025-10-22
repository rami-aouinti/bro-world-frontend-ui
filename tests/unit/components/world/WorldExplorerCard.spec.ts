import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WorldExplorerCard from "~/components/world/WorldExplorerCard.vue";
import { createPinia } from "~/lib/pinia-shim";
import type { SiteWorldSettings } from "~/types/settings";
import { useWorldMemberships } from "~/stores/world-memberships";
import type { WorldMembershipStatus } from "~/types/world-membership";

const routerPushMock = vi.hoisted(() => vi.fn());
const alertPushMock = vi.hoisted(() => vi.fn());
const fetcherMock = vi.hoisted(() => vi.fn());
const stateRegistry = vi.hoisted(() => new Map<string, unknown>());

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}));

vi.mock("~/stores/useAlertPanel", () => ({
  useAlertPanel: () => ({
    push: alertPushMock,
  }),
}));

vi.mock("~/lib/api/fetcher", () => ({
  resolveApiFetcher: () => fetcherMock,
}));

vi.mock("#imports", () => {
  const { ref } = require("vue");

  return {
    useState: (key: string, init: () => unknown) => {
      if (!stateRegistry.has(key)) {
        const value = typeof init === "function" ? (init as () => unknown)() : init;
        stateRegistry.set(key, ref(value));
      }

      return stateRegistry.get(key);
    },
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

const SidebarCardStub = defineComponent({
  name: "SidebarCardStub",
  setup(_, { attrs, slots }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
        },
        slots.default?.(),
      );
  },
});

const globalStubs = {
  SidebarCard: SidebarCardStub,
  VBtn: defineComponent({
    name: "VBtnStub",
    inheritAttrs: false,
    emits: ["click"],
    setup(_, { attrs, slots, emit }) {
      return () => {
        const resolvedAttrs = { ...(attrs as Record<string, unknown>) };
        const disabledAttr = resolvedAttrs.disabled;
        delete resolvedAttrs.disabled;

        return h(
          "button",
          {
            type: "button",
            ...resolvedAttrs,
            disabled: disabledAttr !== undefined && disabledAttr !== false,
            onClick: (event: Event) => {
              emit("click", event);
            },
          },
          slots.default?.(),
        );
      };
    },
  }),
  VChip: { template: "<span><slot /></span>" },
  Icon: { template: "<span />" },
  NuxtLink: defineComponent({
    name: "NuxtLinkStub",
    props: {
      to: { type: [String, Object], default: "" },
    },
    setup(props, { slots, attrs }) {
      return () =>
        h(
          "a",
          {
            ...attrs,
            href: typeof props.to === "string" ? props.to : "",
            "data-to": typeof props.to === "string" ? props.to : JSON.stringify(props.to),
          },
          slots.default?.(),
        );
    },
  }),
} as const;

function createWorld(overrides: Partial<SiteWorldSettings> = {}): SiteWorldSettings {
  return {
    id: "test-world",
    name: "Test World",
    slug: "test-world",
    pluginIds: [],
    visibility: "public",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } satisfies SiteWorldSettings;
}

function mountCard(options: {
  world?: SiteWorldSettings;
  isActive?: boolean;
  membershipStatus?: WorldMembershipStatus;
  isOwner?: boolean;
} = {}) {
  const pinia = createPinia();
  const world = options.world ?? createWorld();
  const store = useWorldMemberships(pinia);

  if (options.membershipStatus) {
    store.setMembership(world.id, {
      status: options.membershipStatus,
      role: options.isOwner ? "owner" : "member",
      isOwner: Boolean(options.isOwner),
    });
  }

  const wrapper = mount(WorldExplorerCard, {
    props: {
      world,
      isActive: options.isActive ?? false,
    },
    global: {
      stubs: globalStubs,
      plugins: [pinia],
    },
  });

  return { wrapper, world, store };
}

describe("components/world/WorldExplorerCard", () => {
  beforeEach(() => {
    stateRegistry.clear();
    fetcherMock.mockReset();
    routerPushMock.mockReset();
    alertPushMock.mockReset();
  });

  it("links the world title to the world route when the slug is home", () => {
    const world = createWorld({ id: "home", name: "Home", slug: "home" });
    const { wrapper } = mountCard({ world });

    const links = wrapper.findAll("a[data-to]");
    expect(links[0].attributes("data-to")).toBe(JSON.stringify({ path: "/world/home" }));
  });

  it("links the world title to the world route for other slugs", () => {
    const world = createWorld({ slug: "innovation-lab" });
    const { wrapper } = mountCard({ world });

    const links = wrapper.findAll("a[data-to]");
    expect(links[0].attributes("data-to")).toBe(JSON.stringify({ path: "/world/innovation-lab" }));
  });

  it("disables the enter button while membership approval is pending", () => {
    const { wrapper } = mountCard({ membershipStatus: "pending", world: createWorld({ visibility: "private" }) });

    const enterButton = wrapper.get('[data-test="world-enter-button"]');
    expect(enterButton.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("pages.index.membership.pendingHelper");
  });

  it("requests access for private worlds when the request button is pressed", async () => {
    const world = createWorld({ id: "private-world", visibility: "private" });
    fetcherMock.mockResolvedValueOnce({ data: { worldId: world.id, status: "pending" } });

    const { wrapper } = mountCard({ world });

    await wrapper.get('[data-test="world-action-button"]').trigger("click");
    await nextTick();

    expect(fetcherMock).toHaveBeenCalledWith(
      `/worlds/${encodeURIComponent(world.id)}/activate`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(alertPushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        message: expect.stringContaining("pages.index.membership.pendingToast"),
      }),
    );
  });

  it("enables entry immediately after the membership becomes active", async () => {
    const { wrapper, world, store } = mountCard({ membershipStatus: "pending", world: createWorld({ visibility: "private" }) });

    expect(wrapper.get('[data-test="world-enter-button"]').attributes("disabled")).toBeDefined();

    store.setMembership(world.id, { status: "active", role: "member" });
    await nextTick();

    expect(wrapper.get('[data-test="world-enter-button"]').attributes("disabled")).toBeUndefined();
    expect(alertPushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        message: expect.stringContaining("pages.index.membership.approvedToast"),
      }),
    );
  });

  it("emits an activate event when activation succeeds", async () => {
    const world = createWorld({ id: "market", slug: "market" });
    fetcherMock.mockResolvedValueOnce({ data: { worldId: world.id, status: "active" } });

    const { wrapper } = mountCard({ world });

    await wrapper.get('[data-test="world-action-button"]').trigger("click");
    await nextTick();

    expect(wrapper.emitted("activate")).toEqual([[world.id]]);
    expect(alertPushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        message: expect.stringContaining("pages.index.membership.approvedToast"),
      }),
    );
  });

  it("calls the enter endpoint and navigates when enter is pressed", async () => {
    fetcherMock.mockResolvedValue({});
    const { wrapper } = mountCard({ membershipStatus: "active" });

    await wrapper.get('[data-test="world-enter-button"]').trigger("click");

    expect(fetcherMock).toHaveBeenCalledWith(
      "/worlds/test-world/enter",
      expect.objectContaining({ method: "POST" }),
    );
    expect(routerPushMock).toHaveBeenCalledWith({ path: "/world/test-world" });
  });

  it("renders participants and rating when provided", () => {
    const { wrapper } = mountCard({
      world: createWorld({ participantsCount: 42, rating: 4.7 }),
    });

    expect(wrapper.text()).toContain('pages.index.participantsLabel:{"count":"42"}');
    expect(wrapper.text()).toContain('pages.index.ratingLabel:{"rating":"4.7"}');
  });
});
