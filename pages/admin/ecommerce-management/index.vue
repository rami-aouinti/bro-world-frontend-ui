<template>
  <main
    class="py-10"
    aria-labelledby="admin-ecommerce-management-title"
  >
    <v-container>
      <header class="mb-8">
        <h1
          id="admin-ecommerce-management-title"
          class="text-h4 text-lg-h3 font-weight-bold mb-2"
        >
          {{ title }}
        </h1>
        <p
          id="admin-ecommerce-management-title-subtitle"
          class="text-body-1 text-medium-emphasis mb-0"
        >
          {{ subtitle }}
        </p>
      </header>

      <v-alert
        type="info"
        variant="tonal"
        border="start"
        class="mb-6"
      >
        {{ t("admin.common.comingSoon") }}
      </v-alert>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAdminModulePage } from "~/composables/useAdminModulePage";

const { t, title, subtitle } = useAdminModulePage("admin.ecommerceManagement");
const pageDescription = computed(() => subtitle.value);

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
  showRightWidgets: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
</script>
