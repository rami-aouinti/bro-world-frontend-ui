import { defineEventHandler } from "h3";

import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { readQuizMock, resolveGameApiBase } from "~/server/utils/quizGame";

export default defineEventHandler(async (event) => {
  const { baseUrl, useMock } = resolveGameApiBase(event);

  if (useMock || !baseUrl) {
    return await readQuizMock("leaderboard");
  }

  const endpoint = `${baseUrl}/quiz/leaderboard`;

  try {
    return await requestWithRetry("GET", endpoint);
  } catch (error) {
    console.warn("[quiz] Remote leaderboard API unavailable, falling back to mock data.", error);
    return await readQuizMock("leaderboard");
  }
});
