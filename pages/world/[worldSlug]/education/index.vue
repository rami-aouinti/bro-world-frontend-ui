<template>
  <EducationIndexPage />
</template>

<script setup lang="ts">
import EducationIndexPage from "~/components/education/EducationIndexPage.vue";

definePageMeta({
  alias: ["/education"],
  documentDriven: false,
  requiresPlugin: "education",
});
</script>
