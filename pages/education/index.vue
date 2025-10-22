<template>
  <main aria-labelledby="education-heading">
    <section class="mb-10 text-center">
      <h4 class="text-h4 mb-4">
        {{ t("pages.education.catalog.title") }}
      </h4>
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
  </main>
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
