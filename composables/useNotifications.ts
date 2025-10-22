import { computed } from "vue";
import { useI18n, useState } from "#imports";
import type { AppNotification } from "~/types/layout";

type NotificationDefinition = {
  id: string;
  key: string;
  icon: string;
  color?: AppNotification["color"];
  read?: boolean;
};

const NOTIFICATION_STATE_KEY = "app-top-bar-notifications";

export function useNotifications() {
  const { t } = useI18n();

  const notificationDefinitions = useState<NotificationDefinition[]>(
    NOTIFICATION_STATE_KEY,
    () => [
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
    ],
  );

  const notifications = computed<AppNotification[]>(() =>
    notificationDefinitions.value.map((item) => ({
      id: item.id,
      icon: item.icon,
      color: item.color,
      read: item.read,
      title: t(`layout.notificationsMenu.items.${item.key}.title`),
      description: t(
        `layout.notificationsMenu.items.${item.key}.description`,
      ),
      time: t(`layout.notificationsMenu.items.${item.key}.time`),
    })),
  );

  const unreadCount = computed(() =>
    notificationDefinitions.value.filter((item) => !item.read).length,
  );

  const title = computed(() => t("layout.notificationsMenu.title"));
  const subtitle = computed(() => {
    const raw = t("layout.notificationsMenu.subtitle");
    return raw === "layout.notificationsMenu.subtitle" ? undefined : raw;
  });
  const emptyLabel = computed(() => t("layout.notificationsMenu.empty"));
  const markAllLabel = computed(() => t("layout.notificationsMenu.markAll"));
  const badgeLabel = computed(() => {
    const count = unreadCount.value;
    if (count > 0) {
      return t("layout.notificationsMenu.badgeLabel", { count });
    }
    return t("layout.actions.notifications");
  });
  const viewAllLabel = computed(() => {
    const raw = t("layout.notificationsMenu.viewAll");
    return raw === "layout.notificationsMenu.viewAll" ? undefined : raw;
  });

  function markAll() {
    notificationDefinitions.value = notificationDefinitions.value.map(
      (item) => ({
        ...item,
        read: true,
      }),
    );
  }

  function markAsRead(id: string) {
    notificationDefinitions.value = notificationDefinitions.value.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item,
    );
  }

  return {
    notifications,
    unreadCount,
    title,
    subtitle,
    emptyLabel,
    markAllLabel,
    badgeLabel,
    viewAllLabel,
    markAll,
    markAsRead,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
