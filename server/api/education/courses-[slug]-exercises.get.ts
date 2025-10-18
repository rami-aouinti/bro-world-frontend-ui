import { createError, getRouterParams } from "h3";
import { getCourse, getCourseExercises } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const exercises = await getCourseExercises(slug);

  if (!exercises.length) {
    const course = await getCourse(slug);
    if (!course) {
      throw createError({ statusCode: 404, statusMessage: "Course not found" });
    }
  }

  return exercises;
});
