import { createError, getRouterParams } from "h3";
import { findCertificate } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  const certificate = findCertificate(id);

  if (!certificate) {
    throw createError({ statusCode: 404, statusMessage: "Certificate not found" });
  }

  return certificate;
});
