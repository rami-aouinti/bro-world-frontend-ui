<template>
  <v-card
    class="d-flex flex-column h-100"
    elevation="2"
    rounded="xl"
  >
    <div class="rounded-t-xl overflow-hidden">
      <NuxtImg
        :src="category.cover"
        :alt="category.title"
        :width="categoryCoverWidth"
        :height="categoryCoverHeight"
        :sizes="categoryCoverSizes"
        format="webp"
        preset="lcp"
        loading="lazy"
        decoding="async"
        class="category-card__cover"
      />
    </div>
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
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ t("pages.education.category.courses", { count: category.courseCount }) }}
        </v-chip>
        <v-btn
          :to="categoryLink"
          color="primary"
          variant="text"
          :aria-label="t('pages.education.category.viewCoursesAria', { title: category.title })"
        >
          {{ t("pages.education.category.viewCourses") }}
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
const localePath = useLocalePath();

const categoryLink = computed(() =>
  localePath({ name: "education-category-slug", params: { slug: category.value.slug } }),
);

const categoryCoverWidth = 480;
const categoryCoverHeight = 300;
const categoryCoverSizes = "(max-width: 600px) 100vw, 360px";
</script>

<style scoped>
.category-card__cover {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
}
</style>
