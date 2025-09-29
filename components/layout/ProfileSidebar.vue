<!-- components/ProfileSidebar.vue -->
<template>
  <div class="profile-sidebar">
    <!-- INTRO -->
    <BaseCard as="article"
              variant="solid"
              padding="sm"
              rounded="xl"
              spacing="sm"
              class="group relative my-3 w-full max-w-3xl border border-slate-200 bg-white/95 text-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg"
              header-class="gap-4"
              body-class="flex flex-col gap-6 text-slate-700"
              footer-class="flex flex-wrap items-center gap-3 text-sm text-slate-500"
              :footer-divider="false">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <div class="text-h6">{{ user.name }}</div>
          <v-btn size="small" variant="text" color="primary" @click="$emit('edit-bio')">
            {{ t('layout.profileSidebar.editBio') }}
          </v-btn>
        </div>
      </v-card-item>
      <v-divider />
      <v-card-text>
        <div class="text-subtitle-2 mb-3 text-high-emphasis text-center" v-if="user.bio">{{ user.bio }}</div>

        <v-list density="compact" class="py-0">
          <v-list-item v-for="(item, i) in introItems" :key="i" :title="item.title" :subtitle="item.subtitle">
            <template #prepend>
              <Icon :name="item.icon" />
            </template>
          </v-list-item>
        </v-list>

        <div class="d-flex ga-3 mt-4">
          <v-btn block color="primary" variant="tonal" @click="$emit('edit-details')">
            {{ t('layout.profileSidebar.editDetails') }}
          </v-btn>
          <v-btn block color="primary" variant="outlined" @click="$emit('add-featured')">
            {{ t('layout.profileSidebar.addFeatured') }}
          </v-btn>
        </div>
      </v-card-text>
    </BaseCard>

    <!-- PHOTOS -->
    <BaseCard as="article"
              variant="solid"
              padding="sm"
              rounded="xl"
              spacing="sm"
              class="group relative my-3 w-full max-w-3xl border border-slate-200 bg-white/95 text-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg"
              header-class="gap-4"
              body-class="flex flex-col gap-6 text-slate-700"
              footer-class="flex flex-wrap items-center gap-3 text-sm text-slate-500"
              :footer-divider="false">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-semibold">{{ t('layout.profileSidebar.photosTitle') }}</div>
          <v-btn size="small" variant="text" color="primary" @click="$emit('view-all-photos')">
            {{ t('layout.profileSidebar.viewAllPhotos') }}
          </v-btn>
        </div>
      </v-card-item>
      <v-card-text>
        <div class="photos-grid">
          <v-img
              v-for="(photo, i) in photos.slice(0, 9)"
              :key="photo.id ?? i"
              :src="photo.src"
              :alt="photo.alt ?? ('photo-'+i)"
              aspect-ratio="1"
              cover
              class="rounded-lg"
          />
        </div>
      </v-card-text>
    </BaseCard>

    <!-- FRIENDS -->
    <BaseCard as="article"
              variant="solid"
              padding="sm"
              rounded="xl"
              spacing="sm"
              class="group relative my-3 w-full max-w-3xl border border-slate-200 bg-white/95 text-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg"
              header-class="gap-4"
              body-class="flex flex-col gap-6 text-slate-700"
              footer-class="flex flex-wrap items-center gap-3 text-sm text-slate-500"
              :footer-divider="false">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-semibold">
            {{ t('layout.profileSidebar.friendsTitle') }} <span class="text-medium-emphasis">· {{ friendsCount }}</span>
          </div>
          <v-btn size="small" variant="text" color="primary" @click="$emit('view-all-friends')">
            {{ t('layout.profileSidebar.viewAllFriends') }}
          </v-btn>
        </div>
      </v-card-item>
      <v-card-text>
        <div class="friends-grid">
          <div
              v-for="(f, i) in friends.slice(0, 9)"
              :key="f.id ?? i"
              class="friend-card"
              @click="$emit('open-friend', f)"
          >
            <v-avatar size="72" class="mb-2">
              <v-img :src="f.avatar" :alt="f.name" cover />
            </v-avatar>
            <div class="friend-name">{{ f.name }}</div>
          </div>
        </div>
      </v-card-text>
    </BaseCard>

  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {BaseCard} from "~/components/ui";

type IntroItem = { icon: string; title: string; subtitle?: string }
type Photo = { id?: string|number; src: string; alt?: string }
type Friend = { id?: string|number; name: string; avatar: string }
type LifeEvent = { id?: string|number; title: string; date?: string; description?: string }

const props = defineProps<{
  user: {
    name: string
    bio?: string
    livesIn?: string
    from?: string
    schools?: string[]
  }
  photos: Photo[]
  friends: Friend[]
  friendsCount?: number
  lifeEvents: LifeEvent[]
}>()

const { t } = useI18n()

const friendsCount = computed(() => props.friendsCount ?? props.friends?.length ?? 0)

const introItems = computed<IntroItem[]>(() => {
  const items: IntroItem[] = []
  if (props.user.schools?.length) {
    props.user.schools.forEach(s =>
        items.push({ icon: 'mdi-school-outline', title: s })
    )
  }
  if (props.user.livesIn) items.push({ icon: 'mdi-home-map-marker', title: t('layout.profileSidebar.livesIn', { location: props.user.livesIn }) })
  if (props.user.from) items.push({ icon: 'mdi-map-marker', title: t('layout.profileSidebar.from', { location: props.user.from }) })
  return items
})
</script>

<style scoped>

/* Grille photos carrée */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* Grille amis 3 colonnes */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.friend-card {
  text-align: center;
  cursor: pointer;
}
.friend-name {
  font-size: 0.85rem;
  line-height: 1.2;
}

/* Responsive: sur < 960px on laisse la page gérer l’empilement */
@media (max-width: 960px) {
  .profile-sidebar { position: static; top: 0; }
}
</style>
