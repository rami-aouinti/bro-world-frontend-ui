import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DeleteConfirmModal from "../DeleteConfirmModal.vue";
import BaseModal from "../BaseModal.vue";
import BaseButton from "../BaseButton.vue";

describe("DeleteConfirmModal", () => {
  it("forwards v-model updates from the underlying modal", async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: {
        modelValue: true,
      },
    });

    const baseModal = wrapper.findComponent(BaseModal);
    await baseModal.vm.$emit("update:modelValue", false);

    expect(wrapper.emitted()["update:modelValue"]).toBeTruthy();
    expect(wrapper.emitted()["update:modelValue"]?.[0]).toEqual([false]);
  });

  it("emits confirm when the delete action is clicked", async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: {
        modelValue: true,
      },
    });

    const buttons = wrapper.findAllComponents(BaseButton);
    const confirmButton = buttons[1];
    await confirmButton.trigger("click");

    expect(wrapper.emitted().confirm).toBeTruthy();
  });

  it("emits cancel and closes when Cancel is clicked", async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: {
        modelValue: true,
      },
    });

    const buttons = wrapper.findAllComponents(BaseButton);
    const cancelButton = buttons[0];
    await cancelButton.trigger("click");

    expect(wrapper.emitted().cancel).toBeTruthy();
    expect(wrapper.emitted()["update:modelValue"]?.[0]).toEqual([false]);
  });

  it("emits cancel when the modal close event fires", async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: {
        modelValue: true,
      },
    });

    const baseModal = wrapper.findComponent(BaseModal);
    await baseModal.vm.$emit("close");

    expect(wrapper.emitted().cancel).toBeTruthy();
  });
});
