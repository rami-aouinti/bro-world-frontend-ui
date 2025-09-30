import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCheckbox from "../BaseCheckbox.vue";
import FormField from "../FormField.vue";

describe("BaseCheckbox", () => {
  it("emits update when toggled", async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        label: "Accept",
      },
    });

    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted()["update:modelValue"]).toBeTruthy();
    expect(wrapper.emitted()["update:modelValue"]?.[0]).toEqual([true]);
  });

  it("inherits describedby from form field", async () => {
    const wrapper = mount({
      components: { BaseCheckbox, FormField },
      template: `
        <FormField label="Terms" :hint="'Read carefully'" :error="true" :error-messages="['Required']">
          <BaseCheckbox model-value="false" />
        </FormField>
      `,
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.attributes("aria-describedby")).toBeTruthy();
  });
});
