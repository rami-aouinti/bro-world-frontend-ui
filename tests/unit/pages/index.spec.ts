import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import IndexPage from "~/pages/index.vue";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings } from "~/types/settings";

vi.mock("#imports", () => ({
  definePageMeta: vi.fn(),
  useSeoMeta: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const siteSettingsRef = ref<SiteSettings | null>(null);
const siteSettingsStateMock = Object.assign(siteSettingsRef, {
  enabledPlugins: computed(() => [] as string[]),
});

vi.mock("~/composables/useSiteSettingsState", () => ({
  useSiteSettingsState: () => siteSettingsStateMock,
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

  const globalStubs = {
    SidebarCard: { template: "<div><slot /></div>" },
    WorldExplorerCard: WorldExplorerCardStub,
  } as const;

  beforeEach(() => {
    siteSettingsRef.value = getDefaultSiteSettings();
  });

  it("renders a card for each configured world", () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: globalStubs,
      },
    });

    const cards = wrapper.findAll('[data-test="world-explorer-card"]');
    expect(cards).toHaveLength(siteSettingsRef.value?.worlds?.length ?? 0);
  });

  it("updates the active world when a card emits an activate event", async () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: globalStubs,
      },
    });

    const cards = wrapper.findAll('[data-test="world-explorer-card"]');
    expect(cards.length).toBeGreaterThan(1);

    await cards[1].find(".activate-button").trigger("click");

    expect(siteSettingsRef.value?.activeWorldId).toBe(
      siteSettingsRef.value?.worlds?.[1]?.id ?? null,
    );
  });

  it("shows the empty state when no worlds are configured", () => {
    const fallback = getDefaultSiteSettings();
    siteSettingsRef.value = {
      ...fallback,
      worlds: [],
      activeWorldId: null,
    } satisfies SiteSettings;

    const wrapper = mount(IndexPage, {
      global: {
        stubs: globalStubs,
      },
    });

    expect(wrapper.find('[data-test="world-explorer-empty"]').exists()).toBe(true);
  });
});
