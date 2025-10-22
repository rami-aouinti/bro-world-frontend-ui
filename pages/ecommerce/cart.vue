<template>
  <EcommerceCartPage />
</template>

<script setup lang="ts">
import EcommerceCartPage from "~/components/ecommerce/EcommerceCartPage.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
