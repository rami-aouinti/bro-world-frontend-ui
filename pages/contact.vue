<template>
  <main
    class="py-12"
    aria-labelledby="contact-heading"
  >
    <v-container>
      <v-row
        class="align-stretch"
        dense
      >
        <v-col
          cols="12"
          md="6"
        >
          <article
            class="mb-8"
            aria-describedby="contact-intro"
          >
            <h1
              id="contact-heading"
              class="text-h3 font-weight-bold mb-3"
            >
              {{ t("pages.contact.title") }}
            </h1>
            <p
              id="contact-intro"
              class="text-body-1 text-medium-emphasis mb-6"
            >
              {{ t("pages.contact.subtitle") }}
            </p>
          </article>

          <ContactForm />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <aside aria-labelledby="contact-support">
            <section class="mb-8">
              <h2
                id="contact-support"
                class="text-h5 font-weight-semibold mb-2"
              >
                {{ t("pages.contact.details.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis">
                {{ t("pages.contact.details.description") }}
              </p>

              <div class="d-flex flex-column gap-4 mt-5">
                <v-card
                  v-for="channel in supportChannels"
                  :key="channel.title"
                  variant="tonal"
                  class="pa-4"
                >
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      :icon="channel.icon"
                      size="28"
                      class="mr-3"
                      aria-hidden="true"
                    />
                    <h3 class="text-subtitle-1 font-weight-medium mb-0">
                      {{ channel.title }}
                    </h3>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ channel.description }}
                  </p>
                  <v-btn
                    v-if="channel.href || channel.to"
                    :href="channel.href"
                    :to="channel.to"
                    :target="channel.target"
                    :rel="channel.rel"
                    color="primary"
                    variant="text"
                    class="justify-start px-0"
                    :aria-label="channel.ctaLabel"
                  >
                    {{ channel.cta }}
                  </v-btn>
                </v-card>
              </div>
            </section>

            <section
              class="pa-6 rounded-lg"
              :class="availabilityClass"
              aria-labelledby="availability-title"
            >
              <h2
                id="availability-title"
                class="text-h6 font-weight-semibold mb-2"
              >
                {{ t("pages.contact.availability.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.contact.availability.body") }}
              </p>
            </section>
          </aside>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

import ContactForm from "~/components/contact/ContactForm.vue";

const { t, locale, localeProperties } = useI18n();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const localePath = useLocalePath();

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.contact.title");
  const description = t("seo.contact.description");
  const canonical = new URL(route.path, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "description", name: "description", content: description },
      { key: "og:title", property: "og:title", content: title },
      { key: "og:description", property: "og:description", content: description },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:description", name: "twitter:description", content: description },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
    link: [{ rel: "canonical", href: canonical }],
  };
});

const supportChannels = computed(() => [
  {
    icon: "mdi-email-edit-outline",
    title: t("pages.contact.details.email"),
    description: t("pages.contact.details.emailDescription"),
    href: "mailto:support@broworld.com",
    cta: t("pages.contact.details.emailCta"),
    ctaLabel: t("pages.contact.details.emailCtaLabel"),
  },
  {
    icon: "mdi-account-group-outline",
    title: t("pages.contact.details.community"),
    description: t("pages.contact.details.communityDescription"),
    href: "https://github.com/bro-world/bro-world-frontend-ui/discussions",
    target: "_blank",
    rel: "noopener noreferrer",
    cta: t("pages.contact.details.communityCta"),
    ctaLabel: t("pages.contact.details.communityCtaLabel"),
  },
  {
    icon: "mdi-book-open-page-variant-outline",
    title: t("pages.contact.details.docs"),
    description: t("pages.contact.details.docsDescription"),
    to: localePath("/getting-started/introduction"),
    cta: t("pages.contact.details.docsCta"),
    ctaLabel: t("pages.contact.details.docsCtaLabel"),
  },
]);

const availabilityClass = computed(() => ["bg-surface-container-low", "elevation-1"]);
</script>

<style scoped>
main {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-surface-variant), 0.25) 100%
  );
}

.bg-surface-container-low {
  background-color: rgba(var(--v-theme-surface-container-low), 0.8);
}

@media (max-width: 960px) {
  aside {
    margin-top: 32px;
  }
}
</style>
