import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, reactive, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import IndexPage from "~/pages/index.vue";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings, SiteWorldSettings } from "~/types/settings";

const localePathMock = vi.fn((route: unknown) => route);

vi.mock("#imports", async () => {
  const actual = await vi.importActual<typeof import("../../mocks/nuxt-imports")>(
    "../../mocks/nuxt-imports",
  );

  return {
    ...actual,
    definePageMeta: vi.fn(),
    useSeoMeta: vi.fn(),
    useLocalePath: () => localePathMock,
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const siteSettingsRef = ref<SiteSettings | null>(null);
const activeWorldsRef = ref<SiteWorldSettings[]>([]);

const siteSettingsStateMock = Object.assign(siteSettingsRef, {
  enabledPlugins: computed(() => [] as string[]),
  activeWorlds: computed(() => activeWorldsRef.value),
  memberships: computed(() => ({}) as Record<string, unknown>),
});

vi.mock("~/composables/useSiteSettingsState", () => ({
  useSiteSettingsState: () => siteSettingsStateMock,
}));

const membershipMap = reactive<Record<string, { worldId: string; status: string }>>({});
const activeWorldIdsRef = ref<string[]>([]);
const activateWorldMock = vi.fn(async (worldId: string) => {
  membershipMap[worldId] = {
    worldId,
    status: "active",
  };

  const normalized = worldId?.trim() ?? "";

  if (!normalized) {
    activeWorldIdsRef.value = [];
    return;
  }

  const existing = activeWorldIdsRef.value.filter((id) => id !== normalized);

  activeWorldIdsRef.value = [normalized, ...existing].slice(0, 5);
});

vi.mock("~/stores/world-memberships", () => ({
  useWorldMembershipsStore: () => ({
    memberships: membershipMap,
    activeWorldIds: computed(() => activeWorldIdsRef.value),
    activateWorld: activateWorldMock,
  }),
}));

describe("pages/index world explorer", () => {
  const WorldExplorerCardStub = defineComponent({
    name: "WorldExplorerCardStub",
    props: {
      world: {
        type: Object,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      membership: {
        type: Object,
        default: null,
      },
    },
    emits: ["activate"],
    setup(props, { emit }) {
      return () =>
        h(
          "div",
          {
            class: [
              "world-explorer-card-stub",
              { "world-explorer-card-stub--active": props.isActive },
            ],
            "data-test": "world-explorer-card",
          },
          [
            h(
              "button",
              {
                class: "activate-button",
                type: "button",
                onClick: () => emit("activate", (props.world as { id: string }).id),
              },
              "activate",
            ),
          ],
        );
    },
  });

  const nuxtLinkStub = { props: ["to"], template: '<a :data-to="to"><slot /></a>' } as const;

  const globalStubs = {
    SidebarCard: { template: "<div><slot /></div>" },
    WorldExplorerCard: WorldExplorerCardStub,
  } as const;

  const defaultStubs = {
    ...globalStubs,
    NuxtLink: nuxtLinkStub,
  } as const;

  beforeEach(() => {
    siteSettingsRef.value = getDefaultSiteSettings();
    activeWorldsRef.value = siteSettingsRef.value?.worlds?.slice(0, 3) ?? [];
    activeWorldIdsRef.value = activeWorldsRef.value.map((world) => world.id);
    Object.keys(membershipMap).forEach((key) => {
      delete membershipMap[key];
    });
    activateWorldMock.mockClear();
    localePathMock.mockClear();
  });

  it("renders a card for each world", () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: defaultStubs,
      },
    });

    const cards = wrapper.findAll('[data-test="world-explorer-card"]');
    expect(cards).toHaveLength(siteSettingsRef.value?.worlds?.length ?? 0);
  });

  it("falls back to all worlds when no active worlds are configured", () => {
    activeWorldsRef.value = [];
    activeWorldIdsRef.value = [];

    const wrapper = mount(IndexPage, {
      global: {
        stubs: defaultStubs,
      },
    });

    const cards = wrapper.findAll('[data-test="world-explorer-card"]');
    expect(cards).toHaveLength(siteSettingsRef.value?.worlds?.length ?? 0);
  });

  it("updates the memberships when a card emits an activate event", async () => {
    activeWorldsRef.value = siteSettingsRef.value?.worlds ?? [];
    activeWorldIdsRef.value = activeWorldsRef.value.map((world) => world.id);

    const wrapper = mount(IndexPage, {
      global: {
        stubs: defaultStubs,
      },
    });

    const cards = wrapper.findAll('[data-test="world-explorer-card"]');
    expect(cards.length).toBeGreaterThan(1);

    await cards[1].find(".activate-button").trigger("click");

    const expectedWorldId = siteSettingsRef.value?.worlds?.[1]?.id ?? null;

    expect(activateWorldMock).toHaveBeenCalledWith(expectedWorldId);

    if (expectedWorldId) {
      expect(activeWorldIdsRef.value[0]).toBe(expectedWorldId);
      expect(activeWorldIdsRef.value).toContain(expectedWorldId);
    } else {
      expect(activeWorldIdsRef.value).toEqual([]);
    }
  });

  it("shows the empty state when no worlds are configured", () => {
    const fallback = getDefaultSiteSettings();
    siteSettingsRef.value = {
      ...fallback,
      worlds: [],
      activeWorldId: null,
    } satisfies SiteSettings;
    activeWorldsRef.value = [];

    const wrapper = mount(IndexPage, {
      global: {
        stubs: defaultStubs,
      },
    });

    expect(wrapper.find('[data-test="world-explorer-empty"]').exists()).toBe(true);
  });

  it("renders the create world cta with a localized link", () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: defaultStubs,
      },
    });

    const cta = wrapper.get('[data-test="create-world-cta"]');
    expect(localePathMock).toHaveBeenCalledWith("/world-create");
    expect(cta.attributes("data-to")).toBe("/world-create");
  });
});
