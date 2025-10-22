<template>
  <main aria-labelledby="profile-photos-title">
    <header
      class="mb-6"
      aria-describedby="profile-photos-subtitle"
    >
      <SidebarCard
          class="text-card-foreground px-3 py-3"
          glow
      >
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-6">
          <div class="flex-grow-1">
            <h1
              id="profile-photos-title"
              class="text-h4 font-weight-bold mb-2"
            >
              {{ t("pages.profilePhotos.title") }}
            </h1>
            <p
              id="profile-photos-subtitle"
              class="text-body-1 text-medium-emphasis mb-4"
            >
              {{ t("pages.profilePhotos.subtitle") }}
            </p>
            <div class="d-flex flex-wrap gap-4">
              <div
                v-for="stat in collectionStats"
                :key="stat.id"
                class="d-flex flex-column"
              >
                <span class="text-h5 font-weight-semibold">{{ stat.value }}</span>
                <span class="text-body-2 text-medium-emphasis">{{ stat.label }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex flex-column flex-sm-row align-stretch gap-3">
            <v-btn
              color="primary"
              size="large"
              class="flex-grow-1"
              @click="triggerAction('upload')"
            >
              {{ t("pages.profilePhotos.actions.upload") }}
            </v-btn>
            <v-btn
              variant="tonal"
              color="primary"
              size="large"
              class="flex-grow-1"
              @click="triggerAction('create-album')"
            >
              {{ t("pages.profilePhotos.actions.createAlbum") }}
            </v-btn>
          </div>
        </div>
      </SidebarCard>
    </header>

    <v-row dense>
      <v-col
        cols="12"
        xl="8"
      >
        <section
          class="mb-8"
          aria-labelledby="pinned-albums-title"
        >
          <SidebarCard
            class="text-card-foreground pa-6"
            glow
          >
            <div
              class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-6"
            >
              <div>
                <h2
                  id="pinned-albums-title"
                  class="text-h5 font-weight-semibold mb-1"
                >
                  {{ t("pages.profilePhotos.sections.pinned") }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.profilePhotos.meta.updated", { date: highlightedAlbum.updated }) }}
                </p>
              </div>
              <v-chip-group
                v-model="activeFilter"
                selected-class="bg-primary text-primary-on-surface"
                class="flex-wrap"
              >
                <v-chip
                  v-for="filter in filters"
                  :key="filter.id"
                  :value="filter.id"
                  variant="outlined"
                  size="small"
                  class="text-body-2"
                >
                  {{ filter.label }}
                </v-chip>
              </v-chip-group>
            </div>

            <v-row
              dense
              align="stretch"
            >
              <v-col
                cols="12"
                md="6"
              >
                <SidebarCard
                  class="text-card-foreground pa-4 h-100"
                  glow
                >
                  <div class="rounded-xl overflow-hidden mb-4">
                    <NuxtImg
                      :src="highlightedAlbum.cover"
                      :alt="highlightedAlbum.title"
                      fit="cover"
                      style="width: 100%; aspect-ratio: 4 / 3"
                    />
                  </div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-1">
                    {{ highlightedAlbum.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ highlightedAlbum.description }}
                  </p>
                  <div class="d-flex flex-wrap gap-2 text-body-2 text-medium-emphasis">
                    <span
                      >{{ highlightedAlbum.count }}
                      {{ t("pages.profilePhotos.meta.photoCount") }}</span
                    >
                    <span>•</span>
                    <span>{{ highlightedAlbum.location }}</span>
                  </div>
                </SidebarCard>
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <div class="d-flex flex-column gap-3">
                  <SidebarCard
                    v-for="album in secondaryAlbums"
                    :key="album.id"
                    class="text-card-foreground pa-4 bg-primary/10"
                    glow
                  >
                    <div class="d-flex gap-4">
                      <NuxtImg
                        :src="album.cover"
                        :alt="album.title"
                        class="rounded-lg"
                        width="96"
                        height="96"
                        fit="cover"
                      />
                      <div class="flex-grow-1">
                        <div class="d-flex align-center justify-space-between mb-1">
                          <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                            {{ album.title }}
                          </h3>
                          <v-chip
                            size="small"
                            variant="tonal"
                          >
                            {{ album.count }}
                          </v-chip>
                        </div>
                        <p class="text-body-2 text-medium-emphasis mb-2">
                          {{ album.description }}
                        </p>
                        <div class="text-caption text-medium-emphasis">{{ album.updated }}</div>
                      </div>
                    </div>
                  </SidebarCard>
                </div>
              </v-col>
            </v-row>
          </SidebarCard>
        </section>

        <section aria-labelledby="photo-gallery-title">
          <SidebarCard
            class="text-card-foreground pa-6"
            glow
          >
            <div
              class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4 mb-4"
            >
              <div>
                <h2
                  id="photo-gallery-title"
                  class="text-h5 font-weight-semibold mb-1"
                >
                  {{ t("pages.profilePhotos.sections.albums") }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.profilePhotos.cta.share") }}
                </p>
              </div>
              <v-btn
                variant="outlined"
                color="primary"
                size="small"
                @click="triggerAction('share-collection')"
              >
                {{ t("pages.profilePhotos.actions.createAlbum") }}
              </v-btn>
            </div>

            <div class="masonry-grid">
              <div
                v-for="photo in displayedPhotos"
                :key="photo.id"
                class="masonry-item"
              >
                <NuxtImg
                  :src="photo.src"
                  :alt="photo.alt"
                  class="rounded-xl"
                  fit="cover"
                  :style="{ aspectRatio: photo.ratio, width: '100%' }"
                />
                <div class="mt-2 d-flex flex-column gap-1">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-subtitle-2 font-weight-medium">{{ photo.title }}</span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                    >
                      {{ photo.category }}
                    </v-chip>
                  </div>
                  <span class="text-caption text-medium-emphasis">{{ photo.takenAt }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="displayedPhotos.length === 0"
              class="text-body-1 text-medium-emphasis text-center py-8"
            >
              {{ t("pages.profilePhotos.empty") }}
            </div>
          </SidebarCard>
        </section>
      </v-col>
      <v-col
        cols="12"
        xl="4"
        class="lg:hidden"
      >
        <ProfilePhotosSidebar
          :story-milestones="storyMilestones"
          :creative-notes="creativeNotes"
          :timeline-heading-id="timelineHeadingId"
          :notes-heading-id="notesHeadingId"
        />
      </v-col>
    </v-row>

    <v-snackbar
      v-model="showSnackbar"
      timeout="3000"
      color="primary"
      variant="flat"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ProfilePhotosSidebar from "~/components/profile/ProfilePhotosSidebar.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import type {
  AlbumSummary,
  PhotoItem,
  ProfileCreativeNote,
  ProfileStoryMilestone,
} from "~/types/pages/profile";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const pageDescription = computed(() => t("seo.profilePhotos.description"));

definePageMeta({
  middleware: "auth",
  title: "profile-photos",
  sidebarVariant: "profile",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");
const { registerRightSidebarContent } = useLayoutRightSidebar();
const timelineHeadingId = "profile-photos-timeline";
const notesHeadingId = "profile-photos-notes";

useHead(() => {
  const title = t("seo.profilePhotos.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const highlightedAlbum = reactive<AlbumSummary>({
  id: "field-research",
  title: "Field research week",
  description:
    "Immersive research sessions with the Flowbase design team across artisanal workshops.",
  cover:
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=960&q=80",
  count: 42,
  location: "Lisbon, Portugal",
  updated: "2 days ago",
});

const secondaryAlbums = reactive<AlbumSummary[]>([
  {
    id: "studio",
    title: "Studio portraits",
    description: "Editorial portraits for the latest community profile series.",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
    count: 18,
    location: "",
    updated: "4 days ago",
  },
  {
    id: "product-launch",
    title: "Product launch night",
    description: "Highlights from the BroWorld 2.0 launch gathering.",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80",
    count: 27,
    location: "",
    updated: "1 week ago",
  },
  {
    id: "retreat",
    title: "Team retreat",
    description: "Moments from the annual leadership retreat in the mountains.",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
    count: 33,
    location: "",
    updated: "3 weeks ago",
  },
]);

const filters = computed(() => [
  { id: "recent", label: t("pages.profilePhotos.filters.recent") },
  { id: "events", label: t("pages.profilePhotos.filters.events") },
  { id: "studio", label: t("pages.profilePhotos.filters.studio") },
  { id: "travel", label: t("pages.profilePhotos.filters.travel") },
]);

const activeFilter = ref<string>("recent");

const photoLibrary = reactive<PhotoItem[]>([
  {
    id: "photo-1",
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    alt: "Team celebrating product launch",
    title: "Launch toast",
    category: "Events",
    takenAt: "May 2024",
    ratio: 4 / 5,
    filter: "events",
  },
  {
    id: "photo-2",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    alt: "Research interviews",
    title: "Field notes",
    category: "Research",
    takenAt: "April 2024",
    ratio: 3 / 4,
    filter: "recent",
  },
  {
    id: "photo-3",
    src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    alt: "Portrait studio setup",
    title: "Studio light tests",
    category: "Studio",
    takenAt: "March 2024",
    ratio: 4 / 5,
    filter: "studio",
  },
  {
    id: "photo-4",
    src: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80",
    alt: "Mountain retreat",
    title: "Retreat sunrise",
    category: "Travel",
    takenAt: "February 2024",
    ratio: 16 / 9,
    filter: "travel",
  },
  {
    id: "photo-5",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    alt: "Portrait backdrop",
    title: "Portrait session",
    category: "Studio",
    takenAt: "January 2024",
    ratio: 1,
    filter: "studio",
  },
  {
    id: "photo-6",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    alt: "Workshop collaboration",
    title: "Workshop board",
    category: "Events",
    takenAt: "December 2023",
    ratio: 3 / 4,
    filter: "events",
  },
  {
    id: "photo-7",
    src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    alt: "Urban exploration",
    title: "City stroll",
    category: "Travel",
    takenAt: "October 2023",
    ratio: 3 / 2,
    filter: "travel",
  },
  {
    id: "photo-8",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    alt: "Notebook close-up",
    title: "Interview notes",
    category: "Research",
    takenAt: "September 2023",
    ratio: 4 / 3,
    filter: "recent",
  },
]);

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value || "en-US"));

const collectionStats = computed(() => {
  const totalPhotos =
    photoLibrary.length +
    highlightedAlbum.count +
    secondaryAlbums.reduce((sum, album) => sum + album.count, 0);
  const curatedAlbums = 1 + secondaryAlbums.length;
  const curatedTags = new Set(photoLibrary.map((photo) => photo.category)).size;

  return [
    {
      id: "photos",
      label: t("pages.profilePhotos.meta.photoCount"),
      value: numberFormatter.value.format(totalPhotos),
    },
    {
      id: "albums",
      label: t("pages.profilePhotos.stats.albums"),
      value: numberFormatter.value.format(curatedAlbums),
    },
    {
      id: "tags",
      label: t("pages.profilePhotos.stats.tags"),
      value: numberFormatter.value.format(curatedTags),
    },
  ];
});

const displayedPhotos = computed(() => {
  if (activeFilter.value === "recent") {
    return photoLibrary;
  }

  return photoLibrary.filter((photo) => photo.filter === activeFilter.value);
});

const storyMilestones = reactive<ProfileStoryMilestone[]>([
  {
    id: "storyboards",
    title: "Residency storyboards",
    date: "May 2024",
    description:
      "Sequencing portraits and workshop captures into a three-act narrative for the residency film.",
    status: "In review",
    progress: 72,
    color: "primary",
    icon: "mdi:filmstrip-box-multiple",
    tags: ["Documentary", "Editorial"],
  },
  {
    id: "launch-debrief",
    title: "Launch week debrief",
    date: "April 2024",
    description:
      "Combining event footage with voiceovers from partners to create a highlight reel for investors.",
    status: "Editing",
    progress: 54,
    color: "secondary",
    icon: "mdi:lightning-bolt",
    tags: ["Events", "Recap"],
  },
  {
    id: "retreat-journal",
    title: "Retreat journal",
    date: "February 2024",
    description:
      "Translating dawn hikes and campfire conversations into a reflective zine for the team archive.",
    status: "Drafting",
    progress: 38,
    color: "success",
    icon: "mdi:image-filter-hdr",
    tags: ["Retreat", "Culture"],
  },
]);

const creativeNotes = reactive<ProfileCreativeNote[]>([
  {
    id: "moodboard",
    initials: "AR",
    title: "Moodboard refresh",
    byline: "Amina Rahman • Visual lead",
    category: "Mood",
    preview:
      "Updated the hero palette with twilight blues and added grain overlays for motion clips.",
    updated: "2 hours ago",
    color: "primary",
    cta: "Open deck",
  },
  {
    id: "soundtrack",
    initials: "LM",
    title: "Soundtrack selects",
    byline: "Leo Moretti • Audio editor",
    category: "Audio",
    preview: "Shared three ambient loops that sync with the launch highlight reel pacing.",
    updated: "Yesterday",
    color: "secondary",
    cta: "Listen now",
  },
  {
    id: "story-angles",
    initials: "NH",
    title: "Story angles",
    byline: "Noor Haddad • Producer",
    category: "Narrative",
    preview: "Drafted interview prompts focusing on community impact and future residencies.",
    updated: "3 days ago",
    color: "warning",
    cta: "Review notes",
  },
]);

const photosSidebarContent = computed(() => ({
  component: ProfilePhotosSidebar,
  props: {
    storyMilestones,
    creativeNotes,
    timelineHeadingId,
    notesHeadingId,
  },
  wrapperClass: "flex flex-col gap-4",
}));

registerRightSidebarContent(photosSidebarContent);

const showSnackbar = ref(false);
const snackbarMessage = ref("");

function triggerAction(action: "upload" | "create-album" | "share-collection") {
  const mapping: Record<"upload" | "create-album" | "share-collection", string> = {
    upload: "upload",
    "create-album": "createAlbum",
    "share-collection": "shareCollection",
  };

  const key = mapping[action] ?? "generic";
  snackbarMessage.value = t(`pages.profilePhotos.feedback.${key}`);
  showSnackbar.value = true;
}
</script>

<style scoped src="~/assets/styles/pages/profile-photos.scss" lang="scss"></style>
