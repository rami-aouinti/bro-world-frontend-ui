import { listCourses } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { category } = getQuery(event);
  const categorySlug = typeof category === "string" ? category : undefined;
  return listCourses(categorySlug);
});
