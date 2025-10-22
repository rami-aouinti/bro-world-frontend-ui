<template>
  <EducationPage />
</template>

<script setup lang="ts">
import EducationPage from "~/pages/education/index.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "education",
});
</script>
