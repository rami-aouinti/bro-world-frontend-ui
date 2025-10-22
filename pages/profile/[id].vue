<template>
  <main
    v-if="friend"
    aria-labelledby="friend-profile-title"
  >
    <div class="mb-6">
      <v-btn
        variant="text"
        color="primary"
        prepend-icon="mdi:arrow-left"
        :to="backLink"
      >
        {{ t("layout.actions.goBack") }}
      </v-btn>
    </div>

    <SidebarCard
      class="text-card-foreground pa-6 mb-8"
      glow
    >
      <div class="d-flex flex-column flex-md-row gap-6 align-md-center">
        <v-avatar size="104">
          <NuxtImg
            :src="friend.avatar"
            :alt="friend.name"
            width="104"
            height="104"
            fit="cover"
          />
        </v-avatar>
        <div class="flex-grow-1">
          <h1
            id="friend-profile-title"
            class="text-h4 font-weight-bold mb-2"
          >
            {{ friend.name }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ friend.headline }}
          </p>
          <div class="d-flex flex-wrap gap-4 text-medium-emphasis">
            <div class="d-flex align-center gap-2">
              <Icon
                name="mdi:map-marker-outline"
                size="20"
              />
              <span>{{ friend.location }}</span>
            </div>
            <div class="d-flex align-center gap-2">
              <Icon
                name="mdi:account-multiple-outline"
                size="20"
              />
              <span>{{ friend.mutualCount }} {{ t("pages.profileFriends.stats.mutual") }}</span>
            </div>
            <div class="d-flex align-center gap-2">
              <Icon
                name="mdi:timer-sand"
                size="20"
              />
              <span>{{
                t("pages.profileFriends.meta.lastActive", { time: friend.lastActive })
              }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex flex-column gap-3 w-100 w-md-auto">
          <v-chip
            :color="statusColor(friend.status)"
            size="small"
            class="font-weight-medium align-self-start"
          >
            {{ statusLabel(friend.status) }}
          </v-chip>
          <div class="d-flex flex-column flex-sm-row gap-3">
            <v-btn
              color="primary"
              class="flex-grow-1"
              @click="triggerAction('message', friend)"
            >
              {{ t("pages.profileFriends.actions.message") }}
            </v-btn>
            <v-btn
              variant="tonal"
              color="primary"
              class="flex-grow-1"
              @click="triggerAction('schedule', friend)"
            >
              {{ t("pages.profileFriends.actions.schedule") }}
            </v-btn>
          </div>
        </div>
      </div>
    </SidebarCard>

    <v-row
      dense
      class="mb-8"
      align="stretch"
    >
      <v-col
        cols="12"
        md="8"
      >
        <SidebarCard
          class="text-card-foreground pa-6 h-100"
          glow
        >
          <h2 class="text-h5 font-weight-semibold mb-4">
            {{ t("pages.profileEdit.sections.profile.bio") }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ friend.bio }}
          </p>
          <h3 class="text-subtitle-1 font-weight-semibold mb-3">
            {{ t("pages.profileEdit.sections.profile.skills") }}
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="tag in friend.tags"
              :key="tag"
              size="small"
              variant="tonal"
            >
              {{ tag }}
            </v-chip>
          </div>
        </SidebarCard>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <SidebarCard
          class="text-card-foreground pa-6 h-100"
          glow
        >
          <h2 class="text-h6 font-weight-semibold mb-4">
            {{ t("pages.profileFriends.highlights.title") }}
          </h2>
          <div class="d-flex flex-column gap-4">
            <div
              v-for="item in connectionHighlights"
              :key="item.id"
              class="d-flex align-start gap-3"
            >
              <div
                class="rounded-circle d-flex align-center justify-center bg-primary/10"
                style="width: 40px; height: 40px"
              >
                <Icon
                  :name="item.icon"
                  size="22"
                  class="text-primary"
                />
              </div>
              <div>
                <div class="text-subtitle-2 font-weight-medium">{{ item.title }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ item.subtitle }}</div>
              </div>
            </div>
          </div>
        </SidebarCard>
      </v-col>
    </v-row>

    <SidebarCard
      class="text-card-foreground pa-6"
      glow
    >
      <div class="d-flex align-center justify-space-between gap-3 mb-4">
        <h2 class="text-h6 font-weight-semibold mb-0">
          {{ t("pages.profileFriends.sections.suggestions") }}
        </h2>
        <v-btn
          variant="text"
          color="primary"
          class="ml-auto"
          :to="backLink"
        >
          {{ t("layout.actions.goBack") }}
        </v-btn>
      </div>
      <v-slide-group show-arrows>
        <v-slide-group-item
          v-for="suggestion in relatedConnections"
          :key="suggestion.id"
        >
          <NuxtLink
            :to="friendProfilePath(suggestion)"
            class="d-flex flex-column align-center pa-4 text-decoration-none text-card-foreground"
          >
            <v-avatar
              size="72"
              class="mb-3"
            >
              <NuxtImg
                :src="suggestion.avatar"
                :alt="suggestion.name"
                width="72"
                height="72"
                fit="cover"
              />
            </v-avatar>
            <div class="text-subtitle-2 font-weight-medium text-center mb-1">
              {{ suggestion.name }}
            </div>
            <div class="text-caption text-medium-emphasis text-center">
              {{ suggestion.headline }}
            </div>
          </NuxtLink>
        </v-slide-group-item>
      </v-slide-group>
    </SidebarCard>

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
import { createError } from "h3";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import ProfileFriendsSidebar from "~/components/profile/ProfileFriendsSidebar.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { friendCards, findFriendById } from "~/lib/users/mock-friends";
import type { FriendCard } from "~/types/pages/profile";

const { t, locale, localeProperties } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

const friendId = computed(() => String(route.params.id));
const friend = computed(() => findFriendById(friendId.value));

const pageDescription = computed(
  () => friend.value?.bio?.trim() || t("seo.profileFriends.description"),
);

definePageMeta({
  middleware: "auth",
  title: "profile-friend-details",
  sidebarVariant: "profile",
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
watchEffect(() => {
  if (!friend.value) {
    throw createError({ statusCode: 404, statusMessage: "Profile not found" });
  }
});

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");
const currentRoute = computed(() => router.currentRoute.value);

useHead(() => {
  if (!friend.value) {
    return {};
  }

  const title = `${friend.value.name} · ${t("pages.profileFriends.title")}`;
  const description = pageDescription.value;
  const canonicalPath = currentRoute.value?.path ?? `/profile/${friendId.value}`;
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

const backLink = computed(() => "/profile-friends");

const suggestions = computed(() => friendCards.filter((entry) => entry.id !== friendId.value));

const relatedConnections = computed(() => suggestions.value.slice(0, 8));

const activeNow = computed(() =>
  suggestions.value
    .filter((entry) => entry.status === "online" || entry.status === "focus")
    .slice(0, 4),
);

const { registerRightSidebarContent } = useLayoutRightSidebar();

function sidebarConnectHandler(friend: FriendCard) {
  triggerAction("connect", friend);
}

const sidebarContent = computed(() => {
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
});

registerRightSidebarContent(sidebarContent);

const showActionSnackbar = ref(false);
const snackbarMessage = ref("");

const segmentLabels = computed(() => ({
  design: t("pages.profileFriends.filters.design"),
  product: t("pages.profileFriends.filters.product"),
  engineering: t("pages.profileFriends.filters.engineering"),
  marketing: t("pages.profileFriends.filters.marketing"),
}));

const connectionHighlights = computed(() => {
  if (!friend.value) {
    return [] as Array<{
      id: string;
      icon: string;
      title: string;
      subtitle: string;
    }>;
  }

  const segments = friend.value.segments.map((segment) => segmentLabels.value[segment]).join(" • ");

  return [
    {
      id: "status",
      icon: "mdi:radar",
      title: statusLabel(friend.value.status),
      subtitle: t("pages.profileFriends.meta.lastActive", {
        time: friend.value.lastActive,
      }),
    },
    {
      id: "location",
      icon: "mdi:map-marker-outline",
      title: friend.value.location,
      subtitle: t("pages.profileEdit.labels.location"),
    },
    {
      id: "segments",
      icon: "mdi:briefcase-outline",
      title: segments,
      subtitle: t("pages.profileFriends.filters.all"),
    },
    {
      id: "tags",
      icon: "mdi:tag-multiple-outline",
      title: friend.value.tags.join(" • "),
      subtitle: t("pages.profileEdit.sections.profile.skills"),
    },
  ];
});

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

function triggerAction(action: "message" | "schedule" | "connect", target?: FriendCard) {
  const name = target?.name;

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
