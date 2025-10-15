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

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const allowedSections = ["data", "crons"] as const;

type EducationManagementSection = (typeof allowedSections)[number];

const section = computed<EducationManagementSection>(() => {
  const params = currentRoute.value?.params ?? {};
  const value = (params as Record<string, unknown>).section;
  if (typeof value === "string" && allowedSections.includes(value as EducationManagementSection)) {
    return value as EducationManagementSection;
  }

  return "data";
});

const pageKey = computed(() => `admin.educationManagement.sections.${section.value}`);

const { t, title, subtitle } = useAdminModulePage(pageKey);
const pageDescription = computed(() => subtitle.value);

definePageMeta(() => ({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  description: pageDescription.value,
}));

const headingId = computed(() => `admin-education-management-${section.value}-title`);
</script>
