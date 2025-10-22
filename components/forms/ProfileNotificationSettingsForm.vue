<template>
  <v-row
    align="stretch"
    dense
    class="profile-notifications-form"
  >
    <v-col cols="12">
      <SidebarCard
        class="text-card-foreground px-3 py-2"
        padding="none"
        glow
      >
        <div class="d-flex flex-column gap-6">
          <header
            class="d-flex flex-column flex-lg-row gap-4 justify-space-between"
            aria-describedby="profile-notifications-subtitle"
          >
            <div class="d-flex flex-column gap-1">
              <h1
                id="profile-notifications-title"
                class="text-h5 text-lg-h4 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.title") }}
              </h1>
              <p
                id="profile-notifications-subtitle"
                class="text-body-2 text-medium-emphasis mb-0"
              >
                {{ t("pages.profileNotifications.subtitle") }}
              </p>
            </div>
            <div class="d-flex gap-3 flex-wrap">
              <v-btn
                variant="outlined"
                color="primary"
                @click="handleReset"
              >
                {{ t("pages.profileNotifications.actions.reset") }}
              </v-btn>
              <v-btn
                color="primary"
                :loading="isSaving"
                @click="handleSave"
              >
                {{ t("pages.profileNotifications.actions.save") }}
              </v-btn>
            </div>
          </header>

          <v-divider />

          <section aria-labelledby="delivery-channels">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="delivery-channels"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.channels.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.channels.description") }}
              </p>
            </div>
            <v-row dense>
              <v-col
                v-for="channel in channelItems"
                :key="channel.key"
                cols="12"
                md="6"
              >
                <v-checkbox
                  v-model="form.channels[channel.key]"
                  :label="channel.label"
                  :value="true"
                  color="primary"
                  hide-details
                />
              </v-col>
            </v-row>
          </section>

          <v-divider />

          <section aria-labelledby="email-notifications">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="email-notifications"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.email.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.email.description") }}
              </p>
            </div>
            <v-row dense>
              <v-col
                v-for="emailItem in emailItems"
                :key="emailItem.key"
                cols="12"
                md="6"
              >
                <v-checkbox
                  v-model="form.email[emailItem.key]"
                  :disabled="!form.channels.email"
                  :label="emailItem.label"
                  color="primary"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-alert
              v-if="!form.channels.email"
              type="info"
              variant="tonal"
              color="primary"
              border="start"
              border-color="primary"
              density="comfortable"
              class="mt-3"
            >
              {{ t("pages.profileNotifications.helpers.emailDisabled") }}
            </v-alert>
          </section>

          <v-divider />

          <section aria-labelledby="in-app-notifications">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="in-app-notifications"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.inApp.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.inApp.description") }}
              </p>
            </div>
            <div class="d-flex flex-column gap-3">
              <v-switch
                v-for="inAppItem in inAppItems"
                :key="inAppItem.key"
                v-model="form.inApp[inAppItem.key]"
                :label="inAppItem.label"
                color="primary"
                :disabled="!form.channels.inApp"
                inset
              />
            </div>
            <div class="d-flex flex-column gap-2 mt-3">
              <v-switch
                v-model="form.playSounds"
                :label="t('pages.profileNotifications.sections.inApp.playSounds')"
                color="primary"
                :disabled="!form.channels.inApp"
                inset
              />
              <v-switch
                v-model="form.smartSummaries"
                :label="t('pages.profileNotifications.sections.inApp.smartSummaries')"
                color="primary"
                :disabled="!form.channels.inApp"
                inset
              />
            </div>
          </section>

          <v-divider />

          <section aria-labelledby="digest-preferences">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="digest-preferences"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.digest.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.digest.description") }}
              </p>
            </div>
            <div class="d-flex flex-column flex-lg-row gap-4">
              <div class="flex-grow-1">
                <v-switch
                  v-model="form.digest.enabled"
                  :label="t('pages.profileNotifications.sections.digest.enableLabel')"
                  color="primary"
                  inset
                />
              </div>
              <div class="flex-grow-1 d-flex flex-column gap-3">
                <v-select
                  v-model="form.digest.frequency"
                  :items="digestFrequencyItems"
                  :label="t('pages.profileNotifications.sections.digest.frequencyLabel')"
                  :disabled="!form.digest.enabled"
                  variant="outlined"
                  density="comfortable"
                />
                <v-select
                  v-model="form.digest.time"
                  :items="digestTimeOptions"
                  :label="t('pages.profileNotifications.sections.digest.timeLabel')"
                  :disabled="!form.digest.enabled"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </div>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ digestSummary }}
            </p>
          </section>

          <v-divider />

          <section aria-labelledby="quiet-hours">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="quiet-hours"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.quietHours.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.quietHours.description") }}
              </p>
            </div>
            <div class="d-flex flex-column flex-lg-row gap-4">
              <v-switch
                v-model="form.quietHours.enabled"
                :label="t('pages.profileNotifications.sections.quietHours.enableLabel')"
                color="primary"
                inset
              />
              <div class="d-flex flex-column flex-sm-row gap-4 flex-grow-1">
                <v-select
                  v-model="form.quietHours.start"
                  :items="digestTimeOptions"
                  :label="t('pages.profileNotifications.sections.quietHours.start')"
                  :disabled="!form.quietHours.enabled"
                  variant="outlined"
                  density="comfortable"
                />
                <v-select
                  v-model="form.quietHours.end"
                  :items="digestTimeOptions"
                  :label="t('pages.profileNotifications.sections.quietHours.end')"
                  :disabled="!form.quietHours.enabled"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </div>
          </section>

          <v-divider />

          <section aria-labelledby="critical-alerts">
            <div class="d-flex flex-column gap-2 mb-2">
              <h2
                id="critical-alerts"
                class="text-h6 font-weight-semibold"
              >
                {{ t("pages.profileNotifications.sections.security.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileNotifications.sections.security.description") }}
              </p>
            </div>
            <v-switch
              v-model="form.securityAlerts"
              :label="t('pages.profileNotifications.sections.security.label')"
              color="primary"
              inset
              disabled
            />
            <v-alert
              type="warning"
              variant="tonal"
              color="warning"
              density="comfortable"
              class="mt-3"
            >
              {{ t("pages.profileNotifications.helpers.securityAlwaysOn") }}
            </v-alert>
          </section>
        </div>
      </SidebarCard>
    </v-col>
  </v-row>

  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    timeout="2500"
    variant="flat"
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import type { NotificationPreferences } from "~/types/pages/profile";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();
const auth = useAuthSession();
const isSaving = ref(false);

function createDefaultPreferences(): NotificationPreferences {
  const defaultEmail = auth.currentUser.value?.email;

  return {
    channels: {
      email: Boolean(defaultEmail),
      push: true,
      sms: false,
      inApp: true,
    },
    email: {
      comments: true,
      mentions: true,
      follows: false,
      messages: true,
      newsletters: true,
    },
    inApp: {
      productUpdates: true,
      eventReminders: true,
      securityAlerts: true,
      communityHighlights: true,
    },
    digest: {
      enabled: true,
      frequency: "weekly",
      time: "08:00",
    },
    quietHours: {
      enabled: false,
      start: "21:00",
      end: "07:00",
    },
    playSounds: true,
    smartSummaries: true,
    securityAlerts: true,
  };
}

function clonePreferences(preferences: NotificationPreferences): NotificationPreferences {
  return {
    channels: { ...preferences.channels },
    email: { ...preferences.email },
    inApp: { ...preferences.inApp },
    digest: { ...preferences.digest },
    quietHours: { ...preferences.quietHours },
    playSounds: preferences.playSounds,
    smartSummaries: preferences.smartSummaries,
    securityAlerts: preferences.securityAlerts,
  };
}

const savedPreferences = ref<NotificationPreferences>(createDefaultPreferences());
const form = reactive(clonePreferences(savedPreferences.value));

watch(
  () => auth.currentUser.value?.email,
  () => {
    const hasEmail = Boolean(auth.currentUser.value?.email);

    if (!hasEmail) {
      form.channels.email = false;
    } else if (!savedPreferences.value.channels.email) {
      form.channels.email = false;
    } else {
      form.channels.email = true;
    }
  },
  { immediate: true },
);

const channelItems = computed(() => [
  {
    key: "email" as const,
    label: t("pages.profileNotifications.channelLabels.email"),
  },
  {
    key: "push" as const,
    label: t("pages.profileNotifications.channelLabels.push"),
  },
  {
    key: "sms" as const,
    label: t("pages.profileNotifications.channelLabels.sms"),
  },
  {
    key: "inApp" as const,
    label: t("pages.profileNotifications.channelLabels.inApp"),
  },
]);

const emailItems = computed(() => [
  {
    key: "comments" as const,
    label: t("pages.profileNotifications.sections.email.items.comments"),
  },
  {
    key: "mentions" as const,
    label: t("pages.profileNotifications.sections.email.items.mentions"),
  },
  {
    key: "follows" as const,
    label: t("pages.profileNotifications.sections.email.items.follows"),
  },
  {
    key: "messages" as const,
    label: t("pages.profileNotifications.sections.email.items.messages"),
  },
  {
    key: "newsletters" as const,
    label: t("pages.profileNotifications.sections.email.items.newsletters"),
  },
]);

const inAppItems = computed(() => [
  {
    key: "productUpdates" as const,
    label: t("pages.profileNotifications.sections.inApp.items.productUpdates"),
  },
  {
    key: "eventReminders" as const,
    label: t("pages.profileNotifications.sections.inApp.items.eventReminders"),
  },
  {
    key: "securityAlerts" as const,
    label: t("pages.profileNotifications.sections.inApp.items.securityAlerts"),
  },
  {
    key: "communityHighlights" as const,
    label: t("pages.profileNotifications.sections.inApp.items.communityHighlights"),
  },
]);

const digestFrequencyItems = computed(() => [
  {
    title: t("pages.profileNotifications.sections.digest.options.daily"),
    value: "daily",
  },
  {
    title: t("pages.profileNotifications.sections.digest.options.weekly"),
    value: "weekly",
  },
  {
    title: t("pages.profileNotifications.sections.digest.options.monthly"),
    value: "monthly",
  },
]);

function formatTimeLabel(value: string): string {
  const [hour, minute] = value.split(":").map(Number);
  const formatter = new Intl.DateTimeFormat(locale.value, {
    hour: "numeric",
    minute: "2-digit",
  });
  const date = new Date();
  date.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return formatter.format(date);
}

const digestTimeOptions = computed(() => {
  return Array.from({ length: 24 }, (_, index) => {
    const value = `${String(index).padStart(2, "0")}:00`;
    return {
      title: formatTimeLabel(value),
      value,
    };
  });
});

const digestSummary = computed(() => {
  if (!form.digest.enabled) {
    return t("pages.profileNotifications.sections.digest.helperDisabled");
  }

  const frequencyLabel = digestFrequencyItems.value.find(
    (item) => item.value === form.digest.frequency,
  )?.title;

  const timeLabel = formatTimeLabel(form.digest.time);

  return t("pages.profileNotifications.sections.digest.helper", {
    frequency: frequencyLabel ?? form.digest.frequency,
    time: timeLabel,
  });
});

const snackbar = reactive({
  visible: false,
  message: "",
  color: "primary" as "primary" | "success" | "warning" | "info",
});

function showSnackbar(message: string, color: "primary" | "success" | "warning" | "info" = "success") {
  snackbar.visible = false;
  snackbar.message = message;
  snackbar.color = color;
  requestAnimationFrame(() => {
    snackbar.visible = true;
  });
}

function handleSave() {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;

  setTimeout(() => {
    savedPreferences.value = clonePreferences(form);
    isSaving.value = false;
    showSnackbar(t("pages.profileNotifications.snackbar.saved"));
  }, 350);
}

function handleReset() {
  const resetTarget = clonePreferences(savedPreferences.value);
  Object.assign(form.channels, resetTarget.channels);
  Object.assign(form.email, resetTarget.email);
  Object.assign(form.inApp, resetTarget.inApp);
  Object.assign(form.digest, resetTarget.digest);
  Object.assign(form.quietHours, resetTarget.quietHours);
  form.playSounds = resetTarget.playSounds;
  form.smartSummaries = resetTarget.smartSummaries;
  form.securityAlerts = resetTarget.securityAlerts;

  showSnackbar(t("pages.profileNotifications.snackbar.reset"), "info");
}
</script>

<style scoped>
.profile-notifications-form :deep(.v-selection-control) {
  margin-bottom: 0.5rem;
}
</style>
