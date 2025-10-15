import { computed } from "vue";

export default defineNuxtPlugin(() => {
  const route = useRoute();
  const description = computed(
    () =>
      (typeof route.meta?.description === "string" && route.meta.description.trim()) ||
      "Welcome to Bro World, your unique community platform.",
  );

  useSeoMeta({
    description,
    ogDescription: description,
    twitterDescription: description,
  });
});
