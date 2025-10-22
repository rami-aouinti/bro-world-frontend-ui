<template>
  <EcommerceCheckoutPage />
</template>

<script setup lang="ts">
import EcommerceCheckoutPage from "~/pages/ecommerce/checkout.vue";

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
