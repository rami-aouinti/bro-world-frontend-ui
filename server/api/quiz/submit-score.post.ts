import { defineEventHandler, readBody } from "h3";

import { getUserToken } from "~/server/utils/getUserToken";
import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { readQuizMock, resolveGameApiBase } from "~/server/utils/quizGame";

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);
  const payload = await readBody<unknown>(event).catch(() => undefined);
  const { baseUrl, useMock } = resolveGameApiBase(event);

  if (useMock || !baseUrl) {
    return await readQuizMock("submit-score");
  }

  const endpoint = `${baseUrl}/quiz/submit-score`;

  try {
    return await requestWithRetry("POST", endpoint, {
      token,
      body: payload,
    });
  } catch (error) {
    console.warn("[quiz] Remote submit-score API unavailable, falling back to mock data.", error);
    return await readQuizMock("submit-score");
  }
});
