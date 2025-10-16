import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";

import { createPinia } from "~/lib/pinia-shim";
import type { ProfileUser } from "~/types/pages/profile";
import { __resetNuxtStateMocks } from "#imports";

describe("profile store", () => {
  beforeEach(() => {
    __resetNuxtStateMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears the cached profile and resolves with null when unauthenticated", async () => {
    const { useProfileStore } = await import("~/stores/profile");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof useProfileStore>;
    app.runWithContext(() => {
      store = useProfileStore();
    });

    const profile: ProfileUser = {
      id: "user-1",
      username: "user-1",
      email: "user-1@example.com",
      firstName: "User",
      lastName: "One",
      profile: {
        description: "Hello",
        photo: null,
        address: null,
        hometown: null,
        schools: null,
        title: null,
        phone: null,
        birthday: null,
        gender: null,
      },
      friends: [],
      stories: [],
    };

    store.setProfile(profile);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    store.clearProfile();

    const result = await store.fetchProfile();

    expect(result).toBeNull();
    expect(store.profile.value).toBeNull();
    expect(store.error.value).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
