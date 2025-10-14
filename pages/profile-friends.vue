<template>
  <main
    aria-labelledby="profile-friends-title"
  >
    <v-container>
      <header
        class="mb-10"
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
    </v-container>

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
import ProfileFriendsSidebar from "~/components/profile/ProfileFriendsSidebar.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { friendCards, featuredFriendIds } from "~/lib/users/mock-friends";
import type { FriendCard } from "~/types/pages/profile";

definePageMeta({
  middleware: "auth",
  title: "profile-friends",
  sidebarVariant: "profile",
  documentDriven: false,
});

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

const { registerRightSidebarContent } = useLayoutRightSidebar();

useHead(() => {
  const title = t("seo.profileFriends.title");
  const description = t("seo.profileFriends.description");
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

const allFriends = ref<FriendCard[]>([...friendCards]);

const featuredIds = new Set<string>([...featuredFriendIds]);

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

const sidebarContent = computed(() => ({
  component: ProfileFriendsSidebar,
  props: {
    suggestions: suggestions.value,
    activeNow: activeNow.value,
    onConnect: (friend: FriendCard) => triggerAction("connect", friend),
  },
  wrapperClass: "flex flex-col gap-4",
}));

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
