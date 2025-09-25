<template>
  <aside class="space-y-6">
    <section class="app-card widget-card" aria-labelledby="weather-card-heading">
      <header class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">{{ t('layout.widgets.weather.title') }}</p>
          <h3 id="weather-card-heading" class="mt-1 text-lg font-semibold text-foreground">{{ weather.city }}</h3>
        </div>
        <v-icon icon="mdi-weather-partly-cloudy" size="32" class="text-primary" aria-hidden="true" />
      </header>
      <div class="mt-6 flex items-end justify-between">
        <p class="text-4xl font-bold text-foreground">{{ weather.temperature }}</p>
        <div class="text-right text-sm text-muted-foreground">
          <p>{{ weather.condition }}</p>
          <p>{{ weather.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="app-card widget-card" aria-labelledby="news-card-heading">
      <header class="flex items-center justify-between">
        <h3 id="news-card-heading" class="text-lg font-semibold text-foreground">{{ t('layout.widgets.news.title') }}</h3>
        <v-icon icon="mdi-newspaper-variant" size="24" class="text-primary" aria-hidden="true" />
      </header>
      <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
        <li v-for="article in news" :key="article.title" class="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          <p class="font-medium text-foreground">{{ article.title }}</p>
          <p class="mt-1 text-xs uppercase tracking-wide text-primary/80">{{ article.timestamp }}</p>
        </li>
      </ul>
    </section>

    <section class="app-card widget-card relative overflow-hidden" aria-labelledby="rating-card-heading">
      <header class="flex items-center justify-between">
        <h3 id="rating-card-heading" class="text-lg font-semibold text-foreground">{{ t('layout.widgets.rating.title') }}</h3>
        <v-icon icon="mdi-star-circle" size="28" class="text-primary" aria-hidden="true" />
      </header>
      <div class="mt-6">
        <p class="text-5xl font-bold text-foreground">0.0</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ t('layout.widgets.rating.subtitle') }}</p>
      </div>
      <div
        class="fab-stack"
        role="group"
        :aria-label="t('layout.widgets.rating.actionsLabel')"
      >
        <v-btn
          class="fab"
          color="primary"
          variant="flat"
          icon="mdi-pencil"
          size="large"
          :aria-label="t('layout.widgets.rating.edit')"
        />
        <v-btn
          class="fab"
          color="primary"
          variant="flat"
          icon="mdi-share-variant"
          size="large"
          :aria-label="t('layout.widgets.rating.share')"
        />
      </div>
    </section>

    <section class="app-card widget-card" aria-labelledby="feed-card-heading">
      <header class="flex items-center justify-between">
        <h3 id="feed-card-heading" class="text-lg font-semibold text-foreground">{{ t('layout.widgets.feed.title') }}</h3>
        <v-icon icon="mdi-view-dashboard" size="24" class="text-primary" aria-hidden="true" />
      </header>
      <div class="mt-5 space-y-3">
        <div class="h-4 w-3/4 animate-pulse rounded-full bg-primary/10" />
        <div class="h-4 w-full animate-pulse rounded-full bg-primary/10" />
        <div class="h-4 w-2/3 animate-pulse rounded-full bg-primary/10" />
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
const { t } = useI18n()

const weather = computed(() => ({
  city: 'Berlin 12.4°C',
  temperature: '12.4°',
  condition: t('layout.widgets.weather.condition'),
  subtitle: t('layout.widgets.weather.subtitle'),
}))

const news = computed(() => [
  {
    title: t('layout.widgets.news.items.0.title'),
    timestamp: t('layout.widgets.news.items.0.timestamp'),
  },
  {
    title: t('layout.widgets.news.items.1.title'),
    timestamp: t('layout.widgets.news.items.1.timestamp'),
  },
])
</script>

<style scoped>
.app-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--pink-shadow);
  padding: 24px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  min-height: 180px;
}

.widget-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab-stack {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab {
  box-shadow: 0 10px 25px rgba(243, 126, 205, 0.35);
}

.fab :deep(.v-btn__overlay) {
  border-radius: 9999px;
}
</style>
