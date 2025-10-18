import { createError, readBody } from "h3";
import { evaluateQuiz } from "~/server/utils/education";
import type { SubmitQuizPayload } from "~/types/education";

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitQuizPayload>(event);

  if (!body?.courseId || !body.answers) {
    throw createError({ statusCode: 400, statusMessage: "Invalid payload" });
  }

  const result = await evaluateQuiz(body.courseId, body.answers);
  return result;
});
