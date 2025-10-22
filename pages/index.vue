<template>
  <main
    class="world-explorer-page"
    aria-labelledby="world-explorer-heading"
  >
    <header class="world-explorer-page__header">
      <h1
        id="world-explorer-heading"
        class="world-explorer-page__title"
      >
        {{ t("pages.index.title") }}
      </h1>
      <p class="world-explorer-page__description">
        {{ t("pages.index.description") }}
      </p>
    </header>

    <section
      v-if="worlds.length"
      aria-labelledby="world-explorer-list-title"
    >
      <h2
        id="world-explorer-list-title"
        class="sr-only"
      >
        {{ t("pages.index.worldListTitle") }}
      </h2>
      <div class="world-explorer-page__grid">
        <WorldExplorerCard
          v-for="world in worlds"
          :key="world.id"
          :world="world"
          :is-active="world.id === activeWorldId"
          class="world-explorer-page__card"
          data-test="world-explorer-card"
          @activate="setActiveWorld"
        />
      </div>
    </section>
    <SidebarCard
      v-else
      class="world-explorer-page__empty"
      glow
      data-test="world-explorer-empty"
    >
      <div>
        <h2 class="world-explorer-page__empty-title">
          {{ t("pages.index.empty.title") }}
        </h2>
        <p class="world-explorer-page__empty-description">
          {{ t("pages.index.empty.description") }}
        </p>
      </div>
    </SidebarCard>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta, useSeoMeta } from "#imports";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import WorldExplorerCard from "~/components/world/WorldExplorerCard.vue";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings } from "~/types/settings";

const { t } = useI18n();
const siteSettingsState = useSiteSettingsState();

const fallbackSettings = computed<SiteSettings>(() => getDefaultSiteSettings());
const siteSettings = computed(() => siteSettingsState.value ?? fallbackSettings.value);
const worlds = computed(() => siteSettings.value.worlds ?? []);
const activeWorldId = computed(() => siteSettings.value.activeWorldId ?? worlds.value[0]?.id ?? null);

function setActiveWorld(worldId: string) {
  if (!worldId) {
    return;
  }

  const currentSettings = siteSettingsState.value;

  if (!currentSettings) {
    siteSettingsState.value = {
      ...fallbackSettings.value,
      activeWorldId: worldId,
    };
    return;
  }

  siteSettingsState.value = {
    ...currentSettings,
    activeWorldId: worldId,
  };
}

const pageDescription = computed(() => t("pages.index.description"));

if (typeof definePageMeta === "function") {
  definePageMeta({
    showRightWidgets: false,
    showContactSidebarCard: false,
    documentDriven: false,
    rightSidebarPreset: "dashboard",
  });
}

if (typeof useSeoMeta === "function") {
  useSeoMeta(() => ({
    description: pageDescription.value,
  }));
}
</script>

<style scoped src="~/assets/styles/pages/world-explorer.scss" lang="scss"></style>
