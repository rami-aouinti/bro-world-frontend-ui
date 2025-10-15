<template>
  <section
    class="performance-opportunities"
    aria-labelledby="performance-opportunities-title"
  >
    <header class="performance-opportunities__header">
      <h2
        id="performance-opportunities-title"
        class="text-h5 font-weight-semibold mb-1"
      >
        {{ title }}
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ subtitle }}
      </p>
    </header>

    <v-row dense>
      <v-col
        v-for="item in opportunities"
        :key="item.key"
        cols="12"
        md="6"
      >
        <v-card
          class="opportunity-card"
          elevation="0"
          rounded="lg"
        >
          <div class="opportunity-card__header">
            <v-avatar
              :color="item.color"
              class="mr-3"
              variant="tonal"
              size="44"
            >
              <v-icon
                :icon="item.icon"
                size="24"
                aria-hidden="true"
              />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                {{ item.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ item.description }}
              </p>
            </div>
          </div>
          <div class="opportunity-card__details">
            <div class="opportunity-card__badge">
              <span class="opportunity-card__badge-label">{{ item.impact }}</span>
            </div>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ item.action }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
type Opportunity = {
  key: string;
  title: string;
  description: string;
  impact: string;
  action: string;
  icon: string;
  color: string;
};

defineProps<{
  title: string;
  subtitle: string;
  opportunities: Opportunity[];
}>();
</script>

<style scoped>
.performance-opportunities {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.performance-opportunities__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.opportunity-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 90%, transparent);
}

.opportunity-card__header {
  display: flex;
  align-items: flex-start;
}

.opportunity-card__details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
}

.opportunity-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 959px) {
  .opportunity-card__details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
