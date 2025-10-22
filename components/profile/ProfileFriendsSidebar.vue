<template>
  <div class="flex flex-col gap-4">
    <SidebarCard
      class="text-card-foreground pa-4"
      glow
    >
      <h2
        :id="suggestionsHeadingId"
        class="text-h6 font-weight-semibold mb-3"
      >
        {{ t("pages.profileFriends.sections.suggestions") }}
      </h2>
      <v-list
        v-if="suggestions.length"
        lines="two"
        class="py-1 rounded-xl"
        density="comfortable"
      >
        <v-list-item
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="px-2 py-3 transition-colors d-flex align-center gap-3 rounded-xl"
        >
          <template #prepend>
            <div>
              <div>
                <v-avatar size="24">
                  <NuxtImg
                    :src="suggestion.avatar"
                    :alt="suggestion.name"
                    width="24"
                    height="24"
                    fit="cover"
                  />
                </v-avatar>
              </div>
              <div class="text-subtitle-2 text-foreground">{{ suggestion.name }}</div>
            </div>
          </template>
          <template #append>
            <div class="d-flex flex-column align-end gap-2 text-foreground">
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
                @click="handleConnect(suggestion)"
              >
                {{ t("pages.profileFriends.actions.message") }}
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
      <p
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ t("pages.profileFriends.empty") }}
      </p>
    </SidebarCard>

    <SidebarCard
      class="text-card-foreground pa-6 bg-primary/10"
      glow
    >
      <div class="d-flex flex-column gap-3">
        <h2
          :id="activeHeadingId"
          class="text-h6 font-weight-semibold mb-1"
        >
          {{ t("pages.profileFriends.sections.active") }}
        </h2>
        <div
          v-if="activeNow.length"
          class="d-flex flex-column gap-2"
        >
          <div
            v-for="friend in activeNow"
            :key="friend.id"
            class="d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center gap-3">
              <v-avatar size="40">
                <NuxtImg
                  :src="friend.avatar"
                  :alt="friend.name"
                  width="40"
                  height="40"
                  fit="cover"
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
        <p
          v-else
          class="text-body-2 text-medium-emphasis"
        >
          {{ t("pages.profileFriends.empty") }}
        </p>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { FriendCard } from "~/types/pages/profile";

const props = defineProps<{
  suggestions: FriendCard[];
  activeNow: FriendCard[];
  suggestionsHeadingId?: string;
  activeHeadingId?: string;
}>();

const emit = defineEmits<{
  (e: "connect", friend: FriendCard): void;
}>();

const { t } = useI18n();

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

function handleConnect(friend: FriendCard) {
  emit("connect", friend);
}
</script>
