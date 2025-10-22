<template>
  <div class="flex items-center gap-3">
    <button
      v-show="showToggleButtons"
      type="button"
      :class="desktopToggleClasses"
      :aria-label="props.widgetsLabel"
      @click="emit('toggle-right')"
    >
      <AppIcon
        name="mdi:format-align-justify"
        :size="22"
      />
    </button>
    <NotificationMenu
      v-if="isAuthenticated"
      :items="props.notifications"
      :icon-trigger-classes="props.iconTriggerClasses"
      :title="props.notificationsTitle"
      :subtitle="props.notificationsSubtitle"
      :empty-text="props.notificationsEmpty"
      :mark-all-text="props.notificationsMarkAll"
      :button-label="props.notificationsButtonLabel"
      :unread-count="props.notificationCount"
      :view-all-text="props.notificationsViewAll"
      :view-all-to="props.notificationsViewAllTo"
      @mark-all="emit('mark-all-notifications')"
    />
    <button
      v-else
      type="button"
      :class="[props.iconTriggerClasses, 'opacity-60']"
      :aria-label="props.notificationsButtonLabel"
      aria-disabled="true"
      disabled
    >
      <AppIcon
        name="mdi:bell-outline"
        :size="26"
      />
    </button>
    <MessengerMenu
      v-if="props.messengerEnabled && isAuthenticated"
      :conversations="props.messengerConversations"
      :icon-trigger-classes="props.iconTriggerClasses"
      :title="props.messengerTitle"
      :subtitle="props.messengerSubtitle"
      :view-all-label="props.messengerViewAll"
      :button-label="props.messengerButtonLabel"
      :unread-count="props.messengerUnreadCount"
      :empty-text="props.messengerEmpty"
      :unknown-label="props.messengerUnknownLabel"
      :loading="props.messengerLoading"
    />
    <button
      v-else-if="props.messengerEnabled"
      type="button"
      :class="[props.iconTriggerClasses, 'opacity-60']"
      :aria-label="props.messengerButtonLabel"
      aria-disabled="true"
      disabled
    >
      <AppIcon
        name="mdi:message-outline"
        :size="26"
      />
    </button>
    <button
      v-if="props.cartEnabled"
      type="button"
      :class="props.iconTriggerClasses"
      :aria-label="props.cartLabel"
    >
      <AppIcon
        name="mdi:shopping-outline"
        :size="32"
      />
    </button>
    <ThemePopover :trigger-class="props.iconTriggerClasses" />
    <DarkModeToggle :button-class="props.iconTriggerClasses" />
    <slot name="user" />
    <slot name="locale" />
    <button
      v-show="showToggleButtons"
      type="button"
      :class="mobileToggleClasses"
      :aria-label="props.widgetsLabel"
      @click="emit('toggle-right')"
    >
      <AppIcon
        name="mdi:dots-vertical"
        :size="22"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NotificationMenu from "./NotificationMenu.vue";
import type { AppNotification } from "~/types/layout";
import type { MessengerConversation } from "~/types/messenger";
import ThemePopover from "../../ThemePopover.vue";
import DarkModeToggle from "../../DarkModeToggle.vue";
import AppIcon from "../AppIcon.vue";
import { useAuthStore } from "~/composables/useAuthStore";
import MessengerMenu from "~/components/messenger/MessengerMenu.vue";

const props = withDefaults(
  defineProps<{
    isMobile: boolean;
    showRightToggle: boolean;
    iconTriggerClasses: string;
    notifications: AppNotification[];
    notificationCount: number;
    notificationsTitle: string;
    notificationsSubtitle?: string;
    notificationsEmpty: string;
    notificationsMarkAll: string;
    notificationsButtonLabel: string;
    notificationsViewAll?: string;
    notificationsViewAllTo?: string;
    messengerConversations: MessengerConversation[];
    messengerUnreadCount: number;
    messengerButtonLabel: string;
    messengerTitle: string;
    messengerSubtitle?: string;
    messengerEmpty: string;
    messengerViewAll: string;
    messengerUnknownLabel: string;
    messengerLoading: boolean;
    widgetsLabel: string;
    cartLabel: string;
    messengerEnabled?: boolean;
    cartEnabled?: boolean;
  }>(),
  {
    messengerEnabled: true,
    cartEnabled: true,
  },
);
const desktopToggleClasses = computed(() => `${props.iconTriggerClasses} hidden md:flex`);
const mobileToggleClasses = computed(() => `${props.iconTriggerClasses} md:hidden`);
const showToggleButtons = computed(() => props.showRightToggle);

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated.value);
const emit = defineEmits(["toggle-right", "mark-all-notifications"]);
</script>
