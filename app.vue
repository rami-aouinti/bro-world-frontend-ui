<template>
  <NuxtLoadingIndicator
    :color="false"
    class="z-100 bg-primary/80"
  />
  <NuxtLayout />
</template>

<script setup lang="ts">
const config = useConfig();
const route = useRoute();
const { themeClass, radius } = useThemes();

const baseRouteName = computed(() => useRouteBaseName()(route));

useSeoMeta({
  description: config.value.site.description,
  ogDescription: config.value.site.description,
  twitterCard: "summary_large_image",
});

useHead({
  bodyAttrs: {
    class: themeClass.value,
    style: `--radius: ${radius.value}rem;`,
  },
});
</script>
