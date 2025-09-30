import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSelect from "../BaseSelect.vue";

const items = [
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
];

describe("BaseSelect", () => {
  it("emits update when selection changes", async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: null,
        items,
      },
    });

    const vm = wrapper.vm as { onUpdate: (value: string) => void };
    vm.onUpdate("red");

    expect(wrapper.emitted()["update:modelValue"]).toBeTruthy();
    expect(wrapper.emitted()["update:modelValue"]?.[0]).toEqual(["red"]);
  });

  it("clears value when clear event is triggered", async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "red",
        items,
        clearable: true,
      },
    });

    const vm = wrapper.vm as { onClear: () => void };
    vm.onClear();
    expect(wrapper.emitted("clear")).toBeTruthy();
    expect(wrapper.emitted()["update:modelValue"]?.[0]).toEqual([null]);
  });
});
