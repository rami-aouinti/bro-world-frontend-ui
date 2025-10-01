import { describe, expect, it } from "vitest";
import { buildSidebarItems } from "~/lib/navigation/sidebar";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

describe("buildSidebarItems", () => {
  it("omits the admin menu when access is denied", () => {
    const items = buildSidebarItems(getDefaultSiteSettings(), false);

    expect(items.some((item) => item.key === "admin")).toBe(false);
  });

  it("includes the admin menu and its children when access is granted", () => {
    const items = buildSidebarItems(getDefaultSiteSettings(), true);

    const adminEntry = items.find((item) => item.key === "admin");
    expect(adminEntry).toBeDefined();
    expect(adminEntry?.children?.map((child) => child.key)).toEqual([
      "admin-general",
      "admin-settings",
      "admin-user-management",
      "admin-blog",
    ]);
  });
});
