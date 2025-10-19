import { defineEventHandler, readBody } from "h3";

import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { readQuizMock, resolveGameApiBase } from "~/server/utils/quizGame";

export default defineEventHandler(async (event) => {
  const payload = await readBody<unknown>(event).catch(() => undefined);
  const { baseUrl, useMock } = resolveGameApiBase(event);

  if (useMock || !baseUrl) {
    return await readQuizMock("generate");
  }

  const endpoint = `${baseUrl}/quiz/generate`;

  try {
    return await requestWithRetry("POST", endpoint, {
      body: payload,
    });
  } catch (error) {
    console.warn("[quiz] Remote generate API unavailable, falling back to mock data.", error);
    return await readQuizMock("generate");
  }
});
