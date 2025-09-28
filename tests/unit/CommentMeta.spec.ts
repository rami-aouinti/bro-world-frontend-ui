import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CommentMeta from "~/components/blog/CommentMeta.vue";

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
  return mount(CommentMeta, {
    props: {
      user: defaultUser,
      defaultAvatar: "https://example.com/avatar.png",
      publishedLabel: "Published moments ago",
      ...options,
    },
  });
}

describe("CommentMeta", () => {
  it("does not render actions when the viewer is not authenticated", () => {
    const wrapper = mountComponent();

    expect(wrapper.find("[data-test='comment-actions']").exists()).toBe(false);
  });

  it("renders follow button for authenticated non-following users", async () => {
    const wrapper = mountComponent({
      isAuthenticated: true,
      isAuthor: false,
      isFollowing: false,
      followLabel: "Follow",
      followLoadingLabel: "Following",
    });

    const followButton = wrapper.find("[data-test='comment-follow-button']");

    expect(followButton.exists()).toBe(true);
    await followButton.trigger("click");

    expect(wrapper.emitted("follow")).toBeTruthy();
  });

  it("opens the action menu for the comment author", async () => {
    const wrapper = mountComponent({
      isAuthenticated: true,
      isAuthor: true,
      actionsAriaLabel: "Open menu",
      editLabel: "Edit",
      deleteLabel: "Delete",
    });

    const trigger = wrapper.find("[data-test='comment-actions-trigger']");

    expect(trigger.exists()).toBe(true);

    await trigger.trigger("click");

    const editButton = wrapper.find("[data-test='comment-action-edit']");
    const deleteButton = wrapper.find("[data-test='comment-action-delete']");

    expect(editButton.exists()).toBe(true);
    expect(deleteButton.exists()).toBe(true);

    await editButton.trigger("click");
    await deleteButton.trigger("click");

    expect(wrapper.emitted("edit")).toHaveLength(1);
    expect(wrapper.emitted("delete")).toHaveLength(1);
  });
});
