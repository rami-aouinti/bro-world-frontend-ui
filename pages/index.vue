<template>
  <main
    class="world-explorer-page"
    aria-labelledby="world-explorer-heading"
  >
    <header
      class="world-explorer-page__header"
      aria-labelledby="world-explorer-heading"
    >
      <h1
        id="world-explorer-heading"
        class="world-explorer-page__title"
      >
        {{ t("pages.index.title") }}
      </h1>
      <p class="world-explorer-page__description">
        {{ pageDescription }}
      </p>
    </header>

    <section
      v-if="filteredWorlds.length"
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
          v-for="world in filteredWorlds"
          :key="world.id"
          :world="world"
          :membership="membershipMap[world.id] ?? null"
          :is-active="activeWorldIds.includes(world.id)"
          class="world-explorer-page__card"
          data-test="world-explorer-card"
          @activate="setActiveWorld"
        />
      </div>
    </section>
    <SidebarCard
      v-else-if="hasWorlds"
      class="world-explorer-page__empty"
      glow
      data-test="world-explorer-empty"
    >
      <div>
        <h2 class="world-explorer-page__empty-title">
          {{ t("pages.index.search.noResults", { query: searchQueryLabel }) }}
        </h2>
        <p class="world-explorer-page__empty-description">
          {{ t("pages.index.search.suggestions") }}
        </p>
      </div>
    </SidebarCard>

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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta, useSeoMeta } from "#imports";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import WorldExplorerCard from "~/components/world/WorldExplorerCard.vue";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useWorldSearchQuery } from "~/composables/useWorldSearch";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings } from "~/types/settings";
import { useWorldMembershipsStore } from "~/stores/world-memberships";

const { t } = useI18n();
const siteSettingsState = useSiteSettingsState();
const membershipStore = useWorldMembershipsStore();

const fallbackSettings = computed<SiteSettings>(() => getDefaultSiteSettings());
const siteSettings = computed(() => siteSettingsState.value ?? fallbackSettings.value);
const worlds = computed(() => siteSettings.value.worlds ?? []);
const worldSearchQuery = useWorldSearchQuery();
const searchQueryDisplay = computed(() =>
  typeof worldSearchQuery.value === "string"
    ? worldSearchQuery.value
    : String(worldSearchQuery.value ?? ""),
);
const searchQueryLabel = computed(() => {
  const trimmed = searchQueryDisplay.value.trim();
  return trimmed || searchQueryDisplay.value;
});
const normalizedSearchQuery = computed(() => {
  const query = searchQueryDisplay.value.trim().toLowerCase();
  return query;
});
const filteredWorlds = computed(() => {
  if (!normalizedSearchQuery.value) {
    return worlds.value;
  }

  return worlds.value.filter((world) => {
    const segments: string[] = [];

    if (typeof world.name === "string") {
      segments.push(world.name);
    }

    if (typeof world.slug === "string") {
      segments.push(world.slug);
    }

    if (typeof world.description === "string") {
      segments.push(world.description);
    }

    if (typeof world.locale === "string") {
      segments.push(world.locale);
    }

    if (typeof world.visibility === "string") {
      segments.push(world.visibility);
    }

    if (world.tags?.length) {
      segments.push(world.tags.join(" "));
    }

    if (typeof world.createdBy?.name === "string") {
      segments.push(world.createdBy.name);
    }

    return segments.some((segment) => {
      const candidate = segment.trim().toLowerCase();

      if (!candidate) {
        return false;
      }

      return candidate.includes(normalizedSearchQuery.value);
    });
  });
});
const hasWorlds = computed(() => worlds.value.length > 0);
const activeWorldId = computed(
  () => siteSettings.value.activeWorldId ?? worlds.value[0]?.id ?? null,
);

  if (ids.length > 0) {
    return [...ids];
  }

  const fallbackId = siteSettings.value.activeWorldId ?? worlds.value[0]?.id ?? null;

  return fallbackId ? [fallbackId] : [];
});

async function setActiveWorld(worldId: string) {
  if (!worldId) {
    return;
  }

  const membership = membershipMap.value[worldId] ?? null;

  if (membership?.status === "pending") {
    return;
  }

  try {
    await membershipStore.activateWorld(worldId);
  } catch (error) {
    console.error("Failed to activate world", error);
  }
}

const pageDescription = computed(() => t("pages.index.description"));

if (typeof definePageMeta === "function") {
  definePageMeta({
    showRightWidgets: true,
    showContactSidebarCard: true,
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
