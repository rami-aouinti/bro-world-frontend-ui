import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";

import WorldExplorerCard from "~/components/world/WorldExplorerCard.vue";
import type { SiteWorldSettings } from "~/types/settings";

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
    setup(_, { attrs, slots, emit }) {
      return () =>
        {
          const resolvedAttrs = { ...(attrs as Record<string, unknown>) };
          const disabledAttr = resolvedAttrs.disabled;
          delete resolvedAttrs.disabled;
          const toAttr = resolvedAttrs.to;
          if (typeof toAttr === "string") {
            resolvedAttrs["data-to"] = toAttr;
          } else if (toAttr && typeof toAttr === "object") {
            resolvedAttrs["data-to"] = (toAttr as { path?: string }).path ?? "";
          }
          delete resolvedAttrs.to;
          const isDisabled = disabledAttr !== undefined && disabledAttr !== false;

          return h(
            "button",
            {
              type: "button",
              ...resolvedAttrs,
              disabled: isDisabled,
              onClick: (event: Event) => {
                if (isDisabled) {
                  event.preventDefault();
                  return;
                }

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
      to: {
        type: [String, Object],
        default: undefined,
      },
    },
    setup(props, { slots }) {
      return () =>
        h(
          "a",
          {
            href:
              typeof props.to === "string"
                ? props.to
                : props.to && typeof props.to === "object"
                  ? (props.to as Record<string, string>).path ?? ""
                  : undefined,
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

describe("components/world/WorldExplorerCard", () => {
  it("links the enter button to /home when the slug is home", () => {
    const wrapper = mount(WorldExplorerCard, {
      props: {
        world: createWorld({ id: "home", name: "Home", slug: "home" }),
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("data-to")).toBe("/home");
  });

  it("links the enter button to the world route for other slugs", () => {
    const wrapper = mount(WorldExplorerCard, {
      props: {
        world: createWorld({ slug: "innovation-lab" }),
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("data-to")).toBe("/world/innovation-lab");
  });

  it("emits an activate event when the set active button is pressed", async () => {
    const world = createWorld({ id: "market", slug: "market" });
    const wrapper = mount(WorldExplorerCard, {
      props: {
        world,
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");

    expect(wrapper.emitted("activate")).toEqual([[world.id]]);
  });

  it("disables the set active button when the card is already active", () => {
    const wrapper = mount(WorldExplorerCard, {
      props: {
        world: createWorld(),
        isActive: true,
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[1].text()).toBe("pages.index.actions.active");
  });

  it("renders participants and rating when provided", () => {
    const wrapper = mount(WorldExplorerCard, {
      props: {
        world: createWorld({ participantsCount: 42, rating: 4.7 }),
      },
      global: {
        stubs: globalStubs,
      },
    });

    expect(wrapper.text()).toContain("pages.index.participantsLabel:{\"count\":\"42\"}");
    expect(wrapper.text()).toContain("pages.index.ratingLabel:{\"rating\":\"4.7\"}");
  });
});
