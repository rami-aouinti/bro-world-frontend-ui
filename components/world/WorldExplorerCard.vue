<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
    :aria-label="ariaLabel"
  >
    <div class="world-explorer-card__header">
      <div class="world-explorer-card__heading">
        <v-chip
          class="world-explorer-card__visibility"
          size="small"
          variant="outlined"
          color="primary"
        >
          {{ visibilityLabel }}
        </v-chip>
        <h3 class="world-explorer-card__title">
          {{ world.name }}
        </h3>
        <p
          v-if="world.description"
          class="world-explorer-card__description"
        >
          {{ world.description }}
        </p>
      </div>
      <v-chip
        v-if="isActive"
        class="world-explorer-card__badge"
        color="primary"
        size="small"
        variant="flat"
      >
        {{ t("pages.index.badges.active") }}
      </v-chip>
    </div>

    <div class="world-explorer-card__meta">
      <div
        v-if="creatorName"
        class="world-explorer-card__creator"
      >
        <Icon
          class="world-explorer-card__creator-icon"
          name="mdi:account-circle-outline"
          size="20"
        />
        <span class="world-explorer-card__creator-label">
          {{ t("pages.index.createdBy", { name: creatorName }) }}
          <span
            v-if="creatorHandle"
            class="world-explorer-card__creator-handle"
          >
            {{ creatorHandle }}
          </span>
        </span>
      </div>
      <v-chip
        v-if="world.locale"
        class="world-explorer-card__locale"
        size="small"
        variant="tonal"
        color="primary"
      >
        {{ t("pages.index.localeLabel", { locale: world.locale.toUpperCase() }) }}
      </v-chip>
    </div>

    <div class="world-explorer-card__actions">
      <v-btn
        class="world-explorer-card__action"
        color="primary"
        variant="flat"
        append-icon="mdi:arrow-right"
        block
        :to="targetRoute"
        :aria-label="t('pages.index.actions.enterAria', { world: world.name })"
      >
        {{ t("pages.index.actions.enter") }}
      </v-btn>
      <v-btn
        class="world-explorer-card__action"
        variant="tonal"
        color="primary"
        block
        :disabled="isActive"
        :aria-label="t('pages.index.actions.activateAria', { world: world.name })"
        @click="handleActivate"
      >
        {{ isActive ? t("pages.index.actions.active") : t("pages.index.actions.setActive") }}
      </v-btn>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Icon } from "#components";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import type { SiteWorldSettings } from "~/types/settings";

const props = defineProps<{
  world: SiteWorldSettings;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  (event: "activate", worldId: string): void;
}>();

const { t } = useI18n();

const targetRoute = computed(() =>
  props.world.slug === "home" ? "/home" : `/world/${props.world.slug}`,
);

const visibilityLabel = computed(() => {
  const visibility = (props.world.visibility ?? "private").toLowerCase();

  if (visibility === "public") {
    return t("pages.index.visibility.public");
  }

  return t("pages.index.visibility.private");
});

const creatorName = computed(() => props.world.createdBy?.name ?? null);
const creatorHandle = computed(() => props.world.createdBy?.handle ?? null);

const ariaLabel = computed(() =>
  t("pages.index.cardAria", {
    name: props.world.name,
    visibility: visibilityLabel.value,
  }),
);

function handleActivate() {
  emit("activate", props.world.id);
}
</script>

<style scoped>
.world-explorer-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.world-explorer-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.world-explorer-card__heading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.world-explorer-card__visibility {
  align-self: flex-start;
}

.world-explorer-card__title {
  font-size: clamp(1.5rem, 2vw + 1rem, 1.875rem);
  line-height: 1.2;
  font-weight: 600;
  margin: 0;
}

.world-explorer-card__description {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.95rem;
}

.world-explorer-card__badge {
  font-weight: 600;
}

.world-explorer-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.world-explorer-card__creator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
}

.world-explorer-card__creator-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.world-explorer-card__creator-handle {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
}

.world-explorer-card__creator-icon {
  color: hsl(var(--primary));
}

.world-explorer-card__actions {
  display: grid;
  gap: 0.75rem;
}

.world-explorer-card__action {
  text-transform: none;
}
</style>
