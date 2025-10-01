import type { SiteSettings } from "~/types/settings";

export function useSiteSettingsState() {
  return useState<SiteSettings | null>("site-settings", () => null);
}
