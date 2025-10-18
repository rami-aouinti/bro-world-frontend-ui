<template>
  <section
    class="performance-hero performance-hero--skeleton"
    aria-hidden="true"
  >
    <v-sheet
      class="performance-hero__sheet"
      elevation="0"
      rounded="xl"
    >
      <div
        class="performance-hero__content"
        aria-busy="true"
      >
        <v-skeleton-loader
          class="performance-hero__badge-skeleton"
          type="chip"
        />
        <v-skeleton-loader
          class="performance-hero__title-skeleton"
          type="heading"
        />
        <v-skeleton-loader
          class="performance-hero__description-skeleton"
          type="paragraph"
        />
        <v-skeleton-loader
          class="performance-hero__meta-skeleton"
          type="text"
          width="140"
        />
      </div>
      <div
        class="performance-hero__gauge"
        aria-hidden="true"
      >
        <v-skeleton-loader
          class="performance-hero__gauge-skeleton"
          type="image"
        />
      </div>
    </v-sheet>
  </section>
</template>

<style scoped>
.performance-hero--skeleton {
  padding-block: clamp(2rem, 4vw, 3rem);
}

.performance-hero__sheet {
  display: grid;
  gap: clamp(2rem, 4vw, 4rem);
  padding: clamp(2.5rem, 5vw, 3.5rem);
}

@media (min-width: 960px) {
  .performance-hero__sheet {
    grid-template-columns: minmax(0, 1fr) minmax(200px, 360px);
    align-items: center;
  }
}

.performance-hero__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-hero__badge-skeleton,
.performance-hero__meta-skeleton {
  max-inline-size: 160px;
}

.performance-hero__title-skeleton {
  max-inline-size: 320px;
  block-size: 2.5rem;
}

.performance-hero__description-skeleton {
  max-inline-size: 360px;
}

.performance-hero__gauge {
  display: flex;
  justify-content: center;
}

.performance-hero__gauge-skeleton {
  inline-size: clamp(180px, 20vw, 220px);
  block-size: clamp(180px, 20vw, 220px);
  border-radius: 50%;
}
</style>
