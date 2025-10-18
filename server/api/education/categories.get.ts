import { getQuery } from "h3";
import { listCategories } from "~/server/utils/education";

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event);
  const localeCode = typeof locale === "string" ? locale : undefined;
  return listCategories(localeCode);
});
