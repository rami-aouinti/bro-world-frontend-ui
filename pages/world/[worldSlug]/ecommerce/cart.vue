<template>
  <EcommerceCartPage />
</template>

<script setup lang="ts">
import EcommerceCartPage from "~/pages/ecommerce/cart.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
