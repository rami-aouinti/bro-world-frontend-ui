<template>
  <div class="flex items-center gap-3">
    <button
      v-if="props.showRightToggle"
      v-show="!props.isMobile"
      type="button"
      :class="props.iconTriggerClasses"
      aria-label="Open widgets"
      @click="emit('toggle-right')"
    >
      <AppIcon
        name="mdi-format-align-justify"
        :size="22"
      />
    </button>
    <MessengerMenu
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
    <NotificationMenu
      :items="props.notifications"
      :icon-trigger-classes="props.iconTriggerClasses"
      :title="props.notificationsTitle"
      :subtitle="props.notificationsSubtitle"
      :empty-text="props.notificationsEmpty"
      :mark-all-text="props.notificationsMarkAll"
      :button-label="props.notificationsButtonLabel"
      :unread-count="props.notificationCount"
      @mark-all="emit('mark-all-notifications')"
    />
    <button
      type="button"
      :class="props.iconTriggerClasses"
      aria-label="Cart"
    >
      <AppIcon
        name="mdi:shopping-outline"
        :size="32"
      />
    </button>
    <ThemePopover />
    <DarkModeToggle />
    <slot name="user" />
    <slot name="locale" />
    <button
      v-if="props.showRightToggle"
      v-show="props.isMobile"
      type="button"
      :class="props.iconTriggerClasses"
      aria-label="Open widgets"
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
import NotificationMenu from "./NotificationMenu.vue";
import MessengerMenu from "~/components/messenger/MessengerMenu.vue";
import type { AppNotification } from "~/types/layout";
import type { MessengerConversation } from "~/types/messenger";

const props = defineProps<{
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
  messengerConversations: MessengerConversation[];
  messengerUnreadCount: number;
  messengerButtonLabel: string;
  messengerTitle: string;
  messengerSubtitle?: string;
  messengerEmpty: string;
  messengerViewAll: string;
  messengerUnknownLabel: string;
  messengerLoading: boolean;
}>();
const emit = defineEmits(["toggle-right", "mark-all-notifications"]);
</script>
