<template>
  <div class="flex items-center gap-3">
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

    <slot name="user" />
    <slot name="locale" />

    <ThemePopover />
    <DarkModeToggle />

    <button
      v-if="!props.isMobile && props.showRightToggle"
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
    <button
      v-if="props.isMobile && props.showRightToggle"
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
import type { AppNotification } from "~/types/layout";

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
}>();
const emit = defineEmits(["toggle-right", "mark-all-notifications"]);
</script>
