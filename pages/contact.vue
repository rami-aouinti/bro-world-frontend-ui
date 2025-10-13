<template>
  <main
    class="contact-page py-12"
    aria-labelledby="contact-heading"
  >
    <v-container class="contact-container">
      <v-row
        class="align-stretch contact-layout"
        dense
      >
        <v-col
          cols="12"
          md="6"
        >
          <v-sheet
            class="contact-panel contact-panel--primary"
            elevation="0"
            rounded="xl"
          >
            <article
              class="mb-8"
              aria-describedby="contact-intro"
            >
              <div class="contact-badge">
                <v-icon
                  icon="mdi-message-processing-outline"
                  size="22"
                  class="mr-2"
                  aria-hidden="true"
                />
                <span class="text-caption font-weight-medium text-uppercase tracking-wide">
                  {{ t("pages.contact.details.title") }}
                </span>
              </div>
              <h1
                id="contact-heading"
                class="text-h3 font-weight-bold mb-3"
              >
                {{ contactTitle }}
              </h1>
              <p
                id="contact-intro"
                class="text-body-1 text-medium-emphasis"
              >
                {{ contactSubtitle }}
              </p>
            </article>

            <div class="contact-form-wrapper">
              <ContactForm :show-heading="false" />
            </div>
          </v-sheet>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <aside aria-labelledby="contact-support">
            <v-sheet
              class="contact-panel contact-panel--secondary mb-6"
              elevation="0"
              rounded="xl"
            >
              <section>
                <h2
                  id="contact-support"
                  class="text-h5 font-weight-semibold mb-2"
                >
                  {{ t("pages.contact.details.title") }}
                </h2>
                <p class="text-body-2 text-medium-emphasis">
                  {{ contactSupportBody }}
                </p>

                <div class="d-flex flex-column gap-4 mt-6">
                  <v-card
                    v-for="channel in supportChannels"
                    :key="channel.title"
                    class="contact-channel"
                    elevation="0"
                    rounded="lg"
                  >
                    <div class="d-flex align-center mb-3">
                      <v-avatar
                        size="40"
                        class="mr-3 contact-channel__icon"
                      >
                        <v-icon
                          :icon="channel.icon"
                          size="24"
                          aria-hidden="true"
                        />
                      </v-avatar>
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
            </v-sheet>

            <v-sheet
              class="contact-availability"
              elevation="0"
              rounded="xl"
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
            </v-sheet>
          </aside>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

const ContactForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ContactForm.vue"),
  suspensible: false,
});

definePageMeta({
  documentDriven: false,
});
const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const localePath = useLocalePath();
const siteSettings = useSiteSettingsState();

const contactContent = computed(
  () => siteSettings.value?.pages.contact ?? getDefaultSiteSettings().pages.contact,
);
const contactTitle = computed(() => contactContent.value.title?.trim() || t("pages.contact.title"));
const contactSubtitle = computed(
  () => contactContent.value.subtitle?.trim() || t("pages.contact.subtitle"),
);
const contactSupportBody = computed(
  () => contactContent.value.body?.trim() || t("pages.contact.details.description"),
);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.contact.title");
  const description = t("seo.contact.description");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
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
</script>

<style scoped src="~/assets/styles/pages/contact.scss" lang="scss"></style>
