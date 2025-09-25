<template>
  <main class="py-12" aria-labelledby="help-heading">
    <v-container>
      <section class="mb-8" aria-describedby="help-subtitle">
        <h1 id="help-heading" class="text-h3 font-weight-bold mb-3">
          {{ t('pages.help.title') }}
        </h1>
        <p id="help-subtitle" class="text-body-1 text-medium-emphasis mb-6">
          {{ t('pages.help.subtitle') }}
        </p>
        <v-text-field
          v-model="query"
          :label="t('pages.help.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          data-test="faq-search"
          aria-describedby="help-faq"
        />
      </section>

      <section class="mb-10" aria-labelledby="quick-actions">
        <h2 id="quick-actions" class="text-h5 font-weight-semibold mb-4">
          {{ t('pages.help.quickLinksTitle') }}
        </h2>
        <v-row dense>
          <v-col v-for="action in actions" :key="action.label" cols="12" md="4">
            <v-card class="pa-5 h-100" elevation="4" rounded="lg">
              <div class="d-flex align-start mb-4">
                <v-avatar color="primary" size="40" class="mr-3">
                  <v-icon :icon="action.icon" aria-hidden="true" />
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
      </section>

      <section aria-labelledby="help-faq">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 id="help-faq" class="text-h5 font-weight-semibold mb-0">
            {{ t('pages.help.faqTitle') }}
          </h2>
          <span class="text-caption text-medium-emphasis">
            {{ filteredFaq.length }}
            {{ filteredFaq.length === 1 ? t('pages.help.faqCountSingular') : t('pages.help.faqCountPlural') }}
          </span>
        </div>

        <v-expansion-panels multiple variant="accordion" data-test="faq-panels">
          <template v-if="filteredFaq.length">
            <v-expansion-panel v-for="item in filteredFaq" :key="item.question">
              <v-expansion-panel-title>
                <span class="font-weight-medium">{{ item.question }}</span>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ item.answer }}
                </p>
                <ul v-if="item.links?.length" class="pl-4">
                  <li v-for="link in item.links" :key="link.href" class="text-body-2">
                    <a :href="link.href" :target="link.target" :rel="link.rel" class="text-primary">
                      {{ link.label }}
                    </a>
                  </li>
                </ul>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
          <v-expansion-panel v-else disabled>
            <v-expansion-panel-title>
              {{ t('pages.help.faqEmpty') }}
            </v-expansion-panel-title>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { t, locale, localeProperties } = useI18n()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const localePath = useLocalePath()

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? 'https://bro-world-space.com')

useHead(() => {
  const title = t('seo.help.title')
  const description = t('seo.help.description')
  const canonical = new URL(route.path, baseUrl.value).toString()
  const iso = localeProperties.value?.iso ?? locale.value

  return {
    title,
    meta: [
      { key: 'description', name: 'description', content: description },
      { key: 'og:title', property: 'og:title', content: title },
      { key: 'og:description', property: 'og:description', content: description },
      { key: 'og:type', property: 'og:type', content: 'website' },
      { key: 'og:url', property: 'og:url', content: canonical },
      { key: 'og:locale', property: 'og:locale', content: iso },
      { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { key: 'twitter:title', name: 'twitter:title', content: title },
      { key: 'twitter:description', name: 'twitter:description', content: description },
      { key: 'twitter:url', name: 'twitter:url', content: canonical },
    ],
    link: [{ rel: 'canonical', href: canonical }],
  }
})

const query = ref('')

const actions = computed(() => [
  {
    label: t('pages.help.actions.reportBug'),
    description: t('pages.help.actions.reportBugDescription'),
    cta: t('pages.help.actions.reportBugCta'),
    href: 'https://github.com/bro-world/bro-world-frontend-ui/issues/new/choose',
    icon: 'mdi-bug-outline',
    target: '_blank',
    rel: 'noopener noreferrer',
    ariaLabel: t('pages.help.actions.reportBugAria'),
  },
  {
    label: t('pages.help.actions.accountPrivacy'),
    description: t('pages.help.actions.accountPrivacyDescription'),
    cta: t('pages.help.actions.accountPrivacyCta'),
    to: localePath('/forgot-password'),
    icon: 'mdi-shield-account-outline',
    ariaLabel: t('pages.help.actions.accountPrivacyAria'),
  },
  {
    label: t('pages.help.actions.contactSupport'),
    description: t('pages.help.actions.contactSupportDescription'),
    cta: t('pages.help.actions.contactSupportCta'),
    to: localePath('/contact'),
    icon: 'mdi-lifebuoy',
    ariaLabel: t('pages.help.actions.contactSupportAria'),
  },
])

const faqItems = computed(() => [
  {
    question: t('pages.help.faq.items.gettingStarted.question'),
    answer: t('pages.help.faq.items.gettingStarted.answer'),
    links: [
      {
        label: t('pages.help.faq.items.gettingStarted.link'),
        href: 'https://bro-world-space.com/docs/getting-started/introduction',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
  {
    question: t('pages.help.faq.items.localization.question'),
    answer: t('pages.help.faq.items.localization.answer'),
  },
  {
    question: t('pages.help.faq.items.components.question'),
    answer: t('pages.help.faq.items.components.answer'),
    links: [
      {
        label: t('pages.help.faq.items.components.link'),
        href: 'https://github.com/bro-world/bro-world-frontend-ui/tree/main/components',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
  {
    question: t('pages.help.faq.items.contributing.question'),
    answer: t('pages.help.faq.items.contributing.answer'),
    links: [
      {
        label: t('pages.help.faq.items.contributing.link'),
        href: 'https://github.com/bro-world/bro-world-frontend-ui/blob/main/CONTRIBUTING.md',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
  {
    question: t('pages.help.faq.items.privacy.question'),
    answer: t('pages.help.faq.items.privacy.answer'),
  },
])

const filteredFaq = computed(() => {
  if (!query.value.trim()) return faqItems.value

  const search = query.value.toLowerCase()

  return faqItems.value.filter((item) => {
    const haystack = `${item.question} ${item.answer}`.toLowerCase()
    return haystack.includes(search)
  })
})
</script>

<style scoped>
main {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-surface-variant), 0.2) 100%
  );
}

.v-card.h-100 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
