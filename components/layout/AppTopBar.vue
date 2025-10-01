<template>
  <v-app-bar
    class="app-top-bar"
    :class="gradientIsDark ? 'text-white' : 'text-black'"
    :color="appBarColor"
    app
    :elevation="10"
    rounded
    height="50"
  >
    <template #image>
      <v-img
        cover
        :gradient="barGradient"
      ></v-img>
    </template>
    <AppBrand class="ml-2" />
    <AppNavButtons
      :is-mobile="props.isMobile"
      :icon-trigger-classes="iconTriggerClasses"
      @toggle-left="$emit('toggle-left')"
      @go-back="$emit('go-back')"
      @refresh="$emit('refresh')"
    />

    <div
      v-if="showInlineSearch"
      class="hidden flex-1 items-center px-4 md:flex"
    >
      <LayoutSearchButton class="w-full max-w-2xl" />
    </div>
    <div
      v-else-if="showSearchButton"
      class="hidden md:flex"
    >
      <LayoutSearchButton />
    </div>

    <AppIconBar
      :app-icons="props.appIcons"
      :icon-trigger-classes="iconTriggerClasses"
      :t="t"
    />

    <template #append>
      <RightControls
        :is-mobile="props.isMobile"
        :show-right-toggle="props.showRightToggle"
        :icon-trigger-classes="iconTriggerClasses"
        :notifications="notifications"
        :notification-count="notificationCount"
        :notifications-title="notificationsTitle"
        :notifications-subtitle="notificationsSubtitle"
        :notifications-empty="notificationsEmpty"
        :notifications-mark-all="notificationsMarkAll"
        :notifications-button-label="notificationsButtonLabel"
        :messenger-conversations="messengerPreviewConversations"
        :messenger-unread-count="messengerUnreadCount"
        :messenger-button-label="messengerButtonLabel"
        :messenger-title="messengerTitle"
        :messenger-subtitle="messengerSubtitle"
        :messenger-empty="messengerEmpty"
        :messenger-view-all="messengerViewAll"
        :messenger-unknown-label="messengerUnknownLabel"
        :messenger-loading="messengerMenuLoading"
        @toggle-right="$emit('toggle-right')"
        @mark-all-notifications="markAllNotifications"
      >
        <template #user>
          <UserMenu
            :items="userMenuItems"
            :icon-trigger-classes="iconTriggerClasses"
            :logging-out="loggingOut"
            :user="currentUser"
            :signed-in-text="userSignedInText"
            :guest-title="userGuestTitle"
            :guest-subtitle="userGuestSubtitle"
            @select="handleUserMenuSelect"
          />
        </template>
        <template #locale>
          <LocaleMenu
            :locales="props.locales"
            :current="props.locale"
            :icon-trigger-classes="iconTriggerClasses"
            :format-label="formatLocaleLabel"
            :locale-metadata="localeMetadata"
            :title="localeMenuTitle"
            :subtitle="localeMenuSubtitle"
            @change="changeLocale"
          />
        </template>
      </RightControls>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import AppBrand from "./AppBar/AppBrand.vue";
import AppNavButtons from "./AppBar/AppNavButtons.vue";
import AppIconBar from "./AppBar/AppIconBar.vue";
import UserMenu from "./AppBar/UserMenu.vue";
import LocaleMenu from "./AppBar/LocaleMenu.vue";
import RightControls from "./AppBar/RightControls.vue";
import { usePrimaryGradient } from "~/composables/usePrimaryGradient";
import { useAuthSession } from "~/stores/auth-session";
import { useMessengerStore } from "~/stores/messenger";
import type { AppNotification } from "~/types/layout";
import { ADMIN_ROLE_KEYS } from "~/lib/navigation/sidebar";

type AppIcon = { name: string; label: string; size?: number; to: string };
type UserMenuItem = { title: string; icon: string; to?: string; action?: "logout" };
type NotificationKey = "newFollower" | "newComment" | "systemUpdate";
type NotificationDefinition = {
  id: string;
  key: NotificationKey;
  icon: string;
  color?: AppNotification["color"];
  read: boolean;
};

const props = defineProps<{
  appIcons: AppIcon[];
  isDark: boolean;
  isMobile: boolean;
  locale: string;
  locales: string[];
  showRightToggle: boolean;
}>();

const emit = defineEmits(["toggle-left", "toggle-right", "go-back", "refresh", "update:locale"]);

const { t } = useI18n();
const config = useConfig();
const auth = useAuthSession();
const messenger = useMessengerStore();

const iconTriggerClasses =
  "flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2";

const localeMetadata = {
  en: { label: "English", flag: "gb" },
  de: { label: "Deutsch", flag: "de" },
  fr: { label: "Français", flag: "fr" },
  es: { label: "Español", flag: "es" },
  it: { label: "Italiano", flag: "it" },
  ru: { label: "Русский", flag: "ru" },
  ar: { label: "العربية", flag: "tn" },
  "zh-cn": { label: "中文 (简体)", flag: "cn" },
} as const satisfies Record<string, { label: string; flag: string }>;

/** Dégradés dynamiques depuis primary + mode sombre */
const { barGradient, isDark: gradientIsDark } = usePrimaryGradient();

const appBarColor = computed(() =>
  props.isDark ? "rgba(12, 10, 22, 0.78)" : "rgba(255, 255, 255, 0.82)",
);
const showInlineSearch = computed(
  () => !config.value.search.inAside && config.value.search.style === "input",
);
const showSearchButton = computed(
  () => !config.value.search.inAside && config.value.search.style === "button",
);

const isAuthenticated = computed(() => auth.isAuthenticated.value);
const currentUser = computed(() => auth.currentUser.value);
const loggingOut = ref(false);
const adminRoleSet = new Set<string>(ADMIN_ROLE_KEYS);
const canAccessAdmin = computed(() => {
  if (!isAuthenticated.value) return false;
  const roles = currentUser.value?.roles ?? [];
  return roles.some((role) => adminRoleSet.has(role));
});

const notificationDefinitions = ref<NotificationDefinition[]>([
  {
    id: "new-follower",
    key: "newFollower",
    icon: "mdi:account-plus",
    color: "primary",
    read: false,
  },
  {
    id: "new-comment",
    key: "newComment",
    icon: "mdi:message-reply-text",
    color: "info",
    read: false,
  },
  {
    id: "system-update",
    key: "systemUpdate",
    icon: "mdi:calendar-clock",
    color: "warning",
    read: true,
  },
]);

const notifications = computed<AppNotification[]>(() =>
  notificationDefinitions.value.map((item) => ({
    id: item.id,
    icon: item.icon,
    color: item.color,
    read: item.read,
    title: t(`layout.notificationsMenu.items.${item.key}.title`),
    description: t(`layout.notificationsMenu.items.${item.key}.description`),
    time: t(`layout.notificationsMenu.items.${item.key}.time`),
  })),
);

const notificationCount = computed(
  () => notificationDefinitions.value.filter((item) => !item.read).length,
);

const notificationsTitle = computed(() => t("layout.notificationsMenu.title"));
const notificationsSubtitle = computed(() => t("layout.notificationsMenu.subtitle"));
const notificationsEmpty = computed(() => t("layout.notificationsMenu.empty"));
const notificationsMarkAll = computed(() => t("layout.notificationsMenu.markAll"));
const notificationsButtonLabel = computed(() => {
  const count = notificationCount.value;
  if (count > 0) {
    return t("layout.notificationsMenu.badgeLabel", { count });
  }
  return t("layout.actions.notifications");
});

const messengerPreviewConversations = computed(() => messenger.previewConversations.value ?? []);
const messengerUnreadCount = computed(() => messenger.unreadTotal.value);
const messengerTitle = computed(() => t("layout.messengerMenu.title"));
const messengerSubtitle = computed(() => {
  const raw = t("layout.messengerMenu.subtitle");
  return raw === "layout.messengerMenu.subtitle" ? undefined : raw;
});
const messengerEmpty = computed(() => t("layout.messengerMenu.empty"));
const messengerViewAll = computed(() => t("layout.messengerMenu.viewAll"));
const messengerUnknownLabel = computed(() => t("messenger.unknownParticipant"));
const messengerMenuLoading = computed(() => messenger.loadingPreview.value);
const messengerButtonLabel = computed(() => {
  const count = messengerUnreadCount.value;
  if (count > 0) {
    return t("layout.messengerMenu.badgeLabel", { count });
  }
  return t("layout.actions.messages");
});

if (import.meta.client) {
  onMounted(() => {
    if (!messengerPreviewConversations.value.length) {
      messenger.fetchThreads({ limit: 3 }).catch(() => {});
    }
  });
}

const userSignedInText = computed(() => t("layout.userMenu.signedInAs"));
const userGuestTitle = computed(() => t("layout.userMenu.guestTitle"));
const userGuestSubtitle = computed(() => t("layout.userMenu.guestSubtitle"));

const localeMenuTitle = computed(() => t("layout.localeMenu.title"));
const localeMenuSubtitle = computed(() =>
  t("layout.localeMenu.subtitle", { count: props.locales.length }),
);

const userMenuItems = computed<UserMenuItem[]>(() => {
  if (isAuthenticated.value) {
    const items: UserMenuItem[] = [
      { title: t("layout.actions.viewProfile"), icon: "mdi:account", to: "/profile" },
    ];

    if (canAccessAdmin.value) {
      items.push({ title: t("layout.userMenu.admin"), icon: "mdi-shield-crown", to: "/admin" });
    }

    items.push({ title: t("auth.signOut"), icon: "mdi:logout", action: "logout" });
    return items;
  }
  return [
    { title: t("auth.Login"), icon: "mdi:login", to: "/login" },
    { title: t("auth.Register"), icon: "mdi:account-plus", to: "/register" },
  ];
});

function formatLocaleLabel(v: string) {
  return localeMetadata[v]?.label ?? v;
}
function changeLocale(value: string) {
  emit("update:locale", value);
}

async function handleUserMenuSelect(item: UserMenuItem) {
  if (item.action === "logout") {
    if (loggingOut.value) return;
    loggingOut.value = true;
    try {
      await auth.logout();
    } finally {
      loggingOut.value = false;
    }
    return;
  }
  if (item.to) navigateTo(useI18nDocs().localePath(item.to));
}

function markAllNotifications() {
  notificationDefinitions.value = notificationDefinitions.value.map((item) => ({
    ...item,
    read: true,
  }));
}
</script>
