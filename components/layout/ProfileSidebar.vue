<!-- components/ProfileSidebar.vue -->
<template>
  <div class="sidebar-profile-card">
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
    >
      <div class="sidebar-profile-card__content">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <div class="text-h6 text-foreground">{{ user.name }}</div>
            <v-btn
              v-if="allowCustomization"
              size="small"
              variant="text"
              color="primary"
              :to="localePath('/profile-edit')"
            >
              {{ t("layout.profileSidebar.editBio") }}
            </v-btn>
          </div>
        </v-card-item>
        <v-divider />
        <v-card-text>
          <div
            v-if="displayedBio"
            class="text-subtitle-2 mb-3 text-high-emphasis text-center"
          >
            {{ displayedBio }}
          </div>

          <v-list
            v-if="showIntroDetails && introItems.length"
            density="compact"
            class="py-0"
          >
            <v-list-item
              v-for="(item, i) in introItems"
              :key="i"
              :title="item.title"
              :subtitle="item.subtitle"
            >
              <template #prepend>
                <Icon :name="item.icon" />
              </template>
            </v-list-item>
          </v-list>

          <div class="d-flex ga-3 mt-4">
            <v-btn
              v-if="allowCustomization"
              block
              color="primary"
              variant="tonal"
              :to="localePath('/profile-edit')"
            >
              {{ t("layout.profileSidebar.editDetails") }}
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </SidebarCard>
  </div>
  <div
    v-if="showFriendsSection"
    class="sidebar-profile-card"
  >
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
    >
      <div class="sidebar-profile-card__content">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-semibold text-foreground">
              {{ t("layout.profileSidebar.photosTitle") }}
            </div>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :to="localePath('/profile-photos')"
            >
              {{ t("layout.profileSidebar.viewAllPhotos") }}
            </v-btn>
          </div>
        </v-card-item>
        <v-card-text>
          <div class="photos-grid">
            <v-img
              v-for="(photo, i) in photos.slice(0, 9)"
              :key="photo.id ?? i"
              :src="photo.src"
              :alt="photo.alt ?? 'photo-' + i"
              aspect-ratio="1"
              cover
              class="rounded-lg"
            />
          </div>
        </v-card-text>
      </div>
    </SidebarCard>
  </div>
  <div class="sidebar-profile-card">
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
    >
      <div class="sidebar-profile-card__content">
        <v-card-item>
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-semibold text-foreground">
              {{ t("layout.profileSidebar.friendsTitle") }}
              <span class="text-medium-emphasis">· {{ friendsCount }}</span>
            </div>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :to="localePath('/profile-friends')"
            >
              {{ t("layout.profileSidebar.viewAllFriends") }}
            </v-btn>
          </div>
        </v-card-item>
        <v-card-text>
          <div class="friends-grid">
            <div
              v-for="(f, i) in visibleFriends"
              :key="f.id ?? f.username ?? i"
              class="friend-card"
              @click="$emit('open-friend', f)"
            >
              <v-avatar
                size="72"
                class="mb-2"
              >
                <v-img
                  :src="friendAvatar(f)"
                  :alt="friendDisplayName(f)"
                  cover
                />
              </v-avatar>
              <div class="friend-name">{{ friendDisplayName(f) }}</div>
            </div>
          </div>
        </v-card-text>
      </div>
    </SidebarCard>
  </div>
</template>

<script lang="ts" setup>
import { useDevicePixelRatio } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { optimizeAvatarUrl } from "~/lib/images/avatar";

type IntroItem = { icon: string; title: string; subtitle?: string };
type Photo = { id?: string | number; src: string; alt?: string };
type Profile = { id?: string | number; title?: string | null; photo?: string | null };
type FriendProfile = Profile | Profile[] | null | undefined;
type Friend = {
  id?: string | number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  avatar?: string | null;
  profile?: FriendProfile;
};
type LifeEvent = { id?: string | number; title: string; date?: string; description?: string };

const props = defineProps<{
  user: {
    name: string;
    bio?: string;
    livesIn?: string;
    from?: string;
    schools?: string[];
  };
  photos: Photo[];
  friends: Friend[];
  friendsCount?: number;
  lifeEvents: LifeEvent[];
}>();

defineEmits<{
  (e: "edit-bio"): void;
  (e: "edit-details"): void;
  (e: "view-all-photos"): void;
  (e: "view-all-friends"): void;
  (e: "open-friend", friend: Friend): void;
}>();

const { t } = useI18n();
const localePath = useResolvedLocalePath();
const siteSettings = useSiteSettingsState();
const { pixelRatio } = useDevicePixelRatio({ initialValue: 1 });

const normalizedPixelRatio = computed(() => {
  const ratio = pixelRatio.value ?? 1;

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 1;
  }

  return Math.min(3, ratio);
});

const profileSettings = computed(
  () => siteSettings.value?.profile ?? getDefaultSiteSettings().profile,
);

const allowCustomization = computed(() => profileSettings.value.allowCustomization !== false);
const showIntroDetails = computed(() => profileSettings.value.showDetailsSection !== false);
const showFriendsSection = computed(() => profileSettings.value.showSocialSection !== false);
const defaultBio = computed(() => profileSettings.value.defaultBio?.trim() || null);

const defaultAvatar = "/images/avatars/avatar-default.svg";
const friendAvatarDisplaySize = 72;

const friendAvatarPixelSize = computed(() =>
  Math.max(
    friendAvatarDisplaySize,
    Math.round(friendAvatarDisplaySize * normalizedPixelRatio.value),
  ),
);

const friendsList = computed<Friend[]>(() =>
  Array.isArray(props.friends) ? props.friends.filter(Boolean) : [],
);

const visibleFriends = computed(() => friendsList.value.slice(0, 9));

const friendsCount = computed(() => props.friendsCount ?? friendsList.value.length);
const shouldRenderParticles = ref(false);
const displayedBio = computed(() => {
  const rawBio = typeof props.user.bio === "string" ? props.user.bio.trim() : "";
  return rawBio || defaultBio.value;
});
const introItems = computed<IntroItem[]>(() => {
  const items: IntroItem[] = [];
  if (props.user.schools?.length) {
    props.user.schools.forEach((s) => items.push({ icon: "mdi:school-outline", title: s }));
  }
  if (props.user.livesIn)
    items.push({
      icon: "mdi:home-map-marker",
      title: t("layout.profileSidebar.livesIn", { location: props.user.livesIn }),
    });
  if (props.user.from)
    items.push({
      icon: "mdi:map-marker",
      title: t("layout.profileSidebar.from", { location: props.user.from }),
    });
  return items;
});

const friendPlaceholderName = computed(() => t("pages.profile.placeholders.missing"));
const isDark = computed(() => useColorMode().value == "dark");

function friendDisplayName(friend: Friend) {
  const segments = [friend.firstName, friend.lastName]
    .map((segment) => (typeof segment === "string" ? segment.trim() : ""))
    .filter(Boolean);

  if (segments.length) {
    return segments.join(" ");
  }

  const fallbackName = typeof friend.name === "string" ? friend.name.trim() : "";
  if (fallbackName) {
    return fallbackName;
  }

  const username = typeof friend.username === "string" ? friend.username.trim() : "";
  if (username) {
    return username;
  }

  return friendPlaceholderName.value;
}

function resolveProfilePhoto(profile: FriendProfile) {
  if (!profile) {
    return null;
  }

  if (Array.isArray(profile)) {
    for (const entry of profile) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.photo === "string" &&
        entry.photo.trim()
      ) {
        return entry.photo.trim();
      }
    }
    return null;
  }

  if (
    typeof profile === "object" &&
    profile &&
    typeof profile.photo === "string" &&
    profile.photo.trim()
  ) {
    return profile.photo.trim();
  }

  return null;
}

function friendAvatar(friend: Friend) {
  const fromProfile = resolveProfilePhoto(friend.profile);

  const raw = fromProfile
    ? fromProfile
    : typeof friend.avatar === "string" && friend.avatar.trim()
      ? friend.avatar.trim()
      : defaultAvatar;

  return optimizeAvatarUrl(raw, friendAvatarPixelSize.value) ?? raw ?? defaultAvatar;
}
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

.sidebar-profile-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px));
  padding: 0.25rem 0.25rem;
}

.sidebar-profile-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

.sidebar-profile-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
</style>
