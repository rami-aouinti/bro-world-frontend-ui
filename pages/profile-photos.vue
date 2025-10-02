<template>
  <main
    class="py-8"
    aria-labelledby="profile-photos-title"
  >
    <v-container>
      <header
        class="mb-10"
        aria-describedby="profile-photos-subtitle"
      >
        <v-card
          class="pa-6"
          rounded="xl"
          elevation="8"
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
        </v-card>
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
            <v-card
              class="pa-6"
              rounded="xl"
              elevation="6"
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
                  <v-card
                    class="pa-4 h-100"
                    rounded="xl"
                    elevation="4"
                  >
                    <div class="rounded-xl overflow-hidden mb-4">
                      <v-img
                        :src="highlightedAlbum.cover"
                        :alt="highlightedAlbum.title"
                        aspect-ratio="4/3"
                        cover
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
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <div class="d-flex flex-column gap-3">
                    <v-card
                      v-for="album in secondaryAlbums"
                      :key="album.id"
                      class="pa-4"
                      rounded="xl"
                      variant="tonal"
                    >
                      <div class="d-flex gap-4">
                        <v-img
                          :src="album.cover"
                          :alt="album.title"
                          class="rounded-lg"
                          aspect-ratio="1"
                          width="96"
                          cover
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
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </section>

          <section aria-labelledby="photo-gallery-title">
            <v-card
              class="pa-6"
              rounded="xl"
              elevation="4"
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
                  <v-img
                    :src="photo.src"
                    :alt="photo.alt"
                    class="rounded-xl"
                    aspect-ratio="photo.ratio"
                    cover
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
            </v-card>
          </section>
        </v-col>
        <v-col
          cols="12"
          xl="4"
        >
          <aside>
            <v-card
              class="pa-6 mb-6"
              rounded="xl"
              elevation="4"
            >
              <h2 class="text-h6 font-weight-semibold mb-4">
                {{ t("pages.profilePhotos.timeline.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-6">
                {{ t("pages.profilePhotos.timeline.description") }}
              </p>
              <v-expansion-panels
                multiple
                variant="accordion"
              >
                <v-expansion-panel
                  v-for="item in timeline"
                  :key="item.id"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex flex-column">
                      <span class="text-subtitle-2 font-weight-semibold">{{ item.title }}</span>
                      <span class="text-caption text-medium-emphasis">{{ item.date }}</span>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2 text-medium-emphasis mb-3">{{ item.description }}</p>
                    <div class="d-flex flex-wrap gap-2">
                      <v-chip
                        v-for="tag in item.tags"
                        :key="tag"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>

            <v-card
              class="pa-6"
              rounded="xl"
              variant="tonal"
            >
              <h2 class="text-h6 font-weight-semibold mb-3">
                {{ t("pages.profilePhotos.sections.timeline") }}
              </h2>
              <div class="d-flex flex-column gap-3">
                <div
                  v-for="note in quickNotes"
                  :key="note.id"
                  class="d-flex gap-3"
                >
                  <v-avatar
                    size="36"
                    color="primary"
                    variant="tonal"
                  >
                    <span class="text-body-2 font-weight-semibold">{{ note.initials }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-semibold">{{ note.title }}</div>
                    <div class="text-caption text-medium-emphasis">{{ note.subtitle }}</div>
                  </div>
                </div>
              </div>
            </v-card>
          </aside>
        </v-col>
      </v-row>
    </v-container>

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

definePageMeta({
  middleware: "auth",
  title: "profile-photos",
  showRightWidgets: false,
  sidebarVariant: "profile",
});

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.profilePhotos.title");
  const description = t("seo.profilePhotos.description");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "description", name: "description", content: description },
      { key: "og:title", property: "og:title", content: title },
      { key: "og:description", property: "og:description", content: description },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:description", name: "twitter:description", content: description },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
    link: [{ rel: "canonical", href: canonical }],
  };
});

interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  takenAt: string;
  ratio: number;
  filter: string;
}

interface AlbumSummary {
  id: string;
  title: string;
  description: string;
  cover: string;
  count: number;
  location: string;
  updated: string;
}

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

const collectionStats = computed(() => {
  const formatter = new Intl.NumberFormat(locale.value || "en-US");
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
      value: formatter.format(totalPhotos),
    },
    {
      id: "albums",
      label: t("pages.profilePhotos.stats.albums"),
      value: formatter.format(curatedAlbums),
    },
    {
      id: "tags",
      label: t("pages.profilePhotos.stats.tags"),
      value: formatter.format(curatedTags),
    },
  ];
});

const displayedPhotos = computed(() => {
  if (activeFilter.value === "recent") {
    return photoLibrary;
  }

  return photoLibrary.filter((photo) => photo.filter === activeFilter.value);
});

const timeline = reactive([
  {
    id: "2024-q2",
    title: "Research residency",
    date: "Q2 2024",
    description:
      "A week-long residency documenting artisan workshops to inspire new community formats.",
    tags: ["Research", "Community"],
  },
  {
    id: "2024-launch",
    title: "BroWorld 2.0 launch",
    date: "May 2024",
    description: "Captured stories from partners, beta customers, and the team during launch week.",
    tags: ["Events", "Product"],
  },
  {
    id: "2023-retreat",
    title: "Leadership retreat",
    date: "November 2023",
    description: "Photo journal from the annual strategy retreat in the mountains.",
    tags: ["Retreat", "Team"],
  },
] satisfies Array<{
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}>);

const quickNotes = reactive([
  {
    id: "note-1",
    initials: "AR",
    title: "Shot list updated",
    subtitle: "Amina added 3 new prompts",
  },
  { id: "note-2", initials: "LM", title: "Color grading", subtitle: "Leo shared LUT presets" },
  { id: "note-3", initials: "NH", title: "Story ideas", subtitle: "Noor drafted interview angles" },
] satisfies Array<{ id: string; initials: string; title: string; subtitle: string }>);

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

<style scoped>
.masonry-grid {
  column-count: 2;
  column-gap: 1.5rem;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}

@media (min-width: 1280px) {
  .masonry-grid {
    column-count: 3;
  }
}
</style>
