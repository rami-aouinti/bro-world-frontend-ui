import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BaseRadioGroup from "../BaseRadioGroup.vue";

const options = [
  { label: "One", value: "one" },
  { label: "Two", value: "two" },
  { label: "Three", value: "three", disabled: true },
];

describe("BaseRadioGroup", () => {
  it("updates value on click", async () => {
    const wrapper = mount({
      components: { BaseRadioGroup },
      data: () => ({
        value: "one",
        options,
      }),
      template: `<BaseRadioGroup v-model="value" :options="options" />`,
    });

    await wrapper.findAll("button")[1].trigger("click");
    await nextTick();

    const state = wrapper.vm as { value: string };
    expect(state.value).toBe("two");
  });

  it("supports arrow key navigation", async () => {
    const wrapper = mount({
      components: { BaseRadioGroup },
      data: () => ({
        value: "one",
        options,
      }),
      template: `<BaseRadioGroup v-model="value" :options="options" />`,
    });

    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    const state = wrapper.vm as { value: string };
    expect(state.value).toBe("two");

    await buttons[1].trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    // Skips disabled option and wraps around
    expect(state.value).toBe("one");
  });
});
