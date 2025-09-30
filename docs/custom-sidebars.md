# Personnaliser les sidebars du layout par défaut

Le layout par défaut expose désormais des slots nommés permettant aux pages d'injecter leurs propres contenus dans les sidebars gauche et droite tout en bénéficiant de la mise en page standard.

## Exemple

```vue
<template>
  <NuxtLayout name="default">
    <template #left-sidebar="{ items, activeKey, onSelect }">
      <AppSidebar
        :items="items"
        :active-key="activeKey"
        @select="onSelect"
      />
      <v-divider class="my-4" />
      <MyCustomNavigation />
    </template>

    <template #right-sidebar="{ weather, leaderboard, rating, user }">
      <ProfileSidebar
        :user="user"
        :friends="[]"
        :photos="[]"
        :life-events="[]"
      />
      <MyUpcomingEvents />
      <SidebarWeatherCard v-if="weather" :weather="weather" />
    </template>

    <MyPageContent />
  </NuxtLayout>
</template>
```

Les slots fournissent les données déjà utilisées par le layout (`items`, `activeKey`, `onSelect`, `weather`, `leaderboard`, `rating`, `user`) afin d'étendre ou remplacer le comportement existant sans dupliquer la logique.
