<template>
  <div class="d-flex flex-column gap-4">
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      padding="none"
      glow
    >
      <div class="d-flex flex-column gap-4">
        <header class="d-flex gap-3 align-start">
          <v-avatar
            color="primary"
            variant="tonal"
            size="48"
          >
            <v-icon icon="mdi:bell-ring-outline" />
          </v-avatar>
          <div>
            <h2 class="text-subtitle-1 font-weight-semibold mb-1">
              {{ t("pages.profileNotifications.sidebar.digestTitle") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ digestLine }}
            </p>
          </div>
        </header>
        <v-alert
          type="info"
          variant="tonal"
          color="primary"
          density="comfortable"
          border="start"
          border-color="primary"
        >
          {{ t("pages.profileNotifications.sidebar.digestInfo") }}
        </v-alert>
      </div>
    </SidebarCard>

    <SidebarCard
      class="text-card-foreground px-3 py-2"
      padding="none"
      glow
    >
      <div class="d-flex flex-column gap-3">
        <h2 class="text-subtitle-1 font-weight-semibold mb-1">
          {{ t("pages.profileNotifications.sidebar.tipsTitle") }}
        </h2>
        <v-list
          density="compact"
          lines="two"
          class="bg-transparent"
        >
          <v-list-item
            v-for="tip in tips"
            :key="tip.key"
          >
            <template #prepend>
              <v-icon
                color="primary"
                icon="mdi:check-circle-outline"
              />
            </template>
            <v-list-item-title>{{ tip.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-medium-emphasis">
              {{ tip.subtitle }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();

const digestTime = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, {
    hour: "numeric",
    minute: "2-digit",
  });
  const reference = new Date();
  reference.setHours(8, 0, 0, 0);
  return formatter.format(reference);
});

const digestLine = computed(() =>
  t("pages.profileNotifications.sidebar.digestLine", {
    day: t("pages.profileNotifications.sidebar.digestDay"),
    time: digestTime.value,
  }),
);

const tips = computed(() => [
  {
    key: "mobile",
    title: t("pages.profileNotifications.sidebar.tips.mobile.title"),
    subtitle: t("pages.profileNotifications.sidebar.tips.mobile.subtitle"),
  },
  {
    key: "channels",
    title: t("pages.profileNotifications.sidebar.tips.channels.title"),
    subtitle: t("pages.profileNotifications.sidebar.tips.channels.subtitle"),
  },
  {
    key: "updates",
    title: t("pages.profileNotifications.sidebar.tips.updates.title"),
    subtitle: t("pages.profileNotifications.sidebar.tips.updates.subtitle"),
  },
]);
</script>
