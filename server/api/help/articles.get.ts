import { listHelpArticles } from "~/server/utils/help";

export default defineEventHandler(async (event) => {
  const { category, q, locale = "en", popular } = getQuery(event);

  return listHelpArticles({
    locale: String(locale),
    categorySlug: typeof category === "string" ? category : undefined,
    query: typeof q === "string" ? q : undefined,
    popular: popular === "true" || popular === "1",
  });
});
