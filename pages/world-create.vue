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
            <div class="d-flex align-center gap-4 flex-column flex-md-row">
              <v-btn
                color="secondary"
                variant="outlined"
                size="large"
                :aria-label="t('pages.createWorld.form.actions.previewAria')"
                :loading="isSubmitting && activeAction === 'preview'"
                :disabled="isSubmitting"
                @click="handleSubmit('preview')"
              >
                {{ t("pages.createWorld.form.actions.preview") }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                :aria-label="t('pages.createWorld.form.actions.publishAria')"
                :loading="isSubmitting && activeAction === 'publish'"
                :disabled="isSubmitting"
                @click="handleSubmit('publish')"
              >
                {{ t("pages.createWorld.form.actions.publish") }}
              </v-btn>
            </div>
            <div
              v-if="submissionError"
              class="mt-4"
            >
              <v-alert
                type="error"
                variant="tonal"
                border="start"
                color="error"
              >
                {{ submissionError }}
              </v-alert>
            </div>
            <div
              v-else-if="submissionSuccessAction"
              class="mt-4"
            >
              <v-alert
                type="success"
                variant="tonal"
                border="start"
                color="success"
              >
                {{ submissionSuccessMessage }}
              </v-alert>
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
                  <v-date-input
                    v-model="worldForm.launchDate"
                    :label="t('pages.createWorld.form.fields.launchDate')"
                    density="comfortable"
                    variant="outlined"
                    hide-details="auto"
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
          <p
            class="text-body-2 text-medium-emphasis mx-auto mb-0"
            style="max-width: 620px"
          >
            {{ t("pages.createWorld.plugins.subtitle") }}
          </p>
        </header>

        <v-row dense>
          <v-col
            v-for="category in pluginCategories"
            :key="category.id"
            cols="12"
            md="6"
            xl="4"
          >
            <v-card
              variant="tonal"
              class="pa-6 h-100 d-flex flex-column gap-5"
            >
              <div class="d-flex align-start gap-3">
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
                    {{ category.label }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ category.description }}
                  </p>
                </div>
              </div>
              <v-divider />
              <div class="d-flex flex-column gap-4">
                <article
                  v-for="plugin in category.plugins"
                  :key="plugin.id"
                  class="plugin-card"
                >
                  <div class="d-flex align-start justify-space-between gap-3">
                    <div class="d-flex align-start gap-3">
                      <v-avatar
                        color="surface"
                        class="elevation-1"
                        size="40"
                      >
                        <v-icon
                          :icon="plugin.icon"
                          size="22"
                          color="primary"
                        />
                      </v-avatar>
                      <div>
                        <h4 class="text-body-1 font-weight-semibold mb-1">
                          {{ plugin.name }}
                        </h4>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          {{ plugin.description }}
                        </p>
                      </div>
                    </div>
                    <v-switch
                      class="flex-shrink-0"
                      color="primary"
                      density="compact"
                      hide-details
                      inset
                      :aria-label="`Toggle ${plugin.name}`"
                      :model-value="selectedPluginIds.has(plugin.id)"
                      @update:model-value="(value) => togglePlugin(plugin.id, Boolean(value))"
                    />
                  </div>
                  <div
                    v-if="plugin.highlights?.length"
                    class="mt-3"
                  >
                    <ul class="plugin-meta-list">
                      <li
                        v-for="highlight in plugin.highlights"
                        :key="highlight"
                      >
                        {{ highlight }}
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="plugin.routes?.length"
                    class="mt-4"
                  >
                    <h5 class="text-caption text-medium-emphasis text-uppercase mb-1">Routes</h5>
                    <ul class="plugin-meta-list">
                      <li
                        v-for="route in plugin.routes"
                        :key="route.path"
                      >
                        <span class="font-weight-medium">{{ route.label }}</span>
                        <span class="text-medium-emphasis"> ({{ route.path }})</span>
                        <span
                          v-if="route.description"
                          class="d-block text-caption text-disabled mt-1"
                        >
                          {{ route.description }}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="plugin.menus?.length"
                    class="mt-4"
                  >
                    <h5 class="text-caption text-medium-emphasis text-uppercase mb-1">Menus</h5>
                    <ul class="plugin-meta-list">
                      <li
                        v-for="menu in plugin.menus"
                        :key="menu.id"
                      >
                        <span class="font-weight-medium">{{ menu.label }}</span>
                        <span
                          v-if="menu.description"
                          class="text-medium-emphasis"
                        >
                          — {{ menu.description }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </article>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <div class="mt-6">
          <v-alert
            v-if="pluginSelectionError"
            type="error"
            variant="tonal"
            border="start"
            color="error"
            class="mb-4"
          >
            {{ pluginSelectionError }}
          </v-alert>
          <v-alert
            type="info"
            variant="tonal"
            border="start"
            color="primary"
          >
            <div class="d-flex flex-column gap-2">
              <div class="text-subtitle-2 font-weight-semibold">
                {{ pluginSummaryTitle }}
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ pluginSummaryDescription }}
              </p>
              <ul
                v-if="selectedPlugins.length"
                class="plugin-meta-list mb-0"
              >
                <li
                  v-for="plugin in selectedPlugins"
                  :key="plugin.id"
                  class="text-body-2"
                >
                  {{ plugin.name }}
                </li>
              </ul>
            </div>
          </v-alert>
        </div>
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
          <p
            class="text-body-2 text-medium-emphasis mx-auto mb-0"
            style="max-width: 600px"
          >
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
              <p
                class="text-body-1 text-white text-opacity-80 mb-0"
                style="max-width: 520px"
              >
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
import { computed, defineAsyncComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useWorldCreator } from "~/composables/useWorldCreator";
import {
  groupWorldPluginsByCategory,
  WORLD_PLUGIN_REGISTRY,
  WORLD_PLUGIN_REGISTRY_MAP,
  type WorldPluginDefinition,
} from "~/lib/world/plugins";
import type {
  CreateWorldRequestPayload,
  WorldFormState,
  WorldSubmissionAction,
} from "~/types/world";

const vuetifyComponentsPromise = import("vuetify/components");

const VCombobox = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VCombobox));

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const localePath = useResolvedLocalePath();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.createWorld.description"));

definePageMeta({
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const worldForm = reactive<WorldFormState>({
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

const { submitWorld, isSubmitting } = useWorldCreator();

const pluginCategories = computed(() => groupWorldPluginsByCategory(WORLD_PLUGIN_REGISTRY));

const selectedPluginIds = ref<Set<string>>(new Set());

const selectedPlugins = computed<WorldPluginDefinition[]>(() =>
  Array.from(selectedPluginIds.value)
    .map((id) => WORLD_PLUGIN_REGISTRY_MAP.get(id) ?? null)
    .filter((plugin): plugin is WorldPluginDefinition => Boolean(plugin)),
);

const showPluginValidation = ref(false);
const submissionError = ref<string | null>(null);
const submissionSuccessAction = ref<WorldSubmissionAction | null>(null);
const activeAction = ref<WorldSubmissionAction | null>(null);

const pluginSelectionError = computed(() =>
  showPluginValidation.value && selectedPluginIds.value.size === 0
    ? "Select at least one plugin to continue."
    : null,
);

const pluginSummaryTitle = computed(() =>
  selectedPlugins.value.length > 0 ? "Selected plugins" : "No plugins selected yet",
);

const pluginSummaryDescription = computed(() =>
  selectedPlugins.value.length > 0
    ? "The following plugins will be included in your provisioning request:"
    : "Choose plugins to preview the capabilities that will be provisioned.",
);

const submissionSuccessMessage = computed(() => {
  if (!submissionSuccessAction.value) {
    return "";
  }

  return submissionSuccessAction.value === "preview"
    ? "Preview request submitted. We'll send the sandbox link shortly."
    : "Publish request submitted. Provisioning will begin soon.";
});

function resetSubmissionState() {
  submissionError.value = null;
  submissionSuccessAction.value = null;
}

function togglePlugin(id: string, enabled: boolean) {
  const next = new Set(selectedPluginIds.value);

  if (enabled) {
    next.add(id);
  } else {
    next.delete(id);
  }

  selectedPluginIds.value = next;

  if (next.size > 0) {
    showPluginValidation.value = false;
  }

  resetSubmissionState();
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return "Unable to submit your world request. Please try again.";
}

async function handleSubmit(action: WorldSubmissionAction) {
  showPluginValidation.value = true;
  resetSubmissionState();

  if (selectedPluginIds.value.size === 0) {
    return;
  }

  const payload: CreateWorldRequestPayload = {
    name: worldForm.name,
    slug: worldForm.slug,
    description: worldForm.description,
    visibility: worldForm.visibility,
    theme: worldForm.theme,
    region: worldForm.region,
    launchDate: worldForm.launchDate,
    tags: [...worldForm.tags],
    guidelines: worldForm.guidelines,
    enableMonetization: worldForm.enableMonetization,
    enableIntegrations: worldForm.enableIntegrations,
    requireVerification: worldForm.requireVerification,
    allowGuests: worldForm.allowGuests,
    pluginIds: Array.from(selectedPluginIds.value),
    action,
  };

  try {
    activeAction.value = action;
    await submitWorld(payload);
    submissionSuccessAction.value = action;
  } catch (error) {
    submissionError.value = resolveErrorMessage(error);
    console.error("[world-create] Failed to submit world", error);
  } finally {
    activeAction.value = null;
  }
}

const creationSteps = computed(() => [
  {
    icon: "mdi:lightbulb-on-outline",
    title: t("pages.createWorld.workflow.steps.vision.title"),
    description: t("pages.createWorld.workflow.steps.vision.description"),
  },
  {
    icon: "mdi:rocket-launch-outline",
    title: t("pages.createWorld.workflow.steps.launch.title"),
    description: t("pages.createWorld.workflow.steps.launch.description"),
  },
  {
    icon: "mdi:chart-bell-curve",
    title: t("pages.createWorld.workflow.steps.expand.title"),
    description: t("pages.createWorld.workflow.steps.expand.description"),
  },
]);

const contactLink = computed(() => localePath("/contact"));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.createWorld.title");
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
</script>

<style scoped>
.plugin-card {
  padding: 1rem;
  border-radius: var(--ui-surface-radius, calc(var(--radius, var(--ui-radius)) + 4px));
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
}

.plugin-meta-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.plugin-meta-list li + li {
  margin-top: 0.25rem;
}

@media (max-width: 600px) {
  .plugin-card {
    padding: 0.75rem;
  }
}
</style>
