<template>
  <main aria-labelledby="notifications-title">
    <v-row>
      <v-col cols="12">
        <header
          class="mb-6"
          aria-describedby="notifications-description"
        >
          <h1
            id="notifications-title"
            class="text-h4 font-weight-semibold mb-2"
          >
            {{ notificationsTitle }}
          </h1>
          <p
            v-if="notificationsSubtitle"
            id="notifications-description"
            class="text-body-1 text-medium-emphasis mb-4"
          >
            {{ notificationsSubtitle }}
          </p>
          <p
            v-else
            id="notifications-description"
            class="text-body-1 text-medium-emphasis mb-4"
          >
            {{ description }}
          </p>
          <div class="d-flex flex-wrap align-center gap-3">
            <v-btn
              color="primary"
              variant="flat"
              :disabled="!hasUnread"
              @click="handleMarkAll"
            >
              {{ notificationsMarkAll }}
            </v-btn>
            <span class="text-body-2 text-medium-emphasis">
              {{ summary }}
            </span>
          </div>
        </header>

        <v-card
          class="notifications-card"
          rounded="xl"
          elevation="0"
        >
          <template v-if="notifications.length">
            <v-list
              class="py-0"
              lines="two"
            >
              <v-list-item
                v-for="item in notifications"
                :key="item.id"
                :class="['notifications-item', !item.read ? 'notifications-item--unread' : '']"
              >
                <template #prepend>
                  <div
                    class="notifications-item__icon"
                    :class="resolveColorClass(item.color)"
                  >
                    <AppIcon
                      :name="item.icon"
                      :size="22"
                    />
                  </div>
                </template>
                <div class="d-flex flex-column gap-1 mx-4">
                  <p class="text-body-1 font-weight-medium mb-0">
                    {{ item.title }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ item.description }}
                  </p>
                </div>
                <template #append>
                  <span class="text-caption text-medium-emphasis">
                    {{ item.time }}
                  </span>
                </template>
              </v-list-item>
            </v-list>
          </template>
          <div
            v-else
            class="notifications-empty"
          >
            <div class="notifications-empty__icon">
              <AppIcon
                name="mdi:bell-outline"
                :size="32"
              />
            </div>
            <p class="text-body-1 font-weight-medium mb-1">
              {{ notificationsEmpty }}
            </p>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ description }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "~/composables/useNotifications";

definePageMeta({
  showRightWidgets: true,
  showContactSidebarCard: true,
  documentDriven: false,
  middleware: "auth",
  rightSidebarPreset: "dashboard",
});

const { t } = useI18n();
const notificationCenter = useNotifications();

const notifications = notificationCenter.notifications;
const unreadCount = notificationCenter.unreadCount;
const notificationsTitle = notificationCenter.title;
const notificationsSubtitle = notificationCenter.subtitle;
const notificationsEmpty = notificationCenter.emptyLabel;
const notificationsMarkAll = notificationCenter.markAllLabel;

const description = computed(() => t("pages.notifications.description"));
const summary = computed(() => {
  const total = notifications.value.length;
  const unread = unreadCount.value;

  if (total === 0) {
    return t("pages.notifications.summary.empty");
  }

  if (unread === 0) {
    return t("pages.notifications.summary.allRead", { total });
  }

  return t("pages.notifications.summary.unread", { total, unread });
});

const hasUnread = computed(() => unreadCount.value > 0);

function handleMarkAll() {
  notificationCenter.markAll();
}

useSeoMeta(() => ({
  title: notificationsTitle.value,
  description: description.value,
}));

function resolveColorClass(color?: (typeof notifications.value)[number]["color"]) {
  switch (color) {
    case "success":
      return "notifications-item__icon--success";
    case "warning":
      return "notifications-item__icon--warning";
    case "info":
      return "notifications-item__icon--info";
    case "error":
      return "notifications-item__icon--error";
    case "primary":
    default:
      return "notifications-item__icon--primary";
  }
}
</script>

<style scoped>
.notifications-page {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.08), transparent 45%),
    radial-gradient(circle at bottom right, rgba(var(--v-theme-primary), 0.06), transparent 40%);
}

.notifications-card {
  background-color: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(16px);
}

.notifications-item {
  padding-block: 18px;
  border-inline: 0;
}

.notifications-item--unread {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.notifications-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  width: 44px;
  border-radius: 50%;
}

.notifications-item__icon--primary {
  background-color: rgba(var(--v-theme-primary), 0.16);
  color: rgb(var(--v-theme-primary));
}

.notifications-item__icon--success {
  background-color: rgba(var(--v-theme-success), 0.16);
  color: rgb(var(--v-theme-success));
}

.notifications-item__icon--warning {
  background-color: rgba(var(--v-theme-warning), 0.16);
  color: rgb(var(--v-theme-warning));
}

.notifications-item__icon--info {
  background-color: rgba(var(--v-theme-info), 0.16);
  color: rgb(var(--v-theme-info));
}

.notifications-item__icon--error {
  background-color: rgba(var(--v-theme-error), 0.16);
  color: rgb(var(--v-theme-error));
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 48px 24px;
}

.notifications-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 56px;
  border-radius: 999px;
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
</style>
