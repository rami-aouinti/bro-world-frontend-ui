import { getQuery } from "h3";
import { listCourses } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { category, locale } = getQuery(event);
  const categorySlug = typeof category === "string" ? category : undefined;
  const localeCode = typeof locale === "string" ? locale : undefined;
  return listCourses(categorySlug, localeCode);
});
