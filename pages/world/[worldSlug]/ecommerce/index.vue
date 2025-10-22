<template>
  <EcommerceIndexPage />
</template>

<script setup lang="ts">
import EcommerceIndexPage from "~/components/ecommerce/EcommerceIndexPage.vue";

definePageMeta({
  alias: ["/ecommerce"],
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
