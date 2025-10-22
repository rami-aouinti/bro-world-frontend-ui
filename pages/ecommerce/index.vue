<template>
  <main
    class="py-12"
    aria-labelledby="ecommerce-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="ecommerce-subtitle"
      >
        <h1
          id="ecommerce-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ t("pages.ecommerce.title") }}
        </h1>
        <p
          id="ecommerce-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 640px"
        >
          {{ t("pages.ecommerce.subtitle") }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="ecommerce-features-title"
      >
        <h2
          id="ecommerce-features-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.ecommerce.featuresTitle") }}
        </h2>
        <v-row dense>
          <v-col
            v-for="feature in featureCards"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100"
            >
              <div class="d-flex align-start mb-4">
                <v-avatar
                  color="primary"
                  size="48"
                  class="mr-4"
                >
                  <v-icon
                    :icon="feature.icon"
                    size="28"
                    color="white"
                    aria-hidden="true"
                  />
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
              <ul class="pl-6 text-body-2 text-medium-emphasis mb-0">
                <li
                  v-for="point in feature.points"
                  :key="point"
                  class="mb-1"
                >
                  {{ point }}
                </li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="ecommerce-workflow-title"
      >
        <h2
          id="ecommerce-workflow-title"
          class="text-h4 font-weight-semibold mb-6"
        >
          {{ t("pages.ecommerce.workflowTitle") }}
        </h2>
        <ol class="d-flex flex-column gap-4 list-none pa-0">
          <li
            v-for="(step, index) in workflowSteps"
            :key="step.title"
          >
            <v-sheet
              class="pa-6 rounded-lg d-flex align-start"
              color="surface-variant"
              variant="tonal"
            >
              <div
                class="d-flex align-center justify-center rounded-circle mr-4"
                style="width: 40px; height: 40px"
                :aria-label="t('pages.ecommerce.stepLabel', { number: index + 1 })"
              >
                <span class="text-subtitle-1 font-weight-semibold">{{ index + 1 }}</span>
              </div>
              <div>
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ step.description }}
                </p>
              </div>
            </v-sheet>
          </li>
        </ol>
      </section>

      <section aria-labelledby="ecommerce-cta-title">
        <v-card
          class="pa-8"
          color="primary"
          variant="flat"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
              <h2
                id="ecommerce-cta-title"
                class="text-h4 font-weight-semibold text-white mb-2"
              >
                {{ t("pages.ecommerce.cta.title") }}
              </h2>
              <p
                class="text-body-1 text-white text-opacity-80 mb-0"
                style="max-width: 520px"
              >
                {{ t("pages.ecommerce.cta.description") }}
              </p>
            </div>
            <v-btn
              :to="contactLink"
              color="white"
              variant="flat"
              size="large"
              class="text-primary"
              :aria-label="t('pages.ecommerce.cta.buttonAria')"
            >
              {{ t("pages.ecommerce.cta.button") }}
            </v-btn>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

const { t, locale, localeProperties } = useI18n();
const pageDescription = computed(() => t("seo.ecommerce.description"));

definePageMeta({
  alias: ["/world/:worldSlug/ecommerce"],
  documentDriven: false,
  requiresPlugin: "ecommerce",
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const runtimeConfig = useRuntimeConfig();
const localePath = useResolvedLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.ecommerce.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const featureCards = computed(() => [
  {
    icon: "mdi:storefront-outline",
    title: t("pages.ecommerce.features.catalog.title"),
    description: t("pages.ecommerce.features.catalog.description"),
    points: [
      t("pages.ecommerce.features.catalog.points.0"),
      t("pages.ecommerce.features.catalog.points.1"),
      t("pages.ecommerce.features.catalog.points.2"),
    ],
  },
  {
    icon: "mdi:credit-card-check-outline",
    title: t("pages.ecommerce.features.checkout.title"),
    description: t("pages.ecommerce.features.checkout.description"),
    points: [
      t("pages.ecommerce.features.checkout.points.0"),
      t("pages.ecommerce.features.checkout.points.1"),
      t("pages.ecommerce.features.checkout.points.2"),
    ],
  },
  {
    icon: "mdi:bullhorn-outline",
    title: t("pages.ecommerce.features.marketing.title"),
    description: t("pages.ecommerce.features.marketing.description"),
    points: [
      t("pages.ecommerce.features.marketing.points.0"),
      t("pages.ecommerce.features.marketing.points.1"),
      t("pages.ecommerce.features.marketing.points.2"),
    ],
  },
]);

const workflowSteps = computed(() => [
  {
    title: t("pages.ecommerce.workflow.steps.launch.title"),
    description: t("pages.ecommerce.workflow.steps.launch.description"),
  },
  {
    title: t("pages.ecommerce.workflow.steps.optimize.title"),
    description: t("pages.ecommerce.workflow.steps.optimize.description"),
  },
  {
    title: t("pages.ecommerce.workflow.steps.scale.title"),
    description: t("pages.ecommerce.workflow.steps.scale.description"),
  },
]);

const contactLink = computed(() => localePath("/contact"));
</script>
