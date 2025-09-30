<template>
  <div class="card-story">
    <section
      v-for="theme in themes"
      :key="theme.key"
      :class="['card-story__theme', theme.class]"
      :data-theme="theme.key"
    >
      <h3 class="card-story__title">{{ theme.label }}</h3>
      <div class="card-story__grid">
        <BaseCard
          v-for="variant in variants"
          :key="`${theme.key}-${variant.variant}`"
          :variant="variant.variant"
          :hoverable="variant.hoverable ?? true"
          :padding="variant.padding ?? 'md'"
          :rounded="variant.rounded ?? 'xl'"
          :spacing="variant.spacing ?? 'md'"
        >
          <template
            v-if="variant.media"
            #media
          >
            <div class="card-story__media" />
          </template>

          <template #header>
            <div class="card-story__header">
              <div>
                <p class="card-story__heading">{{ variant.label }}</p>
                <p class="card-story__subtitle">{{ variant.subtitle }}</p>
              </div>
              <span
                v-if="variant.badge"
                class="card-story__badge"
                >{{ variant.badge }}</span
              >
            </div>
          </template>

          <p>{{ variant.description }}</p>

          <template #footer>
            <span class="card-story__footer">{{ variant.footer }}</span>
            <div class="card-story__pill" />
          </template>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BaseCard } from "../index";

const themes = [
  { key: "light", label: "Thème clair", class: "v-theme--light" },
  { key: "dark", label: "Thème sombre", class: "v-theme--dark dark" },
] as const;

const variants = [
  {
    variant: "solid",
    label: "Solid",
    subtitle: "Surface principale",
    description:
      "La variante solide repose sur la surface principale du thème et convient aux contenus riches et structurés.",
    footer: "Mis à jour il y a 2 heures",
    badge: "Nouveau",
  },
  {
    variant: "muted",
    label: "Muted",
    subtitle: "Surface atténuée",
    description:
      "Utilisez-la pour des encarts secondaires ou des résumés, elle reste lisible tout en étant plus discrète.",
    footer: "Rappel prévu demain",
  },
  {
    variant: "outline",
    label: "Outline",
    subtitle: "Contour marqué",
    description:
      "Met en avant les séparations et fonctionne bien pour des listes d’actions ou des aperçus de contenus.",
    footer: "Détails disponibles",
  },
  {
    variant: "glass",
    label: "Glass",
    subtitle: "Effet verre dépoli",
    description:
      "Combine un arrière-plan translucide et une bordure douce, idéal pour superposer du contenu visuel.",
    footer: "Voir la galerie",
    media: true,
  },
  {
    variant: "gradient",
    label: "Gradient",
    subtitle: "Accent primaire",
    description:
      "Parfaite pour mettre en avant une action ou une annonce importante avec un dégradé basé sur le thème.",
    footer: "Appel à l’action",
    rounded: "lg",
    padding: "sm",
  },
] as const;
</script>

<style scoped>
.card-story {
  display: grid;
  gap: var(--ui-spacing-6);
}

.card-story__theme {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-5);
  padding: var(--ui-spacing-6);
  border-radius: var(--ui-radius-lg);
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  box-shadow: 0 20px 55px rgba(var(--v-theme-shadow), 0.12);
}

.card-story__title {
  font-size: var(--v-text-h5-size);
  font-weight: var(--v-text-h5-weight, 600);
  letter-spacing: var(--v-text-h5-letter-spacing, -0.0025em);
}

.card-story__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--ui-spacing-5);
}

.card-story__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-spacing-4);
}

.card-story__heading {
  font-size: var(--v-text-body-1-size);
  font-weight: 600;
  margin: 0;
}

.card-story__subtitle {
  margin: 0;
  margin-top: 0.25rem;
  font-size: var(--v-text-body-2-size);
  color: rgba(var(--v-theme-on-surface-variant), 0.85);
}

.card-story__badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--ui-radius-pill);
  padding-inline: var(--ui-spacing-3);
  padding-block: 0.25rem;
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.5);
  font-size: 0.75rem;
}

.card-story__media {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: calc(var(--ui-radius-xl) - var(--ui-spacing-2));
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.45);
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.24),
    rgba(var(--v-theme-surface-bright), 0.12)
  );
}

.card-story__footer {
  font-size: var(--v-text-body-2-size);
}

.card-story__pill {
  height: 2.25rem;
  width: 5.5rem;
  border-radius: var(--ui-radius-pill);
  background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
