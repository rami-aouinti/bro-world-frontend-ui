<template>
  <EcommerceCatalogPage />
</template>

<script setup lang="ts">
import EcommerceCatalogPage from "~/pages/ecommerce/catalog.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
