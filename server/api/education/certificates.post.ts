import { createError, getQuery, readBody } from "h3";
import { createCertificate } from "~/server/utils/education";
import type { CourseCertificatePayload } from "~/types/education";

export default defineEventHandler(async (event) => {
  const body = await readBody<CourseCertificatePayload>(event);

  if (!body?.courseId || !body.userName || typeof body.score !== "number") {
    throw createError({ statusCode: 400, statusMessage: "Invalid payload" });
  }

  const { locale } = getQuery(event);
  const localeCode = typeof locale === "string" ? locale : undefined;

  const certificate = await createCertificate(
    {
      courseId: body.courseId,
      userName: body.userName,
      score: body.score,
    },
    localeCode,
  );

  return certificate;
});
