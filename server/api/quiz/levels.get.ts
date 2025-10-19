import { defineEventHandler } from "h3";

import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { readQuizMock, resolveGameApiBase } from "~/server/utils/quizGame";

export default defineEventHandler(async (event) => {
  const { baseUrl, useMock } = resolveGameApiBase(event);

  if (useMock || !baseUrl) {
    return await readQuizMock("levels");
  }

  const endpoint = `${baseUrl}/quiz/levels`;

  try {
    return await requestWithRetry("GET", endpoint);
  } catch (error) {
    console.warn("[quiz] Remote levels API unavailable, falling back to mock data.", error);
    return await readQuizMock("levels");
  }
});
