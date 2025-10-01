<template>
  <main
    class="py-10"
    :aria-labelledby="headingId"
  >
    <v-container>
      <header class="mb-8">
        <h1
          :id="headingId"
          class="text-h4 text-lg-h3 font-weight-bold mb-2"
        >
          {{ title }}
        </h1>
        <p
          :id="`${headingId}-subtitle`"
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

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
});

const route = useRoute();

const allowedSections = ["data", "crons"] as const;

type BlogSection = (typeof allowedSections)[number];

const section = computed<BlogSection>(() => {
  const value = route.params.section;
  if (typeof value === "string" && allowedSections.includes(value as BlogSection)) {
    return value as BlogSection;
  }

  return "data";
});

const pageKey = computed(() => `admin.blog.sections.${section.value}`);

const { t, title, subtitle } = useAdminModulePage(pageKey);

const headingId = computed(() => `admin-blog-${section.value}-title`);
</script>
