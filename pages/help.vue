<template>
  <main
    aria-labelledby="help-heading"
  >
    <header
        class="mb-6"
        aria-describedby="help-subtitle"
    >
      <section
        class="help-hero mb-10"
        aria-describedby="help-subtitle"
      >
        <v-sheet
          class="help-hero__surface"
          elevation="0"
          rounded="xl"
        >
          <div class="help-hero__header">
            <div class="help-hero__badge">
              <v-icon
                icon="mdi:lifebuoy"
                size="22"
                class="mr-2"
                aria-hidden="true"
              />
              <span class="text-caption font-weight-medium text-uppercase tracking-wide">
                {{ t("pages.help.quickLinksTitle") }}
              </span>
            </div>
            <h1
              id="help-heading"
              class="text-h3 font-weight-bold mb-3"
            >
              {{ helpTitle }}
            </h1>
            <p
              id="help-subtitle"
              class="text-body-1 text-medium-emphasis"
            >
              {{ helpSubtitle }}
            </p>
          </div>

          <div class="help-hero__search">
            <v-text-field
              v-model="query"
              :label="t('pages.help.searchPlaceholder')"
              prepend-inner-icon="mdi:magnify"
              variant="outlined"
              density="comfortable"
              clearable
              data-test="faq-search"
              aria-describedby="help-faq"
            />
            <v-chip
              class="help-hero__count"
              color="primary"
              variant="tonal"
              size="small"
            >
              {{ filteredFaq.length }}
              {{
                filteredFaq.length === 1
                  ? t("pages.help.faqCountSingular")
                  : t("pages.help.faqCountPlural")
              }}
            </v-chip>
          </div>
        </v-sheet>
      </section>

      <section
        class="mb-10"
        aria-labelledby="quick-actions"
      >
        <v-sheet
          class="help-actions"
          elevation="0"
          rounded="xl"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
            <div>
              <h2
                id="quick-actions"
                class="text-h5 font-weight-semibold mb-1"
              >
                {{ t("pages.help.quickLinksTitle") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ helpBody }}
              </p>
            </div>
          </div>
          <v-row
            class="help-actions__row"
            dense
          >
            <v-col
              v-for="action in actions"
              :key="action.label"
              cols="12"
              md="4"
            >
              <v-card
                class="help-actions__card"
                elevation="0"
                rounded="lg"
              >
                <div class="d-flex align-start mb-4">
                  <v-avatar
                    class="help-actions__icon mr-3"
                    size="42"
                  >
                    <v-icon
                      :icon="action.icon"
                      aria-hidden="true"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                      {{ action.label }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ action.description }}
                    </p>
                  </div>
                </div>
                <v-btn
                  :href="action.href"
                  :to="action.to"
                  :target="action.target"
                  :rel="action.rel"
                  color="primary"
                  variant="text"
                  class="justify-start px-0"
                  :aria-label="action.ariaLabel"
                >
                  {{ action.cta }}
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </section>

      <section aria-labelledby="help-faq">
        <v-sheet
          class="help-faq"
          elevation="0"
          rounded="xl"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
            <h2
              id="help-faq"
              class="text-h5 font-weight-semibold mb-0"
            >
              {{ t("pages.help.faqTitle") }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              {{ filteredFaq.length }}
              {{
                filteredFaq.length === 1
                  ? t("pages.help.faqCountSingular")
                  : t("pages.help.faqCountPlural")
              }}
            </span>
          </div>

          <v-expansion-panels
            class="help-faq__panels"
            multiple
            variant="accordion"
            data-test="faq-panels"
          >
            <template v-if="filteredFaq.length">
              <v-expansion-panel
                v-for="item in filteredFaq"
                :key="item.question"
              >
                <v-expansion-panel-title>
                  <span class="font-weight-medium">{{ item.question }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    {{ item.answer }}
                  </p>
                  <ul
                    v-if="item.links?.length"
                    class="pl-4"
                  >
                    <li
                      v-for="link in item.links"
                      :key="link.href"
                      class="text-body-2"
                    >
                      <a
                        :href="link.href"
                        :target="link.target"
                        :rel="link.rel"
                        class="text-primary"
                      >
                        {{ link.label }}
                      </a>
                    </li>
                  </ul>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </template>
            <v-expansion-panel
              v-else
              disabled
            >
              <v-expansion-panel-title>
                {{ t("pages.help.faqEmpty") }}
              </v-expansion-panel-title>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-sheet>
      </section>
    </header>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const localePath = useResolvedLocalePath();
const siteSettings = useSiteSettingsState();
const { registerRightSidebarContent } = useLayoutRightSidebar();

const SidebarHelpCenterCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarHelpCenterCard.vue"),
  suspensible: false,
});

const pageDescription = computed(() => t("seo.help.description"));

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
  rightSidebarPreset: "none",
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
registerRightSidebarContent({
  component: SidebarHelpCenterCard,
  wrapperClass: "flex flex-col gap-6",
});
const helpContent = computed(
  () => siteSettings.value?.pages.help ?? getDefaultSiteSettings().pages.help,
);
const helpTitle = computed(() => helpContent.value.title?.trim() || t("pages.help.title"));
const helpSubtitle = computed(() => helpContent.value.subtitle?.trim() || t("pages.help.subtitle"));
const helpBody = computed(() => helpContent.value.body?.trim() || t("pages.help.subtitle"));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.help.title");
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

const query = ref("");

const actions = computed(() => [
  {
    label: t("pages.help.actions.reportBug"),
    description: t("pages.help.actions.reportBugDescription"),
    cta: t("pages.help.actions.reportBugCta"),
    href: "https://github.com/bro-world/bro-world-frontend-ui/issues/new/choose",
    icon: "mdi:bug-outline",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.help.actions.reportBugAria"),
  },
  {
    label: t("pages.help.actions.accountPrivacy"),
    description: t("pages.help.actions.accountPrivacyDescription"),
    cta: t("pages.help.actions.accountPrivacyCta"),
    to: localePath("/forgot-password"),
    icon: "mdi:shield-account-outline",
    ariaLabel: t("pages.help.actions.accountPrivacyAria"),
  },
  {
    label: t("pages.help.actions.contactSupport"),
    description: t("pages.help.actions.contactSupportDescription"),
    cta: t("pages.help.actions.contactSupportCta"),
    to: localePath("/contact"),
    icon: "mdi:lifebuoy",
    ariaLabel: t("pages.help.actions.contactSupportAria"),
  },
]);

const faqItems = computed(() => [
  {
    question: t("pages.help.faq.items.gettingStarted.question"),
    answer: t("pages.help.faq.items.gettingStarted.answer"),
    links: [
      {
        label: t("pages.help.faq.items.gettingStarted.link"),
        href: "https://bro-world-space.com/docs/getting-started/introduction",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
  {
    question: t("pages.help.faq.items.localization.question"),
    answer: t("pages.help.faq.items.localization.answer"),
  },
  {
    question: t("pages.help.faq.items.components.question"),
    answer: t("pages.help.faq.items.components.answer"),
    links: [
      {
        label: t("pages.help.faq.items.components.link"),
        href: "https://github.com/bro-world/bro-world-frontend-ui/tree/main/components",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
  {
    question: t("pages.help.faq.items.contributing.question"),
    answer: t("pages.help.faq.items.contributing.answer"),
    links: [
      {
        label: t("pages.help.faq.items.contributing.link"),
        href: "https://github.com/bro-world/bro-world-frontend-ui/blob/main/CONTRIBUTING.md",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
  {
    question: t("pages.help.faq.items.privacy.question"),
    answer: t("pages.help.faq.items.privacy.answer"),
  },
]);

const filteredFaq = computed(() => {
  if (!query.value.trim()) return faqItems.value;

  const search = query.value.toLowerCase();

  return faqItems.value.filter((item) => {
    const haystack = `${item.question} ${item.answer}`.toLowerCase();
    return haystack.includes(search);
  });
});
</script>

<style scoped src="~/assets/styles/pages/help.scss" lang="scss"></style>
