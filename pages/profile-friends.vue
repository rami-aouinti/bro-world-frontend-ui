<template>
  <main
    class="py-8"
    aria-labelledby="profile-friends-title"
  >
    <v-container>
      <header
        class="mb-10"
        aria-describedby="profile-friends-subtitle"
      >
        <v-card
          class="pa-6"
          rounded="xl"
          elevation="8"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-6">
            <div class="flex-grow-1">
              <h1
                id="profile-friends-title"
                class="text-h4 font-weight-bold mb-2"
              >
                {{ t("pages.profileFriends.title") }}
              </h1>
              <p
                id="profile-friends-subtitle"
                class="text-body-1 text-medium-emphasis mb-4"
              >
                {{ t("pages.profileFriends.subtitle") }}
              </p>
              <div class="d-flex flex-wrap gap-4">
                <div
                  v-for="stat in heroStats"
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
                @click="triggerAction('message')"
              >
                {{ t("pages.profileFriends.actions.message") }}
              </v-btn>
              <v-btn
                variant="tonal"
                color="primary"
                size="large"
                class="flex-grow-1"
                @click="triggerAction('schedule')"
              >
                {{ t("pages.profileFriends.actions.schedule") }}
              </v-btn>
            </div>
          </div>
        </v-card>
      </header>

      <section
        class="mb-10"
        aria-labelledby="friends-filter-title"
      >
        <div
          class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-4 gap-4"
        >
          <div>
            <h2
              id="friends-filter-title"
              class="text-h5 font-weight-semibold mb-1"
            >
              {{ t("pages.profileFriends.highlights.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.profileFriends.highlights.subtitle") }}
            </p>
          </div>
          <v-chip-group
            v-model="activeFilter"
            selected-class="bg-primary text-primary-on-surface"
            class="flex-wrap"
          >
            <v-chip
              v-for="option in filterOptions"
              :key="option.id"
              :value="option.id"
              variant="outlined"
              size="small"
              class="text-body-2"
            >
              {{ option.label }}
            </v-chip>
          </v-chip-group>
        </div>

        <v-row
          dense
          align="stretch"
        >
          <v-col
            v-for="friend in filteredFriends"
            :key="friend.id"
            cols="12"
            sm="6"
            xl="4"
          >
            <v-card
              class="pa-5 h-100"
              rounded="xl"
              elevation="6"
            >
              <div class="d-flex align-start gap-4 mb-4">
                <v-avatar size="64">
                  <v-img
                    :src="friend.avatar"
                    :alt="friend.name"
                    cover
                  />
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between gap-2 mb-1">
                    <h3 class="text-subtitle-1 font-weight-semibold mb-0">{{ friend.name }}</h3>
                    <v-chip
                      v-if="friend.status"
                      :color="statusColor(friend.status)"
                      size="small"
                      class="text-caption font-weight-medium"
                    >
                      {{ statusLabel(friend.status) }}
                    </v-chip>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-2">{{ friend.headline }}</p>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <v-chip
                      v-for="tag in friend.tags"
                      :key="tag"
                      size="small"
                      variant="tonal"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <div
                class="d-flex flex-wrap align-center justify-space-between text-medium-emphasis text-body-2 mb-4 gap-2"
              >
                <div class="d-flex align-center gap-2">
                  <Icon
                    name="mdi-map-marker-outline"
                    size="18"
                  />
                  <span>{{ friend.location }}</span>
                </div>
                <div class="d-flex align-center gap-2">
                  <Icon
                    name="mdi-account-multiple-outline"
                    size="18"
                  />
                  <span>{{ friend.mutualCount }} {{ t("pages.profileFriends.stats.mutual") }}</span>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-3">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="openProfile(friend)"
                >
                  {{ t("pages.profileFriends.actions.viewProfile") }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="triggerAction('message', friend)"
                >
                  {{ t("pages.profileFriends.actions.message") }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div
          v-if="filteredFriends.length === 0"
          class="text-body-1 text-medium-emphasis text-center py-8"
        >
          {{ t("pages.profileFriends.empty") }}
        </div>
      </section>

      <section aria-labelledby="friend-suggestions-title">
        <v-row dense>
          <v-col
            cols="12"
            lg="8"
          >
            <v-card
              class="pa-6 h-100"
              rounded="xl"
              elevation="4"
            >
              <h2
                id="friend-suggestions-title"
                class="text-h5 font-weight-semibold mb-4"
              >
                {{ t("pages.profileFriends.sections.suggestions") }}
              </h2>
              <v-list
                lines="three"
                density="comfortable"
              >
                <v-list-item
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                >
                  <template #prepend>
                    <v-avatar size="48">
                      <v-img
                        :src="suggestion.avatar"
                        :alt="suggestion.name"
                        cover
                      />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-semibold">{{
                    suggestion.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{ suggestion.headline }}</v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex flex-column align-end gap-2">
                      <v-chip
                        size="small"
                        variant="tonal"
                      >
                        {{ suggestion.mutualCount }} {{ t("pages.profileFriends.stats.mutual") }}
                      </v-chip>
                      <v-btn
                        color="primary"
                        variant="text"
                        size="small"
                        @click="triggerAction('connect', suggestion)"
                      >
                        {{ t("pages.profileFriends.actions.message") }}
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            lg="4"
          >
            <v-card
              class="pa-6 h-100"
              rounded="xl"
              variant="tonal"
            >
              <div class="d-flex flex-column gap-3">
                <h2 class="text-h6 font-weight-semibold mb-1">
                  {{ t("pages.profileFriends.sections.active") }}
                </h2>
                <div class="d-flex flex-column gap-2">
                  <div
                    v-for="friend in activeNow"
                    :key="friend.id"
                    class="d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-3">
                      <v-avatar size="40">
                        <v-img
                          :src="friend.avatar"
                          :alt="friend.name"
                          cover
                        />
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-medium">{{ friend.name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ friend.lastActive }}</div>
                      </div>
                    </div>
                    <v-chip
                      :color="statusColor(friend.status)"
                      size="x-small"
                      class="font-weight-medium"
                    >
                      {{ statusLabel(friend.status) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </v-container>

    <v-dialog
      v-model="showProfileDialog"
      max-width="520"
    >
      <v-card v-if="selectedFriend">
        <v-card-title class="d-flex align-center gap-3">
          <v-avatar size="56">
            <v-img
              :src="selectedFriend.avatar"
              :alt="selectedFriend.name"
              cover
            />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-semibold">{{ selectedFriend.name }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ selectedFriend.headline }}</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="tag in selectedFriend.tags"
              :key="tag"
              size="small"
              variant="tonal"
            >
              {{ tag }}
            </v-chip>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ selectedFriend.bio }}
          </p>
          <div class="d-flex align-center gap-2 text-body-2 text-medium-emphasis">
            <Icon
              name="mdi-map-marker-outline"
              size="18"
            />
            <span>{{ selectedFriend.location }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn
            variant="text"
            color="primary"
            @click="showProfileDialog = false"
          >
            {{ t("common.close") }}
          </v-btn>
          <div class="d-flex gap-2">
            <v-btn
              variant="outlined"
              color="primary"
              @click="triggerAction('schedule', selectedFriend)"
            >
              {{ t("pages.profileFriends.actions.schedule") }}
            </v-btn>
            <v-btn
              color="primary"
              @click="triggerAction('message', selectedFriend)"
            >
              {{ t("pages.profileFriends.actions.message") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="showActionSnackbar"
      timeout="3000"
      color="primary"
      variant="flat"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

definePageMeta({
  middleware: "auth",
  title: "profile-friends",
  showRightWidgets: false,
  sidebarVariant: "profile",
});

const { t, locale, localeProperties } = useI18n();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.profileFriends.title");
  const description = t("seo.profileFriends.description");
  const canonical = new URL(route.path, baseUrl.value).toString();
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

interface FriendCard {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  location: string;
  mutualCount: number;
  status: "online" | "offline" | "busy" | "focus";
  tags: string[];
  segments: ("design" | "product" | "engineering" | "marketing")[];
  lastActive: string;
  bio: string;
}

const allFriends = ref<FriendCard[]>([
  {
    id: "amina-rahman",
    name: "Amina Rahman",
    headline: "Lead Product Designer · Flowbase",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Casablanca, Morocco",
    mutualCount: 12,
    status: "online",
    tags: ["Design systems", "Accessibility"],
    segments: ["design", "product"],
    lastActive: "5 min",
    bio: "Exploring inclusive design for large platforms and mentoring early-career designers.",
  },
  {
    id: "leo-martinez",
    name: "Leo Martínez",
    headline: "Senior Frontend Engineer · Alloy",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Madrid, Spain",
    mutualCount: 18,
    status: "focus",
    tags: ["Nuxt", "Design systems"],
    segments: ["engineering", "product"],
    lastActive: "Just now",
    bio: "Leading the design system implementation and coaching cross-functional squads.",
  },
  {
    id: "noor-hassan",
    name: "Noor Hassan",
    headline: "Community Strategist · Orbit",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Dubai, UAE",
    mutualCount: 9,
    status: "online",
    tags: ["Community", "Storytelling"],
    segments: ["marketing", "product"],
    lastActive: "12 min",
    bio: "Scaling partnerships through curated learning circles and thoughtful rituals.",
  },
  {
    id: "sasha-ivanov",
    name: "Sasha Ivanov",
    headline: "Staff Software Engineer · Vertex",
    avatar:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Berlin, Germany",
    mutualCount: 7,
    status: "busy",
    tags: ["Performance", "TypeScript"],
    segments: ["engineering"],
    lastActive: "25 min",
    bio: "Improving performance budgets and tooling for globally distributed teams.",
  },
  {
    id: "harper-lee",
    name: "Harper Lee",
    headline: "Growth Marketing Lead · Sail",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Toronto, Canada",
    mutualCount: 14,
    status: "online",
    tags: ["Lifecycle", "Analytics"],
    segments: ["marketing"],
    lastActive: "2 min",
    bio: "Designing lifecycle journeys and community programs for product-led growth.",
  },
  {
    id: "meera-kapoor",
    name: "Meera Kapoor",
    headline: "Principal Product Manager · Aurora",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Bengaluru, India",
    mutualCount: 21,
    status: "focus",
    tags: ["Roadmaps", "Discovery"],
    segments: ["product"],
    lastActive: "8 min",
    bio: "Championing discovery frameworks and inclusive roadmap rituals across teams.",
  },
  {
    id: "julien-morel",
    name: "Julien Morel",
    headline: "Design Operations Manager · Lumen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Paris, France",
    mutualCount: 10,
    status: "offline",
    tags: ["Ops", "Workshops"],
    segments: ["design", "product"],
    lastActive: "2 h",
    bio: "Connecting research, content, and design practices through workshops and rituals.",
  },
  {
    id: "ayesha-rahim",
    name: "Ayesha Rahim",
    headline: "Solutions Engineer · Stripe",
    avatar:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Singapore",
    mutualCount: 11,
    status: "online",
    tags: ["Integrations", "Workflows"],
    segments: ["engineering", "product"],
    lastActive: "3 min",
    bio: "Bridging product discovery with implementation for enterprise customers.",
  },
  {
    id: "daniel-cho",
    name: "Daniel Cho",
    headline: "Brand Strategist · Northwind",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Seoul, South Korea",
    mutualCount: 6,
    status: "offline",
    tags: ["Narrative", "Workshops"],
    segments: ["marketing", "design"],
    lastActive: "5 h",
    bio: "Building narrative frameworks and brand playbooks for community-led launches.",
  },
]);

const featuredIds = new Set(["amina-rahman", "leo-martinez", "meera-kapoor"]);

const heroStats = computed(() => {
  const total = allFriends.value.length;
  const mutual = allFriends.value.reduce((sum, friend) => sum + friend.mutualCount, 0);
  const online = allFriends.value.filter((friend) => friend.status === "online").length;
  const formatter = new Intl.NumberFormat(locale.value || "en-US");

  return [
    {
      id: "total",
      label: t("pages.profileFriends.stats.totalFriends"),
      value: formatter.format(total),
    },
    {
      id: "mutual",
      label: t("pages.profileFriends.stats.mutual"),
      value: formatter.format(mutual),
    },
    {
      id: "online",
      label: t("pages.profileFriends.stats.online"),
      value: formatter.format(online),
    },
  ];
});

const filterOptions = computed(() => [
  { id: "all", label: t("pages.profileFriends.filters.all") },
  { id: "design", label: t("pages.profileFriends.filters.design") },
  { id: "product", label: t("pages.profileFriends.filters.product") },
  { id: "engineering", label: t("pages.profileFriends.filters.engineering") },
  { id: "marketing", label: t("pages.profileFriends.filters.marketing") },
]);

const activeFilter = ref<string>("all");

const filteredFriends = computed(() => {
  if (activeFilter.value === "all") {
    return allFriends.value.filter((friend) => featuredIds.has(friend.id));
  }

  return allFriends.value.filter(
    (friend) =>
      featuredIds.has(friend.id) &&
      friend.segments.includes(activeFilter.value as FriendCard["segments"][number]),
  );
});

const suggestions = computed(() =>
  allFriends.value.filter((friend) => !featuredIds.has(friend.id)),
);

const activeNow = computed(() =>
  allFriends.value
    .filter((friend) => friend.status === "online" || friend.status === "focus")
    .slice(0, 4),
);

const showProfileDialog = ref(false);
const selectedFriend = ref<FriendCard | null>(null);
const showActionSnackbar = ref(false);
const snackbarMessage = ref("");

function statusColor(status: FriendCard["status"]) {
  switch (status) {
    case "online":
      return "success";
    case "focus":
      return "primary";
    case "busy":
      return "warning";
    default:
      return "grey";
  }
}

function statusLabel(status: FriendCard["status"]) {
  switch (status) {
    case "online":
      return t("pages.profileFriends.status.online");
    case "focus":
      return t("pages.profileFriends.status.focus");
    case "busy":
      return t("pages.profileFriends.status.busy");
    default:
      return t("pages.profileFriends.status.offline");
  }
}

function openProfile(friend: FriendCard) {
  selectedFriend.value = friend;
  showProfileDialog.value = true;
}

function triggerAction(action: "message" | "schedule" | "connect", friend?: FriendCard) {
  const name = friend?.name;

  if (action === "message") {
    snackbarMessage.value = name
      ? t("pages.profileFriends.feedback.messageWith", { name })
      : t("pages.profileFriends.feedback.message");
  } else if (action === "schedule") {
    snackbarMessage.value = name
      ? t("pages.profileFriends.feedback.scheduleWith", { name })
      : t("pages.profileFriends.feedback.schedule");
  } else {
    snackbarMessage.value = name
      ? t("pages.profileFriends.feedback.connectWith", { name })
      : t("pages.profileFriends.feedback.connect");
  }

  showActionSnackbar.value = true;
}
</script>
