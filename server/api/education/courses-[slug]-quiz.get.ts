import { createError, getRouterParams } from "h3";
import { getCourse, getCourseQuiz } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const quiz = await getCourseQuiz(slug);

  if (!quiz.length) {
    const course = await getCourse(slug);
    if (!course) {
      throw createError({ statusCode: 404, statusMessage: "Course not found" });
    }
  }

  return quiz;
});
