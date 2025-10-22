<template>
  <EcommerceCatalogPage />
</template>

<script setup lang="ts">
import EcommerceCatalogPage from "~/components/ecommerce/EcommerceCatalogPage.vue";

definePageMeta({
  alias: ["/ecommerce/catalog"],
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
