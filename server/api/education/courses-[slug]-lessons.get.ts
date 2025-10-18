import { createError, getRouterParams } from "h3";
import { getCourse, getCourseLessons } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  const lessons = await getCourseLessons(slug);

  if (!lessons.length) {
    const course = await getCourse(slug);
    if (!course) {
      throw createError({ statusCode: 404, statusMessage: "Course not found" });
    }
  }

  return lessons;
});
