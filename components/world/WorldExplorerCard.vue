<template>
  <SidebarCard
      class="world-explorer-card text-card-foreground px-3 py-2"
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

        <NuxtLink :to="targetRoute">
          <h5 class="world-explorer-card__title">
            {{ truncatedWorldName }}
          </h5>
        </NuxtLink>
      </div>

      <v-chip
          v-if="isActive"
          class="world-explorer-card__badge"
          color="success"
          size="small"
          variant="flat"
      >
      </v-chip>

      <v-chip
          v-else
          class="world-explorer-card__badge"
          color="error"
          size="small"
          variant="flat"
      >
      </v-chip>
    </div>

    <div class="world-explorer-card__meta">
      <v-chip
          v-if="creatorName"
          class="world-explorer-card__locale"
          size="small"
          variant="tonal"
          color="primary"
      >
        {{ t("pages.index.createdBy", { name: truncatedCreatorName }) }}
      </v-chip>
    </div>

    <div class="world-explorer-card__actions">
      <v-btn
          class="world-explorer-card__action"
          variant="outlined"
          color="primary"
          density="comfortable"
          size="large"
          block
          :to="targetRoute"
          :aria-label="t('pages.index.actions.enterAria', { world: world.name })"
      >
        {{ t("pages.index.actions.enter") }}
      </v-btn>

      <v-btn
          class="world-explorer-card__action"
          variant="outlined"
          color="primary"
          density="comfortable"
          size="large"
          block
          :disabled="isActive"
          :aria-label="activateButtonAriaLabel"
          @click="handleActivate"
      >
        {{ activateButtonLabel }}
      </v-btn>
    </div>

    <div
        v-if="showFooter"
        class="world-explorer-card__footer"
    >
      <div
          v-if="hasParticipants"
          class="world-explorer-card__stat"
      >
        <Icon
            name="lucide:users"
            class="world-explorer-card__stat-icon"
            aria-hidden="true"
        />
        <span class="world-explorer-card__stat-text">
          {{ participantsLabel }}
        </span>
      </div>

      <div
          v-if="hasRating"
          class="world-explorer-card__stat"
      >
        <Icon
            name="lucide:star"
            class="world-explorer-card__stat-icon"
            aria-hidden="true"
        />
        <span class="world-explorer-card__stat-text">
          {{ ratingLabel }}
        </span>
      </div>
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

const emit = defineEmits<{ (event: "activate", worldId: string): void }>();
const { t } = useI18n();

/** Utiliser un OBJET route => plus fiable avec v-btn/RouterLink */
const targetRoute = computed(() => {
  const slug = props.world.slug?.trim() || props.world.id;
  return { path: `/world/${slug}` };
});

const visibilityLabel = computed(() => {
  const visibility = (props.world.visibility ?? "private").toLowerCase();
  return visibility === "public"
      ? t("pages.index.visibility.public")
      : t("pages.index.visibility.private");
});

const creatorName = computed(() => props.world.createdBy?.name ?? "");
const truncatedCreatorName = computed(() =>
    creatorName.value.length > 7 ? creatorName.value.slice(0, 7) + "…" : creatorName.value
);

const truncatedWorldName = computed(() => {
  const name = props.world?.name ?? "";
  return name.length > 7 ? name.slice(0, 7) + "…" : name;
});

const participantsCount = computed(() => {
  const value = props.world.participantsCount;
  return typeof value === "number" ? Math.max(0, Math.round(value)) : null;
});

const formattedParticipantsCount = computed(() => {
  if (participantsCount.value === null) {
    return "";
  }

  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(participantsCount.value);
});

const participantsLabel = computed(() =>
    participantsCount.value === null
      ? ""
      : t("pages.index.participantsLabel", { count: formattedParticipantsCount.value }),
);

const ratingValue = computed(() => {
  const value = props.world.rating;

  if (typeof value !== "number") {
    return null;
  }

  const clamped = Math.min(Math.max(value, 0), 5);
  return Math.round(clamped * 10) / 10;
});

const formattedRating = computed(() => {
  if (ratingValue.value === null) {
    return "";
  }

  const hasDecimal = Math.abs(ratingValue.value % 1) > Number.EPSILON;
  return ratingValue.value.toFixed(hasDecimal ? 1 : 0);
});

const ratingLabel = computed(() =>
    ratingValue.value === null
      ? ""
      : t("pages.index.ratingLabel", { rating: formattedRating.value }),
);

const hasParticipants = computed(() => participantsCount.value !== null);
const hasRating = computed(() => ratingValue.value !== null);
const showFooter = computed(() => hasParticipants.value || hasRating.value);

const activateButtonLabel = computed(() =>
    props.isActive
      ? t("pages.index.actions.active")
      : t("pages.index.actions.setActive"),
);

const activateButtonAriaLabel = computed(() =>
    props.isActive
      ? t("pages.index.actions.active")
      : t("pages.index.actions.activateAria", { world: props.world.name }),
);

const ariaLabel = computed(() =>
    t("pages.index.cardAria", {
      name: props.world.name,
      visibility: visibilityLabel.value,
    }),
);

function handleActivate() {
  if (props.isActive) {
    return;
  }

  emit("activate", props.world.id);
}
</script>

<style scoped>
.world-explorer-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  border-radius: 1rem;
  padding: 1.25rem;
  transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
  isolation: isolate;
}
.world-explorer-card::after {
  content: "";
  position: absolute; inset: 0; pointer-events: none; opacity: .7;
}
.world-explorer-card:hover {
  transform: translateY(-4px);
}
.world-explorer-card:focus-within {
  outline: 0;
  box-shadow:
      0 0 0 2px color-mix(in oklab, hsl(var(--primary)) 25%, transparent),
      0 12px 32px -10px rgba(0,0,0,.5);
}

.world-explorer-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.world-explorer-card__heading { display: grid; gap: .5rem; }
.world-explorer-card__visibility { align-self: flex-start; letter-spacing: .3px; }

.world-explorer-card__title {
  line-height: 1.2; font-weight: 700;
  font-size: clamp(1.15rem, 0.6rem + 1.2vw, 1.35rem); margin: 0;
}
.world-explorer-card__badge { font-weight: 700; border-radius: 999px; }

.world-explorer-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem .75rem; }

.world-explorer-card__actions { display: grid; gap: .6rem; margin-top: .25rem; }
.world-explorer-card__action { text-transform: none; font-weight: 600; border-radius: .9rem; }

.world-explorer-card__footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  color: color-mix(in oklab, hsl(var(--muted-foreground)), hsl(var(--foreground)) 35%);
}

.world-explorer-card__stat { display: inline-flex; align-items: center; gap: .4rem; font-weight: 600; font-size: .85rem; }
.world-explorer-card__stat-icon { width: 1rem; height: 1rem; opacity: .9; }
.world-explorer-card__stat-text { display: inline-flex; align-items: center; gap: .25rem; }

@media (prefers-reduced-motion: reduce) {
  .world-explorer-card { transition: none; }
  .world-explorer-card:hover { transform: none; }
}
</style>
