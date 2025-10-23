import { describe, expect, it } from "vitest";

import { createPinia } from "~/lib/pinia-shim";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { useWorldMemberships } from "~/stores/world-memberships";

describe("useWorldMemberships.syncFromSiteSettings", () => {
  it("marks the first three worlds as active by default", () => {
    const pinia = createPinia();
    const store = useWorldMemberships(pinia);
    const settings = getDefaultSiteSettings();

    store.syncFromSiteSettings(settings);

    const expectedIds = (settings.worlds ?? [])
      .slice(0, 3)
      .map((world) => world.id);

    expect(store.activeWorldIds.value).toEqual(expectedIds);
    for (const worldId of expectedIds) {
      expect(store.getMembership(worldId).status).toBe("active");
    }

    const fourthWorldId = settings.worlds?.[3]?.id;
    if (fourthWorldId) {
      expect(store.getMembership(fourthWorldId).status).toBe("none");
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
});
