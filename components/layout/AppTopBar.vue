<template>
  <v-app-bar
    app
    role="banner"
    aria-label="Top navigation bar"
    :elevation="24"
    rounded
    flat
    class="app-top-bar text-foreground"
    height="50"
  >
    <span
      class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
    ></span>
    <span
      class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
    ></span>
    <AppBrand class="ml-2 mr-6 px-6" />
    <AppNavButtons
      class="ml-2"
      :is-mobile="props.isMobile"
      :icon-trigger-classes="iconTriggerClasses"
      :navigation-label="navigationLabel"
      :go-back-label="goBackLabel"
      :refresh-label="refreshLabel"
      :refreshing="props.refreshing"
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
      :is-dark="props.isDark"
    />

    <template #append>
      <div class="app-top-bar__append">
        <RightControls
          v-if="isHydrated"
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
          :widgets-label="widgetsLabel"
          :cart-label="cartLabel"
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
              :profile-label="profileLabel"
              @select="handleUserMenuSelect"
            />
          </template>
          <template #locale>
            <LocaleMenu
              :locales="visibleLocales"
              :current="props.locale"
              :icon-trigger-classes="iconTriggerClasses"
              :format-label="formatLocaleLabel"
              :locale-metadata="localeMetadata"
              :title="localeMenuTitle"
              :subtitle="localeMenuSubtitle"
              :button-label="localeButtonLabel"
              @change="changeLocale"
            />
          </template>
        </RightControls>
        <div
          v-else
          class="app-top-bar__append-placeholder"
          aria-hidden="true"
        >
          <span
            v-for="index in placeholderCount"
            :key="index"
            class="app-top-bar__placeholder animate-pulse"
          />
          <span class="app-top-bar__placeholder app-top-bar__placeholder--wide animate-pulse" />
        </div>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { onNuxtReady } from "#app";
import AppBrand from "./app-bar/AppBrand.vue";
import AppNavButtons from "./app-bar/AppNavButtons.vue";
import AppIconBar from "./app-bar/AppIconBar.vue";
import RightControls from "./app-bar/RightControls.vue";
import UserMenu from "./app-bar/UserMenu.vue";
import LocaleMenu from "./app-bar/LocaleMenu.vue";
import { useI18nDocs } from "~/composables/useI18nDocs";
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

type LocaleInput = string | { code?: string | null | undefined };

const props = withDefaults(
  defineProps<{
    appIcons: AppIcon[];
    isDark: boolean;
    isMobile: boolean;
    locale: string;
    locales: LocaleInput[];
    showRightToggle: boolean;
    refreshing?: boolean;
  }>(),
  {
    refreshing: false,
  },
);

const emit = defineEmits(["toggle-left", "toggle-right", "go-back", "refresh", "update:locale"]);

const { t } = useI18n();
const config = useConfig();
const { localePath } = useI18nDocs();
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
} as const satisfies Record<string, { label: string; flag: string }>;
const navigationLabel = computed(() => t("layout.actions.openNavigation"));
const goBackLabel = computed(() => t("layout.actions.goBack"));
const refreshLabel = computed(() => t("layout.actions.refresh"));
const widgetsLabel = computed(() => t("layout.actions.openWidgets"));
const cartLabel = computed(() => t("layout.actions.cart"));
const profileLabel = computed(() => t("layout.actions.profile"));
const localeButtonLabel = computed(() =>
  t("layout.actions.changeLanguage", { locale: formatLocaleLabel(props.locale) }),
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
const placeholderCount = 6;
const isHydrated = ref(false);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

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
  onNuxtReady(() => {
    if (!messengerPreviewConversations.value.length) {
      messenger.fetchThreads({ limit: 3 }).catch(() => {});
    }
  });
}

const userSignedInText = computed(() => t("layout.userMenu.signedInAs"));
const userGuestTitle = computed(() => t("layout.userMenu.guestTitle"));
const userGuestSubtitle = computed(() => t("layout.userMenu.guestSubtitle"));

function addLocaleIfSupported(set: Set<string>, list: string[], code?: string | null) {
  if (!code) {
    return;
  }

  const normalized = code.trim();

  if (!normalized || set.has(normalized) || !(normalized in localeMetadata)) {
    return;
  }

  set.add(normalized);
  list.push(normalized);
}

const visibleLocales = computed(() => {
  const codes: string[] = [];
  const seen = new Set<string>();

  for (const entry of props.locales) {
    const code = typeof entry === "string" ? entry : (entry?.code ?? undefined);
    addLocaleIfSupported(seen, codes, code);
  }

  addLocaleIfSupported(seen, codes, props.locale);

  return codes;
});

const localeMenuTitle = computed(() => t("layout.localeMenu.title"));
const localeMenuSubtitle = computed(() =>
  t("layout.localeMenu.subtitle", { count: visibleLocales.value.length }),
);

const userMenuItems = computed<UserMenuItem[]>(() => {
  if (isAuthenticated.value) {
    const items: UserMenuItem[] = [
      { title: t("layout.actions.viewProfile"), icon: "mdi:account", to: "/profile" },
    ];

    if (canAccessAdmin.value) {
      items.push({ title: t("layout.userMenu.admin"), icon: "mdi:shield-crown", to: "/admin" });
    }
    items.push({
      title: t("layout.sidebar.items.about"),
      icon: "mdi:information-outline",
      to: "/about",
    });
    items.push({ title: t("layout.sidebar.items.help"), icon: "mdi:lifebuoy", to: "/help" });
    items.push({
      title: t("layout.sidebar.items.contact"),
      icon: "mdi:email-outline",
      to: "/contact",
    });

    items.push({ title: t("auth.signOut"), icon: "mdi:logout", to: "logout" });
    return items;
  }
  return [
    { title: t("auth.Login"), icon: "mdi:login", to: "/login" },
    { title: t("auth.Register"), icon: "mdi:account-plus", to: "/register" },
    { title: t("layout.sidebar.items.about"), icon: "mdi:information-outline", to: "/about" },
    { title: t("layout.sidebar.items.help"), icon: "mdi:lifebuoy", to: "/help" },
    { title: t("layout.sidebar.items.contact"), icon: "mdi:email-outline", to: "/contact" },
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
  if (item.to) navigateTo(localePath(item.to));
}

function markAllNotifications() {
  notificationDefinitions.value = notificationDefinitions.value.map((item) => ({
    ...item,
    read: true,
  }));
}
</script>

<style scoped>
.app-top-bar {
  background-image: none !important;
  border: 0 !important;
  box-shadow: 0 18px 40px -22px rgba(var(--v-theme-on-surface), 0.4);
  backdrop-filter: none !important;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  --v-theme-overlay-multiplier: 0;
}

.app-top-bar :deep(.v-toolbar__content) {
  background-color: transparent !important;
  color: inherit;
}

.app-top-bar :deep(.v-btn),
.app-top-bar :deep(.v-icon),
.app-top-bar :deep(.v-toolbar-title),
.app-top-bar :deep(.v-list-item-title),
.app-top-bar :deep(.v-list-item-subtitle),
.app-top-bar :deep(.v-list-item__prepend),
.app-top-bar :deep(.v-list-item__append) {
  color: inherit;
}

.app-top-bar__append {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  min-width: min(100%, 320px);
}

.app-top-bar__append-placeholder {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.app-top-bar__placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: rgba(var(--v-theme-on-surface), 0.16);
}

.app-top-bar__placeholder--wide {
  width: 3.25rem;
}

@media (max-width: 960px) {
  .app-top-bar__append {
    min-width: 0;
  }
}
</style>
