import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";

import NewPost from "~/components/blog/NewPost.vue";
import { __getNotifyMock, __resetNuxtNotifyMock } from "#imports";

const notifyMock = __getNotifyMock();
const authState = ref(false);

vi.mock("~/composables/useAuthStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: authState,
  }),
}));

function mountComponent() {
  return mount(NewPost, {
    props: {
      userName: "Test User",
      avatar: "/avatar.png",
    },
    global: {
      stubs: {
        Icon: true,
        BorderBeam: true,
        VDialog: { template: '<div data-test="stub-dialog"><slot /></div>' },
      },
    },
  });
}

async function resolveAsyncComponents() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("NewPost", () => {
  beforeEach(() => {
    authState.value = false;
    __resetNuxtNotifyMock();
  });

  it("notifies unauthenticated users when they attempt to open the dialog", async () => {
    const wrapper = mountComponent();

    const vm = wrapper.vm as unknown as { openDialog: () => void };
    vm.openDialog();
    await nextTick();

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-test="new-post-dialog"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it("loads the dialog asynchronously and emits submit events", async () => {
    authState.value = true;
    const wrapper = mountComponent();

    const trigger = wrapper.get('[data-test="new-post-trigger"]');
    await trigger.trigger("click");

    expect(wrapper.find('[data-test="new-post-dialog-loading"]').exists()).toBe(true);
    expect((wrapper.vm as unknown as { dialog: boolean }).dialog).toBe(true);

    await resolveAsyncComponents();

    const handleDialogSubmit = (
      wrapper.vm as unknown as {
        handleDialogSubmit: (payload: { text: string; audience: string }) => void;
      }
    ).handleDialogSubmit;

    handleDialogSubmit({ text: "Hello world", audience: "friends" });

    await resolveAsyncComponents();

    const submitEvents = wrapper.emitted("submit");
    expect(submitEvents).toBeTruthy();
    expect(submitEvents?.[0]?.[0]).toEqual({
      text: "Hello world",
      audience: "friends",
    });

    wrapper.unmount();
  });
});
