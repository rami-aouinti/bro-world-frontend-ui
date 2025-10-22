<template>
  <EcommerceCheckoutPage />
</template>

<script setup lang="ts">
import EcommerceCheckoutPage from "~/components/ecommerce/EcommerceCheckoutPage.vue";

definePageMeta({
  alias: ["/ecommerce/checkout"],
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
</script>
