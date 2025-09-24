import { createError } from "h3";
import type { BlogApiResponse } from "~/lib/mock/blog";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const endpoint = config.public.blogApiEndpoint || "http://localhost/public/post";

  try {
    const response = await $fetch<BlogApiResponse>(endpoint, {
      method: "GET",
    });

    if (!response || !Array.isArray(response.data)) {
      throw new Error("Format de réponse inattendu");
    }

    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles du blog", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Impossible de récupérer les articles du blog.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
