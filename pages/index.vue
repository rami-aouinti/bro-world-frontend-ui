<template>
  <main
    class="world-explorer-page"
    aria-labelledby="world-explorer-heading"
  >
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
          :membership="membershipMap[world.id] ?? null"
          :is-active="activeWorldIds.includes(world.id)"
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
import { useWorldMembershipsStore } from "~/stores/world-memberships";

const { t } = useI18n();
const siteSettingsState = useSiteSettingsState();
const membershipStore = useWorldMembershipsStore();

const fallbackSettings = computed<SiteSettings>(() => getDefaultSiteSettings());
const siteSettings = computed(() => siteSettingsState.value ?? fallbackSettings.value);
const worlds = computed(() => siteSettings.value.worlds ?? []);
const membershipMap = computed(() => membershipStore.memberships);
const activeWorldIds = computed(() => {
  const ids = membershipStore.activeWorldIds.value;

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
