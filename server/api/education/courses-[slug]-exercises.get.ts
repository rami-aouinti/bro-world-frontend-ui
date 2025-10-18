import { createError, getQuery, getRouterParams } from "h3";
import { getCourse, getCourseExercises } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const { locale } = getQuery(event);
  const localeCode = typeof locale === "string" ? locale : undefined;
  const exercises = await getCourseExercises(slug, localeCode);

  if (!exercises.length) {
    const course = await getCourse(slug, localeCode);
    if (!course) {
      throw createError({ statusCode: 404, statusMessage: "Course not found" });
    }
  }

  return exercises;
});
