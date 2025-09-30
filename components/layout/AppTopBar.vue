<template>
  <v-app-bar
    class="app-top-bar"
    :class="isDark ? 'text-white' : 'text-black'"
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
        @toggle-right="$emit('toggle-right')"
      >
        <template #user>
          <UserMenu
            :items="userMenuItems"
            :icon-trigger-classes="iconTriggerClasses"
            :logging-out="loggingOut"
            @select="handleUserMenuSelect"
          />
        </template>
        <template #locale>
          <LocaleMenu
            :locales="props.locales"
            :current="props.locale"
            :icon-trigger-classes="iconTriggerClasses"
            :format-label="formatLocaleLabel"
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

type AppIcon = { name: string; label: string; size?: number; to: string };
type UserMenuItem = { title: string; icon: string; to?: string; action?: "logout" };

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

const iconTriggerClasses =
  "flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2";

/** Dégradés dynamiques depuis primary + mode sombre */
const { barGradient, isDark } = usePrimaryGradient();

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
const loggingOut = ref(false);

const userMenuItems = computed<UserMenuItem[]>(() => {
  if (isAuthenticated.value) {
    return [
      { title: t("layout.actions.viewProfile"), icon: "mdi:account", to: "/profile" },
      { title: t("auth.signOut"), icon: "mdi:logout", action: "logout" },
    ];
  }
  return [
    { title: t("auth.Login"), icon: "mdi:login", to: "/login" },
    { title: t("auth.Register"), icon: "mdi:account-plus", to: "/register" },
  ];
});

function formatLocaleLabel(v: string) {
  switch (v) {
    case "en":
      return "English";
    case "de":
      return "Deutsch";
    case "fr":
      return "Français";
    case "es":
      return "Español";
    case "it":
      return "Italiano";
    case "ru":
      return "Русский";
    case "ar":
      return "العربية";
    case "zh-cn":
      return "中文 (简体)";
    default:
      return v;
  }
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
</script>
