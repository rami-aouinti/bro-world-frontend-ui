import { searchHelpArticles } from "~/server/utils/help";

export default defineEventHandler(async (event) => {
  const { q = "", locale = "en" } = getQuery(event);
  return searchHelpArticles(String(q), String(locale));
});
