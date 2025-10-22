<template>
  <EcommerceIndexPage />
</template>

<script setup lang="ts">
import EcommerceIndexPage from "~/pages/ecommerce/index.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
