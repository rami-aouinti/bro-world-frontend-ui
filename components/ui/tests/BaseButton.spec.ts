import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseButton from "../BaseButton.vue";

describe("BaseButton", () => {
  it("prevents click when loading", async () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
      },
      slots: {
        default: "Submit",
      },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("emits click when enabled", async () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: "Save",
      },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
