<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="flex flex-col gap-5">
      <header class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
          {{ t("pages.contact.title") }}
        </p>
        <h2 class="text-xl font-semibold text-foreground">
          {{ t("pages.contact.details.title") }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ contactBody }}
        </p>
      </header>

      <ul class="flex flex-col gap-4">
        <li
          v-for="channel in supportChannels"
          :key="channel.title"
          class="flex flex-col gap-2"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <v-icon
                :icon="channel.icon"
                size="20"
                aria-hidden="true"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ channel.title }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ channel.description }}
              </p>
            </div>
          </div>
          <div
            v-if="channel.to"
            class="justify-center px-0 mx-auto"
          >
            <NuxtLink
              :to="channel.to"
              class="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:underline"
              :aria-label="channel.ctaLabel"
            >
              {{ channel.cta }}
              <v-icon
                icon="mdi:arrow-top-right"
                size="16"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>
          <div
            v-else-if="channel.href"
            class="justify-center px-0 mx-auto"
          >
            <a
              :href="channel.href"
              :target="channel.target"
              :rel="channel.rel"
              class="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:underline"
              :aria-label="channel.ctaLabel"
            >
              {{ channel.cta }}
              <v-icon
                :icon="channel.target === '_blank' ? 'mdi:open-in-new' : 'mdi:arrow-top-right'"
                size="16"
                aria-hidden="true"
              />
            </a>
          </div>
        </li>
      </ul>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

const { t } = useI18n();
const localePath = useResolvedLocalePath();
const siteSettings = useSiteSettingsState();

const contactContent = computed(
  () => siteSettings.value?.pages.contact ?? getDefaultSiteSettings().pages.contact,
);

const contactBody = computed(
  () => contactContent.value.body?.trim() || t("pages.contact.details.description"),
);

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
</script>
