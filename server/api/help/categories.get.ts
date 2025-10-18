import { listHelpCategories } from "~/server/utils/help";

export default defineEventHandler(async (event) => {
  const { locale = "en" } = getQuery(event);
  return listHelpCategories(String(locale));
});
