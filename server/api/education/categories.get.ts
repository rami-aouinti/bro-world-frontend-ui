import { listCategories } from "~/server/utils/education";

export default defineEventHandler(async () => {
  return listCategories();
});
