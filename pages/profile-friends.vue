<template>
  <main aria-labelledby="profile-friends-title">
    <header
      class="mb-6"
      aria-describedby="profile-friends-subtitle"
    >
      <SidebarCard
        class="text-card-foreground pa-6"
        glow
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
      </SidebarCard>
    </header>

    <section
      class="mb-10"
      aria-labelledby="friends-filter-title"
    >
      <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-4 gap-4">
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
          <SidebarCard
            class="text-card-foreground pa-5 h-100"
            glow
          >
            <div class="d-flex align-start gap-4 mb-4">
              <NuxtLink
                :to="friendProfilePath(friend)"
                class="d-inline-flex"
              >
                <v-avatar size="64">
                  <v-img
                    :src="friend.avatar"
                    :alt="friend.name"
                    cover
                  />
                </v-avatar>
              </NuxtLink>
              <div class="flex-grow-1">
                <div class="d-flex align-center justify-space-between gap-2 mb-1">
                  <h3 class="text-subtitle-1 font-weight-semibold mb-0">
                    <NuxtLink
                      :to="friendProfilePath(friend)"
                      class="text-decoration-none text-card-foreground"
                    >
                      {{ friend.name }}
                    </NuxtLink>
                  </h3>
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
                  name="mdi:map-marker-outline"
                  size="18"
                />
                <span>{{ friend.location }}</span>
              </div>
              <div class="d-flex align-center gap-2">
                <Icon
                  name="mdi:account-multiple-outline"
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
                @click="goToProfile(friend)"
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
          </SidebarCard>
        </v-col>
      </v-row>

      <div
        v-if="filteredFriends.length === 0"
        class="text-body-1 text-medium-emphasis text-center py-8"
      >
        {{ t("pages.profileFriends.empty") }}
      </div>
    </section>

    <section
      aria-labelledby="friend-suggestions-title"
      class="lg:hidden"
    >
      <v-row dense>
        <v-col cols="12">
          <SidebarCard
            class="text-card-foreground pa-6 h-100"
            glow
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
                :to="friendProfilePath(suggestion)"
                link
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
                <v-list-item-title class="font-weight-semibold">
                  {{ suggestion.name }}
                </v-list-item-title>
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
                      @click.stop="triggerAction('connect', suggestion)"
                    >
                      {{ t("pages.profileFriends.actions.message") }}
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </SidebarCard>
        </v-col>
        <v-col cols="12">
          <SidebarCard
            class="text-card-foreground pa-6 h-100 bg-primary/10"
            glow
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
                  <NuxtLink
                    :to="friendProfilePath(friend)"
                    class="d-flex align-center gap-3 text-decoration-none text-card-foreground"
                  >
                    <v-avatar size="40">
                      <v-img
                        :src="friend.avatar"
                        :alt="friend.name"
                        cover
                      />
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">{{ friend.name }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ t("pages.profileFriends.meta.lastActive", { time: friend.lastActive }) }}
                      </div>
                    </div>
                  </NuxtLink>
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
          </SidebarCard>
        </v-col>
      </v-row>
    </section>

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
import { useI18n } from "vue-i18n";
import { callOnce } from "#app";
import ProfileFriendsSidebar from "~/components/profile/ProfileFriendsSidebar.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useProfileStore } from "~/stores/profile";
import type { FriendCard, FriendEntry } from "~/types/pages/profile";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const profileStore = useProfileStore();

const DEFAULT_AVATAR = "/images/avatars/avatar-default.svg";
const placeholderValue = computed(() => t("pages.profile.placeholders.missing"));

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapFriendStatus(status: number | null | undefined): FriendCard["status"] {
  switch (status) {
    case 1:
      return "online";
    case 2:
      return "focus";
    case 0:
      return "offline";
    default:
      return "busy";
  }
}

function createFriendCard(entry: FriendEntry, index: number): FriendCard | null {
  const friend = entry?.user;

  if (!friend) {
    return null;
  }

  const id = asString(friend.id) ?? friend.username ?? `friend-${index}`;
  const firstName = asString(friend.firstName);
  const lastName = asString(friend.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const username = asString(friend.username);
  const email = asString(friend.email);
  const name = fullName || username || email || placeholderValue.value;
  const headline = asString(friend.profile?.title) || placeholderValue.value;
  const avatar =
    asString(friend.profile?.photo) ||
    asString((friend as { photo?: string | null }).photo) ||
    DEFAULT_AVATAR;
  const location = asString(friend.timezone) || asString(friend.locale) || placeholderValue.value;
  const mutualCount = Array.isArray(entry.stories) ? entry.stories.length : 0;
  const status = mapFriendStatus(entry.status ?? null);
  const tags: string[] = [];

  if (headline && headline !== placeholderValue.value) {
    tags.push(headline);
  }

  const segments: FriendCard["segments"] = [];

  if (status === "online") {
    segments.push("engineering");
  } else if (status === "focus") {
    segments.push("product");
  } else if (status === "busy") {
    segments.push("marketing");
  } else {
    segments.push("design");
  }

  const lastActive = statusLabel(status);

  return {
    id,
    name,
    headline,
    avatar,
    location,
    mutualCount,
    status,
    tags,
    segments,
    lastActive,
  };
}

const pageDescription = computed(() => t("seo.profileFriends.description"));

definePageMeta({
  middleware: "auth",
  title: "profile-friends",
  sidebarVariant: "profile",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

const { registerRightSidebarContent } = useLayoutRightSidebar();

useHead(createProfileFriendsHead);

await callOnce("profile:friends:fetch-profile", async () => {
  try {
    await profileStore.fetchProfile({ background: true });
  } catch (error) {
    console.error("Failed to load profile data", error);
  }
});

const allFriends = computed<FriendCard[]>(() => {
  const entries = profileStore.friendEntries.value;

  return entries.reduce<FriendCard[]>((acc, entry, index) => {
    const card = createFriendCard(entry, index);

    if (card) {
      acc.push(card);
    }

    return acc;
  }, []);
});

const highlightedFriends = computed(() =>
  allFriends.value.slice(0, Math.min(allFriends.value.length, 6)),
);
const featuredIdSet = computed(() => new Set(highlightedFriends.value.map((friend) => friend.id)));

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value || "en-US"));

const heroStats = computed(computeHeroStats);

const filterOptions = computed(resolveFilterOptions);

const activeFilter = ref<string>("all");

const filteredFriends = computed(resolveFilteredFriends);

const suggestions = computed(() => allFriends.value.slice(highlightedFriends.value.length));

const activeNow = computed(resolveActiveNow);

const sidebarContent = computed(resolveSidebarContent);

function createProfileFriendsHead() {
  const title = t("seo.profileFriends.title");
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
}

function computeHeroStats() {
  const total = allFriends.value.length;
  const mutual = allFriends.value.filter((friend) => friend.status !== "offline").length;
  const online = allFriends.value.filter((friend) => friend.status === "online").length;

  return [
    {
      id: "total",
      label: t("pages.profileFriends.stats.totalFriends"),
      value: numberFormatter.value.format(total),
    },
    {
      id: "mutual",
      label: t("pages.profileFriends.stats.mutual"),
      value: numberFormatter.value.format(mutual),
    },
    {
      id: "online",
      label: t("pages.profileFriends.stats.online"),
      value: numberFormatter.value.format(online),
    },
  ];
}

function resolveFilterOptions() {
  return [
    { id: "all", label: t("pages.profileFriends.filters.all") },
    { id: "design", label: t("pages.profileFriends.filters.design") },
    { id: "product", label: t("pages.profileFriends.filters.product") },
    { id: "engineering", label: t("pages.profileFriends.filters.engineering") },
    { id: "marketing", label: t("pages.profileFriends.filters.marketing") },
  ];
}

function resolveFilteredFriends() {
  const featuredIds = featuredIdSet.value;
  const highlighted = highlightedFriends.value;

  if (activeFilter.value === "all") {
    return highlighted;
  }

  const target = activeFilter.value as FriendCard["segments"][number];

  return highlighted.filter((friend) => friend.segments.includes(target));
}

function resolveActiveNow() {
  return allFriends.value
    .filter((friend) => friend.status === "online" || friend.status === "focus")
    .slice(0, 4);
}

function sidebarConnectHandler(friend: FriendCard) {
  triggerAction("connect", friend);
}

function resolveSidebarContent() {
  const base = {
    component: ProfileFriendsSidebar,
    props: {
      suggestions: suggestions.value,
      activeNow: activeNow.value,
    },
    wrapperClass: "flex flex-col gap-4",
  } as const;

  if (import.meta.client) {
    return {
      ...base,
      props: {
        ...base.props,
        onConnect: sidebarConnectHandler,
      },
    };
  }

  return base;
}

registerRightSidebarContent(sidebarContent);

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

function friendProfilePath(friend: FriendCard | string) {
  const id = typeof friend === "string" ? friend : friend.id;

  return `/profile/${id}`;
}

function goToProfile(friend: FriendCard) {
  router.push(friendProfilePath(friend));
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
