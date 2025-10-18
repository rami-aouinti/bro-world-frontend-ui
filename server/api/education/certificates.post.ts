import { createError, readBody } from "h3";
import { createCertificate } from "~/server/utils/education";
import type { CourseCertificatePayload } from "~/types/education";

export default defineEventHandler(async (event) => {
  const body = await readBody<CourseCertificatePayload>(event);

  if (!body?.courseId || !body.userName || typeof body.score !== "number") {
    throw createError({ statusCode: 400, statusMessage: "Invalid payload" });
  }

  const certificate = await createCertificate({
    courseId: body.courseId,
    userName: body.userName,
    score: body.score,
  });

  return certificate;
});
