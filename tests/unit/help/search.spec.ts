import { afterEach, describe, expect, it } from "vitest";

import {
  clearHelpCache,
  listHelpCategories,
  searchHelpArticles,
} from "~/server/utils/help";

afterEach(() => {
  clearHelpCache();
});

describe("help search", () => {
  it("returns articles matching a keyword", async () => {
    const results = await searchHelpArticles("account", "en");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.title.toLowerCase()).toContain("account");
  });

  it("applies locale translations", async () => {
    const resultsFr = await searchHelpArticles("facture", "fr");

    expect(resultsFr.length).toBeGreaterThan(0);
    const frenchArticle = resultsFr.find((article) => article.slug === "update-billing");
    expect(frenchArticle?.title).toContain("facturation");
  });

  it("lists localized categories", async () => {
    const categories = await listHelpCategories("de");

    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]?.title).toBeDefined();
    const gettingStarted = categories.find((category) => category.slug === "getting-started");
    expect(gettingStarted?.title).toContain("Schritte");
  });
});
