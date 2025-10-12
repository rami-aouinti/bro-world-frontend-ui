import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

import ContactForm from "~/components/forms/ContactForm.vue";
import en from "~/i18n/locales/en.json";

const notifyMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $fetch: (...args: unknown[]) => fetchMock(...args),
    $notify: (...args: unknown[]) => notifyMock(...args),
  }),
}));

vi.mock("#imports", async () => {
  const vueI18n = await import("vue-i18n");
  return {
    useI18n: vueI18n.useI18n,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: { en },
});

describe("ContactForm", () => {
  beforeEach(() => {
    notifyMock.mockClear();
    fetchMock.mockReset();
  });

  it("submits the form successfully", async () => {
    fetchMock.mockResolvedValueOnce({});

    const wrapper = mount(ContactForm, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.find('[data-test="name-field"] input').setValue("Alex Builder");
    await wrapper.find('[data-test="email-field"] input').setValue("alex@example.com");
    await wrapper.find('[data-test="subject-field"] input').setValue("Partnership");
    await wrapper
      .find('[data-test="message-field"] textarea')
      .setValue("Looking forward to collaborating on the next release cycle.");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith("/v1/contact", {
      body: {
        email: "alex@example.com",
        locale: "en",
        message: "Looking forward to collaborating on the next release cycle.",
        name: "Alex Builder",
        subject: "Partnership",
      },
      method: "POST",
    });
    expect(notifyMock).toHaveBeenCalledWith({
      message: en.pages.contact.form.success,
      title: en.pages.contact.title,
      type: "success",
    });

    expect((wrapper.find('[data-test="name-field"] input').element as HTMLInputElement).value).toBe(
      "",
    );
    expect(
      (wrapper.find('[data-test="message-field"] textarea').element as HTMLTextAreaElement).value,
    ).toBe("");
  });

  it("prevents submission when validation fails", async () => {
    const wrapper = mount(ContactForm, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.find('[data-test="name-field"] input').setValue("");
    await wrapper.find('[data-test="email-field"] input').setValue("invalid-email");
    await wrapper.find('[data-test="subject-field"] input').setValue("");
    await wrapper.find('[data-test="message-field"] textarea').setValue("short");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="email-error"]').text()).toBe(
      en.pages.contact.validation.email,
    );
    expect(wrapper.find('[data-test="message-error"]').text()).toBe(
      en.pages.contact.validation.minMessage,
    );
    expect(wrapper.find('[data-test="status-message"]').text()).toBe(
      en.pages.contact.validation.required,
    );
  });
});
