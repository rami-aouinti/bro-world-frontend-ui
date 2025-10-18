import { createError, getQuery, getRouterParams } from "h3";
import { getCourse, getCourseLessons } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const { locale } = getQuery(event);
  const localeCode = typeof locale === "string" ? locale : undefined;
  const lessons = await getCourseLessons(slug, localeCode);

  if (!lessons.length) {
    const course = await getCourse(slug, localeCode);
    if (!course) {
      throw createError({ statusCode: 404, statusMessage: "Course not found" });
    }
  }

  return lessons;
});
