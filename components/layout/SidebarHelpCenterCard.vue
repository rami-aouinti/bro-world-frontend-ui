<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="sidebar-help">
      <header class="sidebar-help__header">
        <p class="sidebar-help__badge">
          <v-icon
            icon="mdi:lifebuoy"
            size="18"
            class="mr-2"
            aria-hidden="true"
          />
          {{ t("pages.help.quickLinksTitle") }}
        </p>
        <h2 class="sidebar-help__title">{{ helpTitle }}</h2>
        <p class="sidebar-help__subtitle">{{ helpDescription }}</p>
      </header>

      <form
        class="sidebar-help__form"
        @submit.prevent="handleSubmit"
      >
        <v-text-field
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchAriaLabel"
          prepend-inner-icon="mdi:magnify"
          density="comfortable"
          variant="solo"
          color="primary"
          hide-details
          clearable
          class="sidebar-help__input"
        />
        <div class="sidebar-help__footer">
          <v-chip
            v-if="!isLoadingCount"
            class="sidebar-help__chip"
            color="primary"
            size="small"
            variant="flat"
            :aria-label="resultsText"
          >
            {{ resultsText }}
          </v-chip>
          <v-progress-circular
            v-else
            :size="18"
            color="primary"
            indeterminate
            class="sidebar-help__loader"
            aria-hidden="true"
          />

          <NuxtLink
            :to="helpLink"
            class="sidebar-help__link"
            :aria-label="t('help.breadcrumbs.help')"
          >
            {{ t("help.breadcrumbs.help") }}
            <v-icon
              icon="mdi:arrow-top-right"
              size="16"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </form>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { HelpArticleSummary } from "~/types/help";

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useResolvedLocalePath();
const siteSettings = useSiteSettingsState();

const helpContent = computed(
  () => siteSettings.value?.pages.help ?? getDefaultSiteSettings().pages.help,
);

const helpTitle = computed(() => helpContent.value.title?.trim() || t("pages.help.title"));
const helpDescription = computed(
  () =>
    helpContent.value.body?.trim() ||
    helpContent.value.subtitle?.trim() ||
    t("pages.help.subtitle"),
);

const searchPlaceholder = computed(() => t("pages.help.searchPlaceholder"));
const searchAriaLabel = computed(() => t("help.hero.searchAria"));

const query = ref("");

const helpLink = computed(() => localePath({ name: "help" }));

const { data: popularArticles, pending: isLoadingArticles } = await useAsyncData(
  "sidebar-help-articles",
  () =>
    $fetch<HelpArticleSummary[]>("/api/help/articles", {
      params: { locale: locale.value, popular: "true" },
    }),
  {
    watch: [() => locale.value],
  },
);

const resultsCount = computed(() => popularArticles.value?.length ?? 0);
const isLoadingCount = computed(() => isLoadingArticles.value);
const resultsLabel = computed(() =>
  resultsCount.value === 1 ? t("pages.help.faqCountSingular") : t("pages.help.faqCountPlural"),
);
const resultsText = computed(() => `${resultsCount.value} ${resultsLabel.value}`);

function handleSubmit() {
  const search = query.value.trim();
  const target = helpLink.value;

  if (!target) {
    return;
  }

  if (search) {
    router.push({ path: target, query: { q: search } });
    return;
  }

  router.push(target);
}
</script>

<style scoped>
.sidebar-help {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-help__header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-help__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: rgba(var(--v-theme-primary), 0.85);
}

.sidebar-help__title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.sidebar-help__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.sidebar-help__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-help__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.sidebar-help__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.sidebar-help__link:hover,
.sidebar-help__link:focus-visible {
  text-decoration: underline;
}

.sidebar-help__chip {
  font-weight: 600;
  text-transform: none;
}

.sidebar-help__loader {
  margin-left: 0.25rem;
}
</style>
