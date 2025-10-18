import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

import HelpFeedback from "~/components/help/HelpFeedback.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: { en: {} },
});

describe("HelpFeedback", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores user response and shows thank you message", async () => {
    const wrapper = mount(HelpFeedback, {
      props: {
        articleId: "demo-article",
        question: "Was this helpful?",
        yesLabel: "Yes",
        noLabel: "No",
        thanksLabel: "Thanks!",
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.get('[data-test="help-feedback-yes"]').trigger("click");

    expect(window.localStorage.getItem("help-feedback:demo-article")).toContain("yes");
    expect(wrapper.get('[data-test="help-feedback-thanks"]').text()).toBe("Thanks!");
    expect(wrapper.get('[data-test="help-feedback-yes"]').attributes("disabled")).toBeDefined();
  });
});
