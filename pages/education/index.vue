<template>
  <main aria-labelledby="education-heading">
    <SidebarCard
        class="text-card-foreground px-3 py-2"
        glow
    >

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
    </SidebarCard>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import EducationSidebar from "~/components/education/EducationSidebar.vue";
import CategoryCard from "~/components/education/CategoryCard.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useEducationStore } from "~/stores/education";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const { t } = useI18n();
const store = useEducationStore();
const pageDescription = computed(() => t("seo.pages.education.description"));

if (!store.categories.value.length) {
  await store.fetchCategories();
}

const categories = computed(() => store.categories.value);
const categoryCount = computed(() => categories.value.length);
const totalCourses = computed(() =>
  categories.value.reduce((total, entry) => total + (entry.courseCount ?? 0), 0),
);
const certificateCount = computed(() => store.certificates.value.length);
const localePath = useLocalePath();

const sidebarStats = computed(() => [
  {
    icon: "mdi:shape-outline",
    value: t("pages.education.sidebar.stats.categories.value", { count: categoryCount.value }),
    label: t("pages.education.sidebar.stats.categories.label"),
  },
  {
    icon: "mdi:school-outline",
    value: t("pages.education.sidebar.stats.courses.value", { count: totalCourses.value }),
    label: t("pages.education.sidebar.stats.courses.label"),
  },
  {
    icon: "mdi:certificate-outline",
    value: t("pages.education.sidebar.stats.certificates.value", { count: certificateCount.value }),
    label: t("pages.education.sidebar.stats.certificates.label"),
  },
]);

const sidebarCategories = computed(() =>
  categories.value.slice(0, 3).map((category) => ({
    id: category.id,
    title: category.title,
    meta: t("pages.education.category.courses", { count: category.courseCount }),
    to: localePath({ name: "education-category-slug", params: { slug: category.slug } }),
  })),
);

const { registerRightSidebarContent } = useLayoutRightSidebar();

registerRightSidebarContent(
  computed(() => ({
    component: EducationSidebar,
    props: {
      overviewTitle: t("pages.education.sidebar.overviewTitle"),
      overviewDescription: t("pages.education.sidebar.overviewDescription"),
      stats: sidebarStats.value,
      featuredTitle: t("pages.education.sidebar.featuredTitle"),
      featuredDescription: t("pages.education.sidebar.featuredDescription"),
      featuredEmpty: t("pages.education.sidebar.featuredEmpty"),
      categories: sidebarCategories.value,
    },
    wrapperClass: "flex flex-col gap-6",
    intrinsicHeight: 780,
  })),
);

definePageMeta({
  documentDriven: false,
  requiresPlugin: "education",
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
</script>
