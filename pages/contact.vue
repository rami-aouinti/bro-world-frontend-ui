<template>
  <main aria-labelledby="contact-heading">
    <header
      class="mb-6"
      aria-describedby="contact-subtitle"
    >
      <v-row
        class="align-stretch contact-layout"
        dense
      >
        <v-col cols="12">
          <v-sheet
            class="contact-panel contact-panel--primary"
            elevation="0"
            rounded="xl"
          >
            <article
              aria-describedby="contact-intro"
            >
              <div class="contact-badge">
                <v-icon
                  icon="mdi:message-processing-outline"
                  size="22"
                  class="mr-2"
                  aria-hidden="true"
                />
                <span class="text-caption font-weight-medium text-uppercase tracking-wide">
                  {{ t("pages.contact.details.title") }}
                </span>
              </div>
            </article>

            <div class="contact-form-wrapper">
              <ContactForm :show-heading="false" />
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </header>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import ContactSupportSidebar from "~/components/contact/ContactSupportSidebar.vue";

const ContactForm = defineAsyncComponent({
  loader: () => import("~/components/forms/ContactForm.vue"),
  suspensible: false,
});

const CONTACT_SUPPORT_SIDEBAR_INTRINSIC_HEIGHT = 1312;

const { t, locale, localeProperties } = useI18n();
const pageDescription = computed(() => t("seo.contact.description"));

definePageMeta({
  documentDriven: false,
  showContactSidebarCard: true,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const localePath = useResolvedLocalePath();
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
const supportSectionTitle = computed(() => t("pages.contact.details.title"));
const availabilityTitle = computed(() => t("pages.contact.availability.title"));
const availabilityBody = computed(() => t("pages.contact.availability.body"));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.contact.title");
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

const supportChannels = computed(() => [
  {
    icon: "mdi:email-edit-outline",
    title: t("pages.contact.details.email"),
    description: t("pages.contact.details.emailDescription"),
    href: "mailto:support@broworld.com",
    cta: t("pages.contact.details.emailCta"),
    ctaLabel: t("pages.contact.details.emailCtaLabel"),
  },
  {
    icon: "mdi:account-group-outline",
    title: t("pages.contact.details.community"),
    description: t("pages.contact.details.communityDescription"),
    href: "https://github.com/bro-world/bro-world-frontend-ui/discussions",
    target: "_blank",
    rel: "noopener noreferrer",
    cta: t("pages.contact.details.communityCta"),
    ctaLabel: t("pages.contact.details.communityCtaLabel"),
  },
  {
    icon: "mdi:book-open-page-variant-outline",
    title: t("pages.contact.details.docs"),
    description: t("pages.contact.details.docsDescription"),
    to: localePath("/getting-started/introduction"),
    cta: t("pages.contact.details.docsCta"),
    ctaLabel: t("pages.contact.details.docsCtaLabel"),
  },
]);

const { registerRightSidebarContent } = useLayoutRightSidebar();

registerRightSidebarContent(
  computed(() => ({
    component: ContactSupportSidebar,
    props: {
      supportTitle: supportSectionTitle.value,
      supportBody: contactSupportBody.value,
      supportChannels: supportChannels.value,
      availabilityTitle: availabilityTitle.value,
      availabilityBody: availabilityBody.value,
    },
    wrapperClass: "flex flex-col gap-6",
    intrinsicHeight: CONTACT_SUPPORT_SIDEBAR_INTRINSIC_HEIGHT,
  })),
);
</script>

<style scoped src="~/assets/styles/pages/contact.scss" lang="scss"></style>
