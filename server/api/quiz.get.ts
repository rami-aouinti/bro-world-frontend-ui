import { getQuizLandingData } from "~/server/utils/quiz";

export default defineEventHandler(async () => {
  return getQuizLandingData();
});
