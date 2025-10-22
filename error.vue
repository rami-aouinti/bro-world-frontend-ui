<template>
  <NuxtLayout name="default">
    <template #right-sidebar="{ weather, rating }">
      <div
        v-if="weather || rating"
        class="error-page__sidebar"
        role="complementary"
        :aria-label="sidebarLabel"
      >
        <SidebarWeatherCard
          v-if="weather"
          :weather="weather"
        />
        <SidebarRatingCard
          v-if="rating"
          :rating="{
            title: rating.title,
            subtitle: rating.subtitle,
            icon: rating.icon,
          }"
        />
      </div>
    </template>

    <main
      class="error-page"
      aria-labelledby="error-heading"
    >
      <SidebarCard
        class="error-page__card px-3 py-3"
        particles
        glow
      >
        <p
          v-if="badgeLabel"
          class="error-page__badge"
        >
          {{ badgeLabel }}
        </p>

        <p
          class="error-page__status"
          aria-hidden="true"
        >
          {{ statusCode }}
        </p>
        <p class="sr-only">
          {{ statusAnnounce }}
        </p>

        <h1
          id="error-heading"
          class="error-page__title"
        >
          {{ title }}
        </h1>

        <p class="error-page__subtitle">
          {{ subtitle }}
        </p>

        <p
          v-if="description"
          class="error-page__description"
        >
          {{ description }}
        </p>

        <div class="error-page__actions">
          <v-btn
            color="primary"
            size="large"
            class="error-page__action"
            @click="handleGoHome"
          >
            {{ homeLabel }}
          </v-btn>
          <v-btn
            variant="text"
            color="primary"
            size="large"
            class="error-page__action"
            @click="handleGoHelp"
          >
            {{ helpLabel }}
          </v-btn>
        </div>
      </SidebarCard>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useHead } from "#imports";
import { clearError, type NuxtError } from "#app";
import { useLocalePath } from "#i18n";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import SidebarWeatherCard from "~/components/layout/SidebarWeatherCard.vue";
import SidebarRatingCard from "~/components/layout/SidebarRatingCard.vue";

const props = defineProps<{
  error?: NuxtError | null;
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const statusCode = computed(() => Number(props.error?.statusCode ?? 500));
const statusMessage = computed(() => props.error?.statusMessage ?? "");
const is404 = computed(() => statusCode.value === 404);

const badgeLabel = computed(() => t("pages.error.badge", { code: statusCode.value }));
const title = computed(() => {
  if (is404.value) {
    return t("pages.error.notFound.title");
  }

  return statusMessage.value || t("pages.error.generic.title");
});
const subtitle = computed(() =>
  is404.value ? t("pages.error.notFound.subtitle") : t("pages.error.generic.subtitle"),
);
const description = computed(() => {
  if (is404.value) {
    return t("pages.error.notFound.description");
  }

  return props.error?.message || t("pages.error.generic.description");
});
const statusAnnounce = computed(() =>
  t("pages.error.statusAnnouncement", { code: statusCode.value }),
);
const homeLabel = computed(() => t("pages.error.actions.home"));
const helpLabel = computed(() => t("pages.error.actions.help"));
const sidebarLabel = computed(() => t("pages.error.sidebarLabel"));

const homePath = computed(() => localePath({ name: "index" }));
const helpPath = computed(() => localePath({ name: "help" }));

function handleGoHome() {
  clearError({ redirect: homePath.value });
}

function handleGoHelp() {
  clearError({ redirect: helpPath.value });
}

useHead(() => ({
  title: `${statusCode.value} · ${title.value}`,
}));
</script>

<style scoped src="~/assets/styles/pages/error.scss" lang="scss"></style>
