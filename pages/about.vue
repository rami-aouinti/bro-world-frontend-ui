<template>
  <main aria-labelledby="about-heading">
    <header
      class="mb-6"
      aria-describedby="about-subtitle"
    >
      <section
        class="mb-12"
        aria-describedby="about-subtitle"
      >
        <v-sheet
          class="about-hero"
          elevation="0"
          rounded="xl"
        >
          <div class="about-hero__badge">
            <v-icon
              icon="mdi:rocket-launch-outline"
              size="22"
              class="mr-2"
              aria-hidden="true"
            />
            <span class="text-caption font-weight-medium text-uppercase tracking-wide">
              {{ t("pages.about.missionTitle") }}
            </span>
          </div>
          <h1
            id="about-heading"
            class="text-h3 font-weight-bold mb-3"
          >
            {{ aboutTitle }}
          </h1>
          <p
            id="about-subtitle"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            {{ aboutSubtitle }}
          </p>
          <div class="about-hero__actions">
            <v-btn
              v-for="action in heroActions"
              :key="action.label"
              :to="action.to"
              :color="action.color"
              :variant="action.variant"
              :size="action.size"
              class="about-hero__btn"
              :aria-label="action.ariaLabel"
            >
              <v-icon
                v-if="action.icon"
                :icon="action.icon"
                class="mr-2"
                aria-hidden="true"
              />
              {{ action.label }}
            </v-btn>
          </div>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="values-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <v-row
            class="align-stretch"
            dense
          >
            <v-col
              cols="12"
            >
              <div class="about-section__heading">
                <h2
                  id="values-title"
                  class="text-h4 font-weight-semibold mb-3"
                >
                  {{ t("pages.about.valuesTitle") }}
                </h2>
                <p class="text-body-1 text-medium-emphasis mb-6">
                  {{ t("pages.about.valuesSubtitle") }}
                </p>
              </div>
              <v-row
                class="about-values-grid"
                dense
              >
                <v-col
                  v-for="feature in valuesFeatures"
                  :key="feature.title"
                  cols="12"
                  sm="6"
                >
                  <v-card
                    class="about-value-card"
                    elevation="0"
                    rounded="lg"
                  >
                    <v-avatar
                      class="about-value-card__icon mb-4"
                      size="48"
                    >
                      <v-icon
                        :icon="feature.icon"
                        size="26"
                        aria-hidden="true"
                      />
                    </v-avatar>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-2">
                      {{ feature.title }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ feature.body }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="metrics-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <div class="about-section__heading mb-6">
            <h2
              id="metrics-title"
              class="text-h4 font-weight-semibold mb-3"
            >
              {{ t("pages.about.metricsTitle") }}
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t("pages.about.metricsSubtitle") }}
            </p>
          </div>
          <v-row dense>
            <v-col
              v-for="metric in metrics"
              :key="metric.label"
              cols="12"
              sm="12"
              lg="6"
            >
              <v-card
                class="about-metric-card"
                elevation="0"
                rounded="lg"
              >
                <p class="about-metric-card__value mb-1">
                  {{ metric.value }}
                </p>
                <p class="about-metric-card__label mb-2">
                  {{ metric.label }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ metric.caption }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="team-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <h2
            id="team-title"
            class="text-h4 font-weight-semibold mb-6"
          >
            {{ t("pages.about.teamTitle") }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ t("pages.about.teamBody") }}
          </p>
          <v-row dense>
            <v-col
              v-for="member in teamMembers"
              :key="member.name"
              cols="12"
              sm="12"
              lg="6"
            >
              <v-card
                class="about-team-card"
                elevation="0"
                rounded="lg"
              >
                <div class="d-flex align-center mb-4">
                  <v-avatar
                    class="about-team-card__avatar mr-4"
                    size="56"
                  >
                    <span class="text-h6">{{ member.initials }}</span>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                      {{ member.name }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ member.role }}
                    </p>
                  </div>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ member.bio }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="tech-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <h2
            id="tech-title"
            class="text-h4 font-weight-semibold mb-4"
          >
            {{ t("pages.about.techTitle") }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ t("pages.about.techBody") }}
          </p>
          <div class="d-flex flex-wrap gap-3">
            <v-chip
              v-for="tech in techStack"
              :key="tech.label"
              class="about-chip about-chip--outlined"
              color="primary"
              variant="outlined"
            >
              {{ tech.label }} — {{ tech.description }}
            </v-chip>
          </div>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="timeline-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <h2
            id="timeline-title"
            class="text-h4 font-weight-semibold mb-4"
          >
            {{ t("pages.about.timelineTitle") }}
          </h2>
          <v-timeline
            class="about-timeline"
            side="end"
            density="compact"
          >
            <v-timeline-item
              v-for="item in timeline"
              :key="item.year"
              :dot-color="item.color"
              size="small"
            >
              <template #opposite>
                <span class="font-weight-medium">{{ item.year }}</span>
              </template>
              <v-card
                class="about-timeline-card"
                elevation="0"
                rounded="lg"
              >
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ item.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ item.description }}
                </p>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="links-title"
      >
        <v-sheet
          class="about-section"
          elevation="0"
          rounded="xl"
        >
          <h2
            id="links-title"
            class="text-h5 font-weight-semibold mb-4"
          >
            {{ t("pages.about.linksTitle") }}
          </h2>
          <div class="d-flex flex-wrap gap-4">
            <v-btn
              v-for="link in resourceLinks"
              :key="link.href"
              :href="link.href"
              :target="link.target"
              :rel="link.rel"
              color="primary"
              variant="outlined"
              class="about-link"
              :aria-label="link.ariaLabel"
            >
              <v-icon
                :icon="link.icon"
                class="mr-2"
                aria-hidden="true"
              />
              {{ link.label }}
            </v-btn>
          </div>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="cta-title"
      >
        <v-sheet
          class="about-section about-section--cta"
          elevation="0"
          rounded="xl"
        >
          <v-row
            class="align-center"
            dense
          >
            <v-col
              cols="12"
              md="7"
            >
              <h2
                id="cta-title"
                class="text-h4 font-weight-semibold mb-3"
              >
                {{ finalCta.title }}
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-6">
                {{ finalCta.body }}
              </p>
              <div class="about-cta-actions">
                <v-btn
                  :to="finalCta.primary.to"
                  color="primary"
                  size="large"
                  class="about-cta-actions__btn"
                  :aria-label="finalCta.primary.ariaLabel"
                >
                  <v-icon
                    icon="mdi:rocket-launch-outline"
                    class="mr-2"
                    aria-hidden="true"
                  />
                  {{ finalCta.primary.label }}
                </v-btn>
                <v-btn
                  :to="finalCta.secondary.to"
                  color="primary"
                  variant="outlined"
                  size="large"
                  class="about-cta-actions__btn"
                  :aria-label="finalCta.secondary.ariaLabel"
                >
                  <v-icon
                    icon="mdi:chat-processing-outline"
                    class="mr-2"
                    aria-hidden="true"
                  />
                  {{ finalCta.secondary.label }}
                </v-btn>
              </div>
            </v-col>
            <v-col
              cols="12"
              md="5"
            >
              <v-sheet
                class="about-media"
                elevation="0"
                rounded="lg"
              >
                <v-responsive
                  aspect-ratio="4/3"
                  class="about-media__placeholder"
                >
                  <div class="about-media__content">
                    <v-icon
                      icon="mdi:movie-play-outline"
                      size="48"
                      aria-hidden="true"
                    />
                    <p class="text-body-2 text-medium-emphasis mb-0 text-center">
                      {{ finalCta.mediaPlaceholder }}
                    </p>
                  </div>
                </v-responsive>
              </v-sheet>
            </v-col>
          </v-row>
        </v-sheet>
      </section>
    </header>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useSwitchLocalePath } from "#i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import MissionSidebarCards from "~/components/about/MissionSidebarCards.vue";

const vuetifyComponentsPromise = import("vuetify/components");

const VTimeline = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VTimeline),
);

const VTimelineItem = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VTimelineItem),
);

const { t, locale, locales, defaultLocale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const localePath = useResolvedLocalePath();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const pageDescription = computed(() => t("seo.about.description"));

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
});
useSeoMeta(() => ({
  description: pageDescription.value,
  ogDescription: pageDescription.value,
  twitterDescription: pageDescription.value,
}));
const siteSettings = useSiteSettingsState();

const aboutContent = computed(
  () => siteSettings.value?.pages.about ?? getDefaultSiteSettings().pages.about,
);
const aboutTitle = computed(() => aboutContent.value.title?.trim() || t("pages.about.title"));
const aboutSubtitle = computed(
  () => aboutContent.value.subtitle?.trim() || t("pages.about.subtitle"),
);
const aboutBody = computed(() => aboutContent.value.body?.trim() || t("pages.about.missionBody"));

const heroActions = computed(() => [
  {
    label: t("pages.about.heroPrimaryCta"),
    ariaLabel: t("pages.about.heroPrimaryCtaAria"),
    to: localePath("/world-create"),
    color: "primary",
    variant: "flat",
    size: "large",
    icon: "mdi:rocket-launch-outline",
  },
  {
    label: t("pages.about.heroSecondaryCta"),
    ariaLabel: t("pages.about.heroSecondaryCtaAria"),
    to: localePath("/contact"),
    color: "primary",
    variant: "outlined",
    size: "large",
    icon: "mdi:chat-processing-outline",
  },
]);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");
const currentPath = computed(() => currentRoute.value?.path ?? "/");
const canonicalUrl = computed(() => new URL(currentPath.value, baseUrl.value).toString());
const availableLocales = computed(() => {
  const rawLocales = unref(locales);

  if (!rawLocales) {
    return [] as Array<{ code: string; iso?: string }>;
  }

  return rawLocales.map((entry) =>
    typeof entry === "string" ? { code: entry, iso: entry } : entry,
  );
});
const defaultLocaleCode = computed(() => {
  const rawDefault = unref(defaultLocale);

  if (typeof rawDefault === "string" && rawDefault) {
    return rawDefault;
  }

  if (
    rawDefault &&
    typeof rawDefault === "object" &&
    "code" in rawDefault &&
    typeof rawDefault.code === "string"
  ) {
    return rawDefault.code;
  }

  return availableLocales.value[0]?.code ?? "en";
});
const alternateLinks = computed(() => {
  if (!switchLocalePath) {
    return [] as Array<{ rel: "alternate"; hreflang: string; href: string }>;
  }

  const path = currentPath.value;
  const seen = new Set<string>();

  return availableLocales.value
    .map((entry) => {
      const hreflang = entry.iso || entry.code;

      if (!hreflang || seen.has(hreflang)) {
        return null;
      }

      seen.add(hreflang);

      const targetPath = switchLocalePath(entry.code) ?? path;
      const href = new URL(targetPath, baseUrl.value).toString();

      return { rel: "alternate" as const, hreflang, href };
    })
    .filter((link): link is { rel: "alternate"; hreflang: string; href: string } => Boolean(link));
});
const xDefaultLink = computed(() => {
  if (!switchLocalePath) {
    return null;
  }

  const targetPath = switchLocalePath(defaultLocaleCode.value) ?? currentPath.value;

  return {
    rel: "alternate" as const,
    hreflang: "x-default",
    href: new URL(targetPath, baseUrl.value).toString(),
  };
});
const ogAlternateLocales = computed(() => {
  const activeIso = localeProperties.value?.iso ?? locale.value;

  return availableLocales.value
    .map((entry) => entry.iso || entry.code)
    .filter((code): code is string => Boolean(code && code !== activeIso));
});

const missionPoints = computed(() => [
  {
    icon: "mdi:rocket-launch-outline",
    title: t("pages.about.missionPoints.builders.title"),
    body: t("pages.about.missionPoints.builders.body"),
  },
  {
    icon: "mdi:account-heart-outline",
    title: t("pages.about.missionPoints.community.title"),
    body: t("pages.about.missionPoints.community.body"),
  },
  {
    icon: "mdi:update",
    title: t("pages.about.missionPoints.iteration.title"),
    body: t("pages.about.missionPoints.iteration.body"),
  },
]);

const missionSidebarPoints = computed(() => missionPoints.value.slice(0, 2));

const { registerRightSidebarContent } = useLayoutRightSidebar();

registerRightSidebarContent(
  computed(() => {
    const points = missionSidebarPoints.value;

    if (!points.length) {
      return null;
    }

    return {
      component: MissionSidebarCards,
      props: { points },
    };
  }),
);

const valuesFeatures = computed(() => [
  {
    icon: "mdi:account-group-outline",
    title: t("pages.about.values.items.community.title"),
    body: t("pages.about.values.items.community.body"),
  },
  {
    icon: "mdi:palette-outline",
    title: t("pages.about.values.items.design.title"),
    body: t("pages.about.values.items.design.body"),
  },
  {
    icon: "mdi:clock-fast",
    title: t("pages.about.values.items.velocity.title"),
    body: t("pages.about.values.items.velocity.body"),
  },
  {
    icon: "mdi:shield-check-outline",
    title: t("pages.about.values.items.quality.title"),
    body: t("pages.about.values.items.quality.body"),
  },
]);

const metrics = computed(() => [
  {
    value: t("pages.about.metrics.items.contributors.value"),
    label: t("pages.about.metrics.items.contributors.label"),
    caption: t("pages.about.metrics.items.contributors.caption"),
  },
  {
    value: t("pages.about.metrics.items.components.value"),
    label: t("pages.about.metrics.items.components.label"),
    caption: t("pages.about.metrics.items.components.caption"),
  },
  {
    value: t("pages.about.metrics.items.locales.value"),
    label: t("pages.about.metrics.items.locales.label"),
    caption: t("pages.about.metrics.items.locales.caption"),
  },
  {
    value: t("pages.about.metrics.items.satisfaction.value"),
    label: t("pages.about.metrics.items.satisfaction.label"),
    caption: t("pages.about.metrics.items.satisfaction.caption"),
  },
]);

const teamMembers = computed(() => [
  {
    name: "Amina Rahman",
    initials: "AR",
    role: t("pages.about.teamMembers.amina.role"),
    bio: t("pages.about.teamMembers.amina.bio"),
  },
  {
    name: "Lukas Stein",
    initials: "LS",
    role: t("pages.about.teamMembers.lukas.role"),
    bio: t("pages.about.teamMembers.lukas.bio"),
  },
  {
    name: "Clara Dupont",
    initials: "CD",
    role: t("pages.about.teamMembers.clara.role"),
    bio: t("pages.about.teamMembers.clara.bio"),
  },
  {
    name: "Youssef Haddad",
    initials: "YH",
    role: t("pages.about.teamMembers.youssef.role"),
    bio: t("pages.about.teamMembers.youssef.bio"),
  },
]);

const techStack = computed(() => [
  {
    label: "Nuxt 3",
    description: t("pages.about.techStack.nuxt"),
  },
  {
    label: "Vuetify 3",
    description: t("pages.about.techStack.vuetify"),
  },
  {
    label: "TypeScript",
    description: t("pages.about.techStack.typescript"),
  },
  {
    label: "Vitest",
    description: t("pages.about.techStack.vitest"),
  },
]);

const timeline = computed(() => [
  {
    year: "2023",
    title: t("pages.about.timeline.2023.title"),
    description: t("pages.about.timeline.2023.description"),
    color: "primary",
  },
  {
    year: "2024",
    title: t("pages.about.timeline.2024.title"),
    description: t("pages.about.timeline.2024.description"),
    color: "secondary",
  },
  {
    year: "2025",
    title: t("pages.about.timeline.2025.title"),
    description: t("pages.about.timeline.2025.description"),
    color: "tertiary",
  },
]);

const resourceLinks = computed(() => [
  {
    label: t("pages.about.links.github"),
    href: "https://github.com/bro-world/bro-world-frontend-ui",
    icon: "mdi:github",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.githubAria"),
  },
  {
    label: t("pages.about.links.docs"),
    href: "https://bro-world-space.com/docs/",
    icon: "mdi:file-document-outline",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.docsAria"),
  },
  {
    label: t("pages.about.links.community"),
    href: "https://github.com/bro-world/bro-world-frontend-ui/discussions",
    icon: "mdi:account-group-outline",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.communityAria"),
  },
]);

const finalCta = computed(() => ({
  title: t("pages.about.finalCta.title"),
  body: t("pages.about.finalCta.body"),
  mediaPlaceholder: t("pages.about.finalCta.mediaPlaceholder"),
  primary: {
    label: t("pages.about.finalCta.primaryCta"),
    ariaLabel: t("pages.about.finalCta.primaryCtaAria"),
    to: localePath("/world-create"),
  },
  secondary: {
    label: t("pages.about.finalCta.secondaryCta"),
    ariaLabel: t("pages.about.finalCta.secondaryCtaAria"),
    to: localePath("/contact"),
  },
}));

const aboutJsonLd = computed(() => {
  const iso = localeProperties.value?.iso ?? locale.value;
  const metricProperties = metrics.value.map((metric) => ({
    "@type": "PropertyValue",
    name: metric.label,
    value: metric.value,
    description: metric.caption,
  }));
  const team = teamMembers.value.map((member) => ({
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
  }));
  const knowledgeAreas = valuesFeatures.value.map((item) => item.title);
  const sameAsLinks = resourceLinks.value
    .filter((link) => typeof link.href === "string" && link.href.startsWith("http"))
    .map((link) => link.href);
  const actions = heroActions.value.map((action) => ({
    "@type": "EntryPoint",
    name: action.label,
    urlTemplate: new URL(action.to, baseUrl.value).toString(),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    inLanguage: iso,
    url: canonicalUrl.value,
    name: aboutTitle.value,
    description: pageDescription.value,
    alternateName: aboutSubtitle.value,
    isPartOf: {
      "@type": "WebSite",
      name: "Bro World",
      url: baseUrl.value,
      inLanguage: iso,
    },
    publisher: {
      "@type": "Organization",
      name: "Bro World",
      url: baseUrl.value,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      description: t("pages.about.valuesMediaPlaceholder"),
    },
    potentialAction: actions,
    about: knowledgeAreas,
    mainEntity: {
      "@type": "Organization",
      name: "Bro World",
      url: baseUrl.value,
      description: aboutBody.value,
      member: team,
      areaServed: availableLocales.value.map((entry) => entry.iso ?? entry.code),
      additionalProperty: metricProperties,
      sameAs: sameAsLinks,
    },
  };
});

useHead(() => {
  const title = t("seo.about.title");
  const iso = localeProperties.value?.iso ?? locale.value;
  const alternateMeta = ogAlternateLocales.value.map((code) => ({
    key: `og:locale:alternate:${code}`,
    property: "og:locale:alternate",
    content: code,
  }));

  const links = [
    { key: "canonical", rel: "canonical", href: canonicalUrl.value },
    ...alternateLinks.value.map((link) => ({
      key: `alternate-${link.hreflang}`,
      rel: link.rel,
      hreflang: link.hreflang,
      href: link.href,
    })),
  ];

  if (xDefaultLink.value) {
    links.push({
      key: "alternate-x-default",
      rel: xDefaultLink.value.rel,
      hreflang: xDefaultLink.value.hreflang,
      href: xDefaultLink.value.href,
    });
  }

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonicalUrl.value },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonicalUrl.value },
      ...alternateMeta,
    ],
    link: links,
    script: [
      {
        key: "ld-json-about",
        type: "application/ld+json",
        innerHTML: JSON.stringify(aboutJsonLd.value),
      },
    ],
    __dangerouslyDisableSanitizers: ["script"],
  };
});
</script>

<style scoped src="~/assets/styles/pages/about.scss" lang="scss"></style>
