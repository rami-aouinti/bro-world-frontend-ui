import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { createI18n } from "vue-i18n";
import { mount } from "@vue/test-utils";
import PostMeta from "~/components/blog/PostMeta.vue";
import en from "~/i18n/locales/en.json";

const authReady = ref(false);
const authAuthenticated = ref(false);

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: { en },
});

vi.mock("~/stores/auth-session", () => ({
  useAuthSession: () => ({
    isReady: computed(() => authReady.value),
    isAuthenticated: computed(() => authAuthenticated.value),
  }),
}));

const defaultUser = {
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  username: "jane",
  email: "jane@example.com",
  enabled: true,
  photo: null,
};

function mountComponent(options: Record<string, unknown> = {}) {
  return mount(PostMeta, {
    props: {
      user: defaultUser,
      defaultAvatar: "https://example.com/avatar.png",
      publishedLabel: "Published today",
      ...options,
    },
    global: {
      plugins: [i18n],
      stubs: {
        ClientOnly: { template: "<div><slot /><slot name='fallback' /></div>" },
        NuxtImg: { template: "<img />" },
        NuxtLink: { template: "<a><slot /></a>" },
      },
    },
  });
}

describe("PostMeta", () => {
  beforeEach(() => {
    authReady.value = false;
    authAuthenticated.value = false;
  });

  it("does not render actions when the viewer is not authenticated", () => {
    authReady.value = true;
    authAuthenticated.value = false;
    const wrapper = mountComponent();

    expect(wrapper.find("[data-test='author-actions']").exists()).toBe(false);
  });

  it("renders follow button for authenticated non-following users", async () => {
    authReady.value = true;
    authAuthenticated.value = true;
    const wrapper = mountComponent({
      isAuthenticated: true,
      isAuthor: false,
      isFollowing: false,
      followLabel: "Follow",
      followLoadingLabel: "Following",
    });

    const followButton = wrapper.find("[data-test='follow-button']");

    expect(followButton.exists()).toBe(true);
    await followButton.trigger("click");

    expect(wrapper.emitted("follow")).toBeTruthy();
  });

  it("opens the action menu for the author", async () => {
    authReady.value = true;
    authAuthenticated.value = true;
    const wrapper = mountComponent({
      isAuthenticated: true,
      isAuthor: true,
      actionsAriaLabel: "Open menu",
      editLabel: "Edit",
      deleteLabel: "Delete",
    });

    const trigger = wrapper.find("[data-test='post-actions-trigger']");

    expect(trigger.exists()).toBe(true);

    await trigger.trigger("click");

    const editButton = wrapper.find("[data-test='post-action-edit']");
    const deleteButton = wrapper.find("[data-test='post-action-delete']");

    expect(editButton.exists()).toBe(true);
    expect(deleteButton.exists()).toBe(true);

    await editButton.trigger("click");
    await deleteButton.trigger("click");

    expect(wrapper.emitted("edit")).toHaveLength(1);
    expect(wrapper.emitted("delete")).toHaveLength(1);
  });
});
