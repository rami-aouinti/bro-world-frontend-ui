import { getSiteSettings } from "../utils/settings/storage";

export default defineEventHandler(async (event) => {
  const settings = await getSiteSettings(event);
  return { data: settings };
});
