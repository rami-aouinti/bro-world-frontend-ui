import { test, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

function url(path: string) {
  return new URL(path, baseURL).toString();
}

test.describe("Right sidebar drawer", () => {
  test("renders sidebar content on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(url("/"));
    await page.waitForLoadState("networkidle");

    const drawer = page.locator('[data-test="app-right-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('[data-test="app-sidebar-right"]')).toBeVisible();
  });

  test("opens the right drawer on mobile when toggled", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url("/"));
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator('[data-test="app-sidebar-right"]');
    await expect(sidebar).toHaveCount(0);

    await page.locator('[data-test="open-right-widgets"]').click();
    await expect(page.locator('[data-test="app-sidebar-right"]')).toBeVisible();
  });
});
