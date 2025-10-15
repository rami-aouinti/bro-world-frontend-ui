import { computed } from "vue";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export default defineNuxtPlugin(() => {
  const route = useRoute();
  const runtimeConfig = useRuntimeConfig();

  const baseUrl = computed(() => {
    const siteUrl = runtimeConfig.public?.siteUrl?.toString().trim();

    if (!siteUrl) {
      return "";
    }

    try {
      return trimTrailingSlash(new URL(siteUrl).toString());
    } catch {
      return trimTrailingSlash(siteUrl);
    }
  });

  const canonicalUrl = computed(() => {
    const url = baseUrl.value;

    return url ? `${url}${route.fullPath}` : route.fullPath;
  });

  useHead(() => ({
    link: [
      {
        rel: "canonical",
        href: canonicalUrl.value,
      },
    ],
  }));
});
