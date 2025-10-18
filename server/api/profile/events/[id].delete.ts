import { createError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import { getUserToken } from "~/server/utils/getUserToken";

function resolveProfileApiBase(event: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event);
  const base = config.public?.apiProfileBase;

  if (typeof base === "string" && base.trim()) {
    return base.replace(/\/$/, "");
  }

  return "https://bro-world.org";
}

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
    });
  }

  const id = event.context.params?.id;
  const trimmedId = typeof id === "string" ? id.trim() : "";

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing event identifier.",
    });
  }

  const baseUrl = resolveProfileApiBase(event);
  const url = `${baseUrl}/api/v1/profile/events/${encodeURIComponent(trimmedId)}`;

  return await $fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
});
