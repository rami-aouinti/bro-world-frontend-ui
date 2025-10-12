import { createError, readBody } from "h3";
import type { SiteSettings } from "~/types/settings";
import { updateSiteSettings } from "../utils/settings/storage";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Partial<SiteSettings> | null;

  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payload",
    });
  }

  const updated = await updateSiteSettings(event, body);

  return { data: updated };
});
