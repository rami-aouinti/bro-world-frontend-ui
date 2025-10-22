<template>
  <HomePage />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { createError, definePageMeta, showError, useRoute, useSeoMeta } from "#imports";
import HomePage from "~/pages/home.vue";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { usePostsStore } from "~/composables/usePostsStore";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import type { SiteSettings, SiteWorldSettings } from "~/types/settings";
import { useWorldMembershipsStore } from "~/stores/world-memberships";

const route = useRoute();
const { t } = useI18n();
const siteSettingsState = useSiteSettingsState();
const membershipStore = useWorldMembershipsStore();
const fallbackSettings = computed<SiteSettings>(() => getDefaultSiteSettings());
const siteSettings = computed(() => siteSettingsState.value ?? fallbackSettings.value);
const worlds = computed(() => siteSettings.value.worlds ?? []);

function normalizeSlug(raw: unknown): string {
  if (typeof raw !== "string") {
    if (Array.isArray(raw)) {
      const candidate = raw.find((entry) => typeof entry === "string");
      return typeof candidate === "string" ? candidate.trim().toLowerCase() : "";
    }

    if (raw == null) {
      return "";
    }

    return String(raw ?? "")
      .trim()
      .toLowerCase();
  }

  return raw.trim().toLowerCase();
}

const slugParam = computed(() => normalizeSlug(route.params?.slug));

function matchesWorld(world: SiteWorldSettings, slug: string): boolean {
  const worldSlug = world.slug?.trim().toLowerCase() ?? "";
  const worldId = world.id?.trim().toLowerCase() ?? "";

  return slug ? worldSlug === slug || worldId === slug : false;
}

const world = computed<SiteWorldSettings | null>(() => {
  const slug = slugParam.value;

  if (!slug) {
    return worlds.value[0] ?? null;
  }

  return worlds.value.find((entry) => matchesWorld(entry, slug)) ?? null;
});

if (!world.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

function setActiveWorld(worldId: string) {
  if (!worldId) {
    return;
  }

  membershipStore.markActive(worldId);
}

const pageTitle = computed(() => {
  const name = world.value?.name?.trim();

  if (name) {
    return `${name} • ${t("blog.hero.eyebrow")}`;
  }

  return t("blog.hero.title");
});

const pageDescription = computed(
  () => world.value?.description?.trim() || t("blog.hero.description"),
);

if (typeof definePageMeta === "function") {
  definePageMeta({
    showRightWidgets: true,
    showContactSidebarCard: true,
    documentDriven: false,
    rightSidebarPreset: "dashboard",
    requiresPlugin: "blog",
    navbarSearchContext: "posts",
  });
}

if (typeof useSeoMeta === "function") {
  useSeoMeta(() => ({
    title: pageTitle.value,
    description: pageDescription.value,
  }));
}

const { fetchPosts } = usePostsStore();
const lastLoadedWorldId = ref<string | null>(null);
const pendingLoad = ref<Promise<void> | null>(null);
const INITIAL_PAGE_SIZE = 6;

async function loadPostsForWorld(worldId: string, { force = false } = {}) {
  if (!worldId) {
    return;
  }

  const params: Record<string, unknown> = { pageSize: INITIAL_PAGE_SIZE, worldId };
  const loadPromise = fetchPosts(1, { force, params })
    .then(() => {
      lastLoadedWorldId.value = worldId;
    })
    .finally(() => {
      if (pendingLoad.value === loadPromise) {
        pendingLoad.value = null;
      }
    });

  pendingLoad.value = loadPromise;

  await loadPromise;
}

const initialWorldId = world.value?.id ?? null;

if (initialWorldId) {
  setActiveWorld(initialWorldId);

  if (import.meta.server) {
    try {
      await loadPostsForWorld(initialWorldId, { force: true });
    } catch (error) {
      console.error("Failed to preload world posts", error);
    }
  }
}

if (import.meta.client) {
  watch(
    () => world.value,
    (nextWorld) => {
      if (!nextWorld) {
        showError(createError({ statusCode: 404, statusMessage: "Page Not Found" }));
        return;
      }

      setActiveWorld(nextWorld.id);

      const hasLoadedWorld = lastLoadedWorldId.value !== null;
      const isSameWorld = nextWorld.id === lastLoadedWorldId.value;

      if (isSameWorld) {
        return;
      }

      void loadPostsForWorld(nextWorld.id, { force: hasLoadedWorld });
    },
    { immediate: true },
  );
}
</script>
