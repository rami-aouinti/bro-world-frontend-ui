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
      <!-- SI actif : on entre (navigation SPA fiable via :to objet) -->
      <v-btn
          v-if="isActive"
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

      <!-- SINON : on active (pas de navigation ici) -->
      <v-btn
          v-else
          class="world-explorer-card__action"
          variant="outlined"
          color="primary"
          density="comfortable"
          size="large"
          block
          :aria-label="t('pages.index.actions.activateAria', { world: world.name })"
          @click="handleActivate"
      >
        {{ t("pages.index.actions.setActive") }}
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  border-radius: 1rem;
  padding: 1.25rem;
  background:
      radial-gradient(120% 100% at 10% 0%, color-mix(in oklab, hsl(var(--primary)) 12%, transparent) 0%, transparent 60%),
      linear-gradient(180deg, color-mix(in oklab, hsl(var(--card)) 96%, transparent) 0%, color-mix(in oklab, hsl(var(--card)) 85%, transparent) 100%);
  border: 1px solid color-mix(in oklab, hsl(var(--primary)) 22%, hsl(var(--border)));
  box-shadow:
      0 1px 0 0 color-mix(in oklab, hsl(var(--primary)) 20%, transparent) inset,
      0 12px 30px -12px rgba(0,0,0,.45);
  backdrop-filter: blur(6px);
  transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
  isolation: isolate;
}
.world-explorer-card::after {
  content: "";
  position: absolute; inset: 0; pointer-events: none; opacity: .7;
  background-image:
      radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,.12) 50%, transparent 52%),
      radial-gradient(1.5px 1.5px at 75% 65%, rgba(255,255,255,.1) 50%, transparent 52%),
      radial-gradient(1.2px 1.2px at 40% 80%, rgba(255,255,255,.08) 50%, transparent 52%);
}
.world-explorer-card:hover {
  transform: translateY(-4px);
  box-shadow:
      0 1px 0 0 color-mix(in oklab, hsl(var(--primary)) 25%, transparent) inset,
      0 16px 44px -14px rgba(0,0,0,.55);
  border-color: color-mix(in oklab, hsl(var(--primary)) 36%, hsl(var(--border)));
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

@media (prefers-reduced-motion: reduce) {
  .world-explorer-card { transition: none; }
  .world-explorer-card:hover { transform: none; }
}
</style>
