import { createError, readBody } from "h3";
import type { CreateWorldRequestPayload } from "~/types/world";
import { createWorld } from "../utils/settings/storage";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as CreateWorldRequestPayload | null;

  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payload",
    });
  }

  const result = await createWorld(event, body);

  return { data: result };
});
