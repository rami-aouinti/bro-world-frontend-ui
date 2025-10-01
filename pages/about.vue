<template>
  <main
    class="about-page py-12"
    aria-labelledby="about-heading"
  >
    <v-container class="about-container">
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
              icon="mdi-rocket-launch-outline"
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
            {{ t("pages.about.title") }}
          </h1>
          <p
            id="about-subtitle"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            {{ t("pages.about.subtitle") }}
          </p>
        </v-sheet>
      </section>

      <section
        class="mb-12"
        aria-labelledby="mission-title"
      >
        <v-row
          class="align-center"
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-sheet
              class="about-section"
              elevation="0"
              rounded="xl"
            >
              <h2
                id="mission-title"
                class="text-h4 font-weight-semibold mb-4"
              >
                {{ t("pages.about.missionTitle") }}
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-6">
                {{ t("pages.about.missionBody") }}
              </p>
              <div class="d-flex flex-wrap gap-3">
                <v-chip
                  v-for="tech in techStack"
                  :key="tech.label"
                  class="about-chip"
                  color="primary"
                  variant="tonal"
                >
                  {{ tech.label }}
                </v-chip>
              </div>
            </v-sheet>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-sheet
              class="about-section about-section--cards"
              elevation="0"
              rounded="xl"
            >
              <v-card
                v-for="point in missionPoints"
                :key="point.title"
                class="about-mission-card"
                elevation="0"
                rounded="lg"
              >
                <div class="d-flex align-start">
                  <v-avatar
                    class="about-mission-card__icon mr-4"
                    size="48"
                  >
                    <v-icon
                      :icon="point.icon"
                      size="26"
                      aria-hidden="true"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                      {{ point.title }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ point.body }}
                    </p>
                  </div>
                </div>
              </v-card>
            </v-sheet>
          </v-col>
        </v-row>
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
              sm="6"
              lg="3"
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

      <section aria-labelledby="links-title">
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
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { t, locale, localeProperties } = useI18n();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.about.title");
  const description = t("seo.about.description");
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

const missionPoints = computed(() => [
  {
    icon: "mdi-rocket-launch-outline",
    title: t("pages.about.missionPoints.builders.title"),
    body: t("pages.about.missionPoints.builders.body"),
  },
  {
    icon: "mdi-account-heart-outline",
    title: t("pages.about.missionPoints.community.title"),
    body: t("pages.about.missionPoints.community.body"),
  },
  {
    icon: "mdi-update",
    title: t("pages.about.missionPoints.iteration.title"),
    body: t("pages.about.missionPoints.iteration.body"),
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
    icon: "mdi-github",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.githubAria"),
  },
  {
    label: t("pages.about.links.docs"),
    href: "https://bro-world-space.com/docs/",
    icon: "mdi-file-document-outline",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.docsAria"),
  },
  {
    label: t("pages.about.links.community"),
    href: "https://github.com/bro-world/bro-world-frontend-ui/discussions",
    icon: "mdi-account-group-outline",
    target: "_blank",
    rel: "noopener noreferrer",
    ariaLabel: t("pages.about.links.communityAria"),
  },
]);
</script>

<style scoped>
main.about-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.14), transparent 55%),
    radial-gradient(circle at bottom right, rgba(var(--v-theme-secondary), 0.12), transparent 55%),
    linear-gradient(180deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-surface-variant), 0.18) 100%);
}

.about-container {
  position: relative;
  z-index: 1;
}

.about-hero {
  padding: 48px 40px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.18), transparent 45%),
    rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.35);
  backdrop-filter: blur(18px);
}

.about-hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgba(var(--v-theme-primary), 0.92);
  margin-bottom: 20px;
}

.tracking-wide {
  letter-spacing: 0.14em;
}

.about-section {
  padding: 36px 32px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-surface-variant), 0.14), transparent 55%),
    rgba(var(--v-theme-surface), 0.82);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.35);
  backdrop-filter: blur(16px);
}

.about-section--cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-mission-card {
  padding: 20px 24px;
  background: rgba(var(--v-theme-surface), 0.88);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.32);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.about-mission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px -22px rgba(var(--v-theme-on-surface), 0.4);
}

.about-mission-card__icon {
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgba(var(--v-theme-primary), 0.96);
}

.about-team-card {
  height: 100%;
  padding: 28px 24px;
  background: rgba(var(--v-theme-surface), 0.88);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.32);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.about-team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px -24px rgba(var(--v-theme-on-surface), 0.4);
}

.about-team-card__avatar {
  background: rgba(var(--v-theme-secondary), 0.18);
  color: rgba(var(--v-theme-secondary), 0.95);
  font-weight: 600;
}

.about-chip {
  border-radius: 999px;
  font-weight: 600;
}

.about-chip--outlined {
  border-color: rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.08);
}

.about-timeline {
  padding-block: 8px;
}

.about-timeline-card {
  padding: 24px 22px;
  background: rgba(var(--v-theme-surface), 0.88);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.32);
}

.about-link {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(var(--v-theme-surface), 0.85);
}

@media (max-width: 1280px) {
  .about-section {
    padding: 28px 24px;
  }
}

@media (max-width: 960px) {
  main.about-page {
    padding-block: 60px;
  }

  .about-hero {
    padding: 36px 28px;
  }
}
</style>
