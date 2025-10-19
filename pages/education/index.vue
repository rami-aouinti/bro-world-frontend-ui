<template>
  <v-container class="py-12">
    <section class="mb-10 text-center">
      <v-chip
        color="primary"
        variant="tonal"
        class="mb-4"
      >
        {{ t("pages.education.catalog.badge") }}
      </v-chip>
      <h1 class="text-h3 text-md-h2 mb-4">
        {{ t("pages.education.catalog.title") }}
      </h1>
      <p
        class="text-body-1 text-medium-emphasis mx-auto"
        style="max-width: 640px"
      >
        {{ t("pages.education.catalog.subtitle") }}
      </p>
    </section>

    <v-row dense>
      <v-col
        v-for="category in categories"
        :key="category.id"
        cols="12"
        md="6"
        lg="4"
      >
        <CategoryCard :category="category" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import CategoryCard from "~/components/education/CategoryCard.vue";
import { useEducationStore } from "~/stores/education";

const { t, locale, localeProperties } = useI18n();
const store = useEducationStore();
const pageDescription = computed(() => t("seo.pages.education.description"));

if (!store.categories.value.length) {
  await store.fetchCategories();
}

const categories = computed(() => store.categories.value);

definePageMeta({
  documentDriven: false,
  requiresPlugin: "education",
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
</script>
