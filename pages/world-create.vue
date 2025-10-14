<template>
  <main
    class="py-12"
    aria-labelledby="create-world-heading"
  >
    <v-container>
      <section
        class="text-center mb-12"
        aria-describedby="create-world-subtitle"
      >
        <h1
          id="create-world-heading"
          class="text-h3 font-weight-bold mb-4"
        >
          {{ t("pages.createWorld.title") }}
        </h1>
        <p
          id="create-world-subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 680px"
        >
          {{ t("pages.createWorld.subtitle") }}
        </p>
      </section>

      <section
        class="mb-12"
        aria-labelledby="create-world-form-title"
      >
        <v-card
          variant="outlined"
          class="pa-8"
        >
          <div class="d-flex flex-column flex-md-row justify-space-between mb-8 gap-4">
            <div>
              <h2
                id="create-world-form-title"
                class="text-h4 font-weight-semibold mb-2"
              >
                {{ t("pages.createWorld.form.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.createWorld.form.subtitle") }}
              </p>
            </div>
            <div class="d-flex align-center gap-4">
              <v-btn
                color="secondary"
                variant="outlined"
                size="large"
                :aria-label="t('pages.createWorld.form.actions.previewAria')"
              >
                {{ t("pages.createWorld.form.actions.preview") }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                :aria-label="t('pages.createWorld.form.actions.publishAria')"
              >
                {{ t("pages.createWorld.form.actions.publish") }}
              </v-btn>
            </div>
          </div>

          <v-form class="d-flex flex-column gap-8">
            <div>
              <header class="mb-6">
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ t("pages.createWorld.form.basicInfo.title") }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.createWorld.form.basicInfo.subtitle") }}
                </p>
              </header>

              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="worldForm.name"
                    :label="t('pages.createWorld.form.fields.name')"
                    :placeholder="t('pages.createWorld.form.fields.namePlaceholder')"
                    density="comfortable"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="worldForm.slug"
                    :label="t('pages.createWorld.form.fields.slug')"
                    :placeholder="t('pages.createWorld.form.fields.slugPlaceholder')"
                    density="comfortable"
                    variant="outlined"
                    prepend-inner="https://bro.world/"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="worldForm.description"
                    :label="t('pages.createWorld.form.fields.description')"
                    :placeholder="t('pages.createWorld.form.fields.descriptionPlaceholder')"
                    density="comfortable"
                    variant="outlined"
                    rows="4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-radio-group
                    v-model="worldForm.visibility"
                    :label="t('pages.createWorld.form.fields.visibility')"
                    inline
                  >
                    <v-radio
                      value="public"
                      :label="t('pages.createWorld.form.fields.visibilityOptions.public')"
                    />
                    <v-radio
                      value="private"
                      :label="t('pages.createWorld.form.fields.visibilityOptions.private')"
                    />
                  </v-radio-group>
                  <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
                    {{ t("pages.createWorld.form.fields.visibilityHint") }}
                  </p>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="worldForm.theme"
                    :items="themeOptions"
                    :label="t('pages.createWorld.form.fields.theme')"
                    item-title="label"
                    item-value="value"
                    density="comfortable"
                    variant="outlined"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="worldForm.region"
                    :items="regionOptions"
                    :label="t('pages.createWorld.form.fields.region')"
                    density="comfortable"
                    variant="outlined"
                  />
                  <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
                    {{ t("pages.createWorld.form.fields.regionHint") }}
                  </p>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="worldForm.launchDate"
                    type="date"
                    :label="t('pages.createWorld.form.fields.launchDate')"
                    density="comfortable"
                    variant="outlined"
                  />
                  <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
                    {{ t("pages.createWorld.form.fields.launchDateHint") }}
                  </p>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-combobox
                    v-model="worldForm.tags"
                    :items="tagSuggestions"
                    :label="t('pages.createWorld.form.fields.tags')"
                    :placeholder="t('pages.createWorld.form.fields.tagsPlaceholder')"
                    density="comfortable"
                    variant="outlined"
                    chips
                    closable-chips
                    multiple
                  />
                  <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
                    {{ t("pages.createWorld.form.fields.tagsHint") }}
                  </p>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="worldForm.guidelines"
                    :label="t('pages.createWorld.form.fields.guidelines')"
                    :placeholder="t('pages.createWorld.form.fields.guidelinesPlaceholder')"
                    density="comfortable"
                    variant="outlined"
                    rows="4"
                  />
                </v-col>
              </v-row>
            </div>

            <div>
              <header class="mb-6">
                <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                  {{ t("pages.createWorld.form.advanced.title") }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.createWorld.form.advanced.subtitle") }}
                </p>
              </header>

              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-switch
                    v-model="worldForm.enableMonetization"
                    :label="t('pages.createWorld.form.advanced.monetization')"
                    inset
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-switch
                    v-model="worldForm.enableIntegrations"
                    :label="t('pages.createWorld.form.advanced.integrations')"
                    inset
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-switch
                    v-model="worldForm.requireVerification"
                    :label="t('pages.createWorld.form.advanced.verification')"
                    inset
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-switch
                    v-model="worldForm.allowGuests"
                    :label="t('pages.createWorld.form.advanced.guests')"
                    inset
                  />
                  <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
                    {{ t("pages.createWorld.form.advanced.guestsHint") }}
                  </p>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card>
      </section>

      <section
        class="mb-12"
        aria-labelledby="create-world-plugins-title"
      >
        <header class="mb-8 text-center">
          <h2
            id="create-world-plugins-title"
            class="text-h4 font-weight-semibold mb-2"
          >
            {{ t("pages.createWorld.plugins.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mx-auto mb-0" style="max-width: 620px">
            {{ t("pages.createWorld.plugins.subtitle") }}
          </p>
        </header>

        <v-row dense>
          <v-col
            v-for="category in pluginCategories"
            :key="category.key"
            cols="12"
            md="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100 d-flex flex-column gap-5"
            >
              <div>
                <div class="d-flex align-start gap-3 mb-3">
                  <v-avatar
                    color="primary"
                    size="44"
                    class="elevation-2"
                  >
                    <v-icon
                      :icon="category.icon"
                      size="26"
                      color="white"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                      {{ category.title }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ category.description }}
                    </p>
                  </div>
                </div>
                <v-divider />
              </div>
              <div class="d-flex flex-column gap-4">
                <div
                  v-for="plugin in category.plugins"
                  :key="plugin.name"
                  class="plugin-card"
                >
                  <div class="d-flex justify-space-between align-start mb-2">
                    <h4 class="text-body-1 font-weight-medium mb-0">
                      {{ plugin.name }}
                    </h4>
                    <v-chip
                      v-if="plugin.tag"
                      color="primary"
                      variant="tonal"
                      size="small"
                    >
                      {{ plugin.tag }}
                    </v-chip>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    {{ plugin.description }}
                  </p>
                  <ul class="text-body-2 text-medium-emphasis pl-5 mb-0">
                    <li
                      v-for="point in plugin.points"
                      :key="point"
                    >
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        class="mb-12"
        aria-labelledby="create-world-workflow-title"
      >
        <header class="mb-8 text-center">
          <h2
            id="create-world-workflow-title"
            class="text-h4 font-weight-semibold mb-2"
          >
            {{ t("pages.createWorld.workflow.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mx-auto mb-0" style="max-width: 600px">
            {{ t("pages.createWorld.workflow.subtitle") }}
          </p>
        </header>

        <ol class="d-flex flex-column gap-4 list-none pa-0">
          <li
            v-for="(step, index) in creationSteps"
            :key="step.title"
          >
            <v-sheet
              class="pa-6 rounded-lg d-flex flex-column flex-md-row align-start gap-4"
              color="surface-variant"
              variant="tonal"
            >
              <div
                class="d-flex align-center justify-center rounded-circle"
                style="width: 48px; height: 48px"
                :aria-label="t('pages.createWorld.workflow.stepLabel', { number: index + 1 })"
              >
                <span class="text-subtitle-1 font-weight-semibold">{{ index + 1 }}</span>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-center gap-3 mb-2">
                  <v-icon
                    :icon="step.icon"
                    size="24"
                    color="primary"
                    aria-hidden="true"
                  />
                  <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                    {{ step.title }}
                  </h3>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ step.description }}
                </p>
              </div>
            </v-sheet>
          </li>
        </ol>
      </section>

      <section aria-labelledby="create-world-resources-title">
        <v-card
          color="primary"
          variant="flat"
          class="pa-8"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div>
              <h2
                id="create-world-resources-title"
                class="text-h4 font-weight-semibold text-white mb-2"
              >
                {{ t("pages.createWorld.cta.title") }}
              </h2>
              <p class="text-body-1 text-white text-opacity-80 mb-0" style="max-width: 520px">
                {{ t("pages.createWorld.cta.description") }}
              </p>
            </div>
            <v-btn
              :to="contactLink"
              color="white"
              variant="flat"
              size="large"
              class="text-primary"
              :aria-label="t('pages.createWorld.cta.buttonAria')"
            >
              {{ t("pages.createWorld.cta.button") }}
            </v-btn>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const localePath = useLocalePath();
const currentRoute = computed(() => router.currentRoute.value);

const worldForm = reactive({
  name: "",
  slug: "",
  description: "",
  visibility: "public",
  theme: "aurora",
  region: "global",
  launchDate: "",
  tags: [] as string[],
  guidelines: "",
  enableMonetization: true,
  enableIntegrations: true,
  requireVerification: false,
  allowGuests: true,
});

const themeOptions = computed(() => [
  { value: "aurora", label: t("pages.createWorld.form.themeOptions.aurora") },
  { value: "midnight", label: t("pages.createWorld.form.themeOptions.midnight") },
  { value: "sunrise", label: t("pages.createWorld.form.themeOptions.sunrise") },
  { value: "custom", label: t("pages.createWorld.form.themeOptions.custom") },
]);

const regionOptions = computed(() => [
  t("pages.createWorld.form.regionOptions.global"),
  t("pages.createWorld.form.regionOptions.americas"),
  t("pages.createWorld.form.regionOptions.emea"),
  t("pages.createWorld.form.regionOptions.apac"),
]);

const tagSuggestions = computed(() => [
  t("pages.createWorld.form.tagSuggestions.coOp"),
  t("pages.createWorld.form.tagSuggestions.roleplay"),
  t("pages.createWorld.form.tagSuggestions.competitive"),
  t("pages.createWorld.form.tagSuggestions.casual"),
  t("pages.createWorld.form.tagSuggestions.modded"),
]);

const pluginCategories = computed(() => [
  {
    key: "community",
    icon: "mdi-earth",
    title: t("pages.createWorld.plugins.categories.community.title"),
    description: t("pages.createWorld.plugins.categories.community.description"),
    plugins: [
      {
        name: t("pages.createWorld.plugins.categories.community.plugins.lobby.name"),
        tag: t("pages.createWorld.plugins.categories.community.plugins.lobby.tag"),
        description: t(
          "pages.createWorld.plugins.categories.community.plugins.lobby.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.community.plugins.lobby.points.0"),
          t("pages.createWorld.plugins.categories.community.plugins.lobby.points.1"),
          t("pages.createWorld.plugins.categories.community.plugins.lobby.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.community.plugins.events.name"),
        tag: t("pages.createWorld.plugins.categories.community.plugins.events.tag"),
        description: t(
          "pages.createWorld.plugins.categories.community.plugins.events.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.community.plugins.events.points.0"),
          t("pages.createWorld.plugins.categories.community.plugins.events.points.1"),
          t("pages.createWorld.plugins.categories.community.plugins.events.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.community.plugins.streams.name"),
        tag: t("pages.createWorld.plugins.categories.community.plugins.streams.tag"),
        description: t(
          "pages.createWorld.plugins.categories.community.plugins.streams.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.community.plugins.streams.points.0"),
          t("pages.createWorld.plugins.categories.community.plugins.streams.points.1"),
          t("pages.createWorld.plugins.categories.community.plugins.streams.points.2"),
        ],
      },
    ],
  },
  {
    key: "economy",
    icon: "mdi-currency-usd",
    title: t("pages.createWorld.plugins.categories.economy.title"),
    description: t("pages.createWorld.plugins.categories.economy.description"),
    plugins: [
      {
        name: t("pages.createWorld.plugins.categories.economy.plugins.market.name"),
        tag: t("pages.createWorld.plugins.categories.economy.plugins.market.tag"),
        description: t(
          "pages.createWorld.plugins.categories.economy.plugins.market.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.economy.plugins.market.points.0"),
          t("pages.createWorld.plugins.categories.economy.plugins.market.points.1"),
          t("pages.createWorld.plugins.categories.economy.plugins.market.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.economy.plugins.crafting.name"),
        tag: t("pages.createWorld.plugins.categories.economy.plugins.crafting.tag"),
        description: t(
          "pages.createWorld.plugins.categories.economy.plugins.crafting.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.economy.plugins.crafting.points.0"),
          t("pages.createWorld.plugins.categories.economy.plugins.crafting.points.1"),
          t("pages.createWorld.plugins.categories.economy.plugins.crafting.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.economy.plugins.rewards.name"),
        tag: t("pages.createWorld.plugins.categories.economy.plugins.rewards.tag"),
        description: t(
          "pages.createWorld.plugins.categories.economy.plugins.rewards.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.economy.plugins.rewards.points.0"),
          t("pages.createWorld.plugins.categories.economy.plugins.rewards.points.1"),
          t("pages.createWorld.plugins.categories.economy.plugins.rewards.points.2"),
        ],
      },
    ],
  },
  {
    key: "governance",
    icon: "mdi-shield-account",
    title: t("pages.createWorld.plugins.categories.governance.title"),
    description: t("pages.createWorld.plugins.categories.governance.description"),
    plugins: [
      {
        name: t("pages.createWorld.plugins.categories.governance.plugins.moderation.name"),
        tag: t("pages.createWorld.plugins.categories.governance.plugins.moderation.tag"),
        description: t(
          "pages.createWorld.plugins.categories.governance.plugins.moderation.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.governance.plugins.moderation.points.0"),
          t("pages.createWorld.plugins.categories.governance.plugins.moderation.points.1"),
          t("pages.createWorld.plugins.categories.governance.plugins.moderation.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.governance.plugins.safety.name"),
        tag: t("pages.createWorld.plugins.categories.governance.plugins.safety.tag"),
        description: t(
          "pages.createWorld.plugins.categories.governance.plugins.safety.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.governance.plugins.safety.points.0"),
          t("pages.createWorld.plugins.categories.governance.plugins.safety.points.1"),
          t("pages.createWorld.plugins.categories.governance.plugins.safety.points.2"),
        ],
      },
      {
        name: t("pages.createWorld.plugins.categories.governance.plugins.analytics.name"),
        tag: t("pages.createWorld.plugins.categories.governance.plugins.analytics.tag"),
        description: t(
          "pages.createWorld.plugins.categories.governance.plugins.analytics.description",
        ),
        points: [
          t("pages.createWorld.plugins.categories.governance.plugins.analytics.points.0"),
          t("pages.createWorld.plugins.categories.governance.plugins.analytics.points.1"),
          t("pages.createWorld.plugins.categories.governance.plugins.analytics.points.2"),
        ],
      },
    ],
  },
]);

const creationSteps = computed(() => [
  {
    icon: "mdi-lightbulb-on-outline",
    title: t("pages.createWorld.workflow.steps.vision.title"),
    description: t("pages.createWorld.workflow.steps.vision.description"),
  },
  {
    icon: "mdi-rocket-launch-outline",
    title: t("pages.createWorld.workflow.steps.launch.title"),
    description: t("pages.createWorld.workflow.steps.launch.description"),
  },
  {
    icon: "mdi-chart-bell-curve",
    title: t("pages.createWorld.workflow.steps.expand.title"),
    description: t("pages.createWorld.workflow.steps.expand.description"),
  },
]);

const contactLink = computed(() => localePath("/contact"));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.createWorld.title");
  const description = t("seo.createWorld.description");
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

definePageMeta({
  documentDriven: false,
});
</script>

<style scoped>
.plugin-card {
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
}

@media (max-width: 600px) {
  .plugin-card {
    padding: 0.75rem;
  }
}
</style>
