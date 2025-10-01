import { getSiteSettings } from "../utils/settings/storage";

export default defineEventHandler(async () => {
  const settings = await getSiteSettings();
  return { data: settings };
});
