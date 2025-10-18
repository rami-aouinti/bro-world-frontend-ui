import { describe, expect, it } from "vitest";

import ar from "~/i18n/locales/ar.json";
import fr from "~/i18n/locales/fr.json";

describe("help locales", () => {
  it("provides French translations for hero section", () => {
    expect(fr.help?.hero?.title).toContain("Comment");
    expect(fr.help?.faq?.items?.length).toBeGreaterThan(0);
  });

  it("provides Arabic translations with RTL ready strings", () => {
    expect(ar.help?.hero?.title).toContain("كيف");
    expect(ar.help?.breadcrumbs?.help).toContain("مركز");
  });
});
