import { describe, expect, it } from "vitest";

import { createPinia } from "~/lib/pinia-shim";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { useWorldMemberships } from "~/stores/world-memberships";

describe("useWorldMemberships.syncFromSiteSettings", () => {
  it("marks the first five worlds as active by default", () => {
    const pinia = createPinia();
    const store = useWorldMemberships(pinia);
    const settings = getDefaultSiteSettings();

    store.syncFromSiteSettings(settings);

    const expectedIds = (settings.worlds ?? []).slice(0, 5).map((world) => world.id);

    expect(store.activeWorldIds.value).toEqual(expectedIds);
    for (const worldId of expectedIds) {
      expect(store.getMembership(worldId).status).toBe("active");
    }

    const nextWorldId = settings.worlds?.[5]?.id;
    if (nextWorldId) {
      expect(store.getMembership(nextWorldId).status).toBe("none");
    }
  });

  it("prioritizes the configured active world when present", () => {
    const pinia = createPinia();
    const store = useWorldMemberships(pinia);
    const settings = getDefaultSiteSettings();
    const fourthWorld = settings.worlds?.[3];

    expect(fourthWorld).toBeDefined();

    const modifiedSettings = {
      ...settings,
      activeWorldId: fourthWorld?.id ?? null,
    };

    store.syncFromSiteSettings(modifiedSettings);

    const [firstActive] = store.activeWorldIds.value;
    expect(firstActive).toBe(fourthWorld?.id);
  });

  it("allows multiple worlds to remain active", () => {
    const pinia = createPinia();
    const store = useWorldMemberships(pinia);

    store.markActive(null);
    store.markActive("world-a");
    store.markActive("world-b");

    expect(store.activeWorldIds.value).toEqual(["world-b", "world-a"]);
  });

  it("limits the number of active worlds to five entries", () => {
    const pinia = createPinia();
    const store = useWorldMemberships(pinia);

    store.markActive(null);
    for (let index = 0; index < 7; index += 1) {
      store.markActive(`world-${index}`);
    }

    expect(store.activeWorldIds.value).toHaveLength(5);
    expect(store.activeWorldIds.value).toEqual([
      "world-6",
      "world-5",
      "world-4",
      "world-3",
      "world-2",
    ]);
  });
});
