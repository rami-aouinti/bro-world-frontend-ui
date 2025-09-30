import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCard from "../BaseCard.vue";

const variants: Array<"solid" | "muted" | "outline" | "glass" | "gradient"> = [
  "solid",
  "muted",
  "outline",
  "glass",
  "gradient",
];

describe("BaseCard", () => {
  it("renders optional slot sections when provided", () => {
    const wrapper = mount(BaseCard, {
      slots: {
        media: '<div class="media-slot" />',
        header: "<div>Header</div>",
        default: "<p>Body content</p>",
        footer: "<span>Footer</span>",
      },
    });

    expect(wrapper.find('[data-test="base-card-media"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="base-card-header"]').text()).toContain("Header");
    expect(wrapper.find('[data-test="base-card-body"]').text()).toContain("Body content");
    expect(wrapper.find('[data-test="base-card-footer"]').text()).toContain("Footer");
  });

  it("applies gradient variant tokens and hoverable behaviour", () => {
    const wrapper = mount(BaseCard, {
      props: {
        variant: "gradient",
        hoverable: true,
      },
      slots: {
        default: "Content",
      },
    });

    expect(wrapper.attributes("data-variant")).toBe("gradient");
    expect(wrapper.classes()).toContain("base-card");
    expect(wrapper.classes()).toContain("base-card--hoverable");
    expect(wrapper.element.style.getPropertyValue("--card-background")).toContain(
      "linear-gradient",
    );
    expect(wrapper.element.style.getPropertyValue("--card-color")).toContain(
      "--v-theme-on-primary",
    );
  });

  it("supports custom root element, attributes and spacing tokens", () => {
    const wrapper = mount(BaseCard, {
      props: {
        as: "section",
        padding: "lg",
        spacing: "lg",
        footerDivider: false,
      },
      attrs: {
        id: "custom-card",
        class: "custom-card",
      },
      slots: {
        default: "Section content",
        footer: '<span data-test="footer">Footer</span>',
      },
    });

    expect(wrapper.element.tagName).toBe("SECTION");
    expect(wrapper.attributes("id")).toBe("custom-card");
    expect(wrapper.classes()).toContain("custom-card");
    expect(wrapper.element.style.getPropertyValue("--card-padding")).toBe("var(--ui-spacing-6)");
    expect(wrapper.element.style.getPropertyValue("--card-footer-border")).toBe("0");
    const footer = wrapper.find('[data-test="base-card-footer"]');
    expect(footer.exists()).toBe(true);
    expect(footer.find('[data-test="footer"]').exists()).toBe(true);
  });

  it.each(variants)("uses Vuetify tokens for %s variant", (variant) => {
    const wrapper = mount(BaseCard, {
      props: { variant },
      slots: { default: "Variant body" },
    });

    const styles = wrapper.element.style;
    expect(wrapper.attributes("data-variant")).toBe(variant);
    expect(styles.getPropertyValue("--card-background")).toMatch(/var\(--v-theme-/);
    expect(styles.getPropertyValue("--card-color")).toMatch(/var\(--v-theme-/);
    expect(styles.getPropertyValue("--card-border-color")).toMatch(/var\(--v-theme-/);
  });

  it("applies spacing tokens on body content", () => {
    const wrapper = mount(BaseCard, {
      props: { spacing: "sm" },
      slots: { default: "<p>Body</p>" },
    });

    const body = wrapper.find('[data-test="base-card-body"]');
    expect(body.classes()).toContain("base-card__body");
    expect(wrapper.element.style.getPropertyValue("--card-body-gap")).toBe("var(--ui-spacing-3)");
  });
});
