<template>
  <v-card class="d-flex flex-column h-100" elevation="2" rounded="xl">
    <v-img
      :src="category.cover"
      :alt="category.title"
      height="180"
      cover
      class="rounded-t-xl"
    />
    <v-card-item>
      <v-card-title class="text-h6">
        {{ category.title }}
      </v-card-title>
      <v-card-subtitle class="text-medium-emphasis">
        {{ category.description }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-text class="pt-0">
      <div class="d-flex align-center justify-space-between">
        <v-chip size="small" color="primary" variant="tonal">
          {{ t("education.category.courses", { count: category.courseCount }) }}
        </v-chip>
        <v-btn
          :to="{ name: 'education-category-slug', params: { slug: category.slug } }"
          color="primary"
          variant="text"
          :aria-label="t('education.category.viewCoursesAria', { title: category.title })"
        >
          {{ t("education.category.viewCourses") }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { CategorySummary } from "~/types/education";

import { computed } from "vue";

const props = defineProps<{ category: CategorySummary }>();
const category = computed(() => props.category);

const { t } = useI18n();
</script>
