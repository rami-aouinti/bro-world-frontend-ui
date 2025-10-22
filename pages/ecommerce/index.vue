<template>
  <EcommerceIndexPage />
</template>

<script setup lang="ts">
import EcommerceIndexPage from "~/components/ecommerce/EcommerceIndexPage.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
