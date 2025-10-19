import { defineEventHandler } from "h3";

import { getUserToken } from "~/server/utils/getUserToken";
import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { readQuizMock, resolveGameApiBase } from "~/server/utils/quizGame";

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);
  const { baseUrl, useMock } = resolveGameApiBase(event);

  if (useMock || !baseUrl) {
    return await readQuizMock("my-score");
  }

  const endpoint = `${baseUrl}/quiz/my-score`;

  try {
    return await requestWithRetry("GET", endpoint, { token });
  } catch (error) {
    console.warn("[quiz] Remote my-score API unavailable, falling back to mock data.", error);
    return await readQuizMock("my-score");
  }
});
