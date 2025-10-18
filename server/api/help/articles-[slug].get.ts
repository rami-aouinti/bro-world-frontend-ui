import { createError } from "h3";

import { getHelpArticle } from "~/server/utils/help";

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params ?? {};
  const { locale = "en" } = getQuery(event);

  if (!slug || typeof slug !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Missing article slug" });
  }

  const article = await getHelpArticle(slug, String(locale));

  if (!article) {
    throw createError({ statusCode: 404, statusMessage: "Article not found" });
  }

  return article;
});
