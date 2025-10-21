<template>
  <main aria-labelledby="admin-title">
    <v-container>
      <header class="mb-5">
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4">
          <div>
            <h1
              id="admin-title"
              class="text-h4 text-lg-h3 font-weight-bold mb-2"
            >
              {{ t("admin.page.title") }}
            </h1>
            <p
              id="admin-subtitle"
              class="text-body-1 text-medium-emphasis mb-0"
            >
              {{ t("admin.page.subtitle") }}
            </p>
          </div>
          <div class="d-flex flex-wrap gap-3">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi:shield-account"
              class="text-none"
            >
              {{ t("admin.actions.newAdminRole") }}
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi:file-chart"
              class="text-none"
            >
              {{ t("admin.actions.exportReport") }}
            </v-btn>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="admin-stats"
        class="mb-5"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="admin-stats"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ t("admin.sections.stats.title") }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{
            t("admin.sections.stats.subtitle")
          }}</span>
        </div>
        <v-row dense>
          <v-col
            v-for="metric in metrics"
            :key="metric.id"
            cols="12"
            sm="6"
            md="3"
          >
            <AdminMetricCard
              :label="metric.label"
              :value="metric.value"
              :trend="metric.trend"
              :trend-is-positive="metric.trendIsPositive"
              :caption="metric.caption"
              :description="metric.description"
              :icon="metric.icon"
              :avatar-color="metric.avatarColor"
            />
          </v-col>
        </v-row>
      </section>

      <section
        aria-labelledby="admin-controls"
        class="mb-5"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="admin-controls"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ t("admin.sections.controls.title") }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{
            t("admin.sections.controls.subtitle")
          }}</span>
        </div>
        <v-row dense>
          <v-col
            v-for="control in controlToggles"
            :key="control.id"
            cols="12"
            md="6"
          >
            <SidebarCard
              class="text-card-foreground pa-6 h-100 bg-primary/10"
              glow
            >
              <div class="d-flex justify-space-between align-start">
                <div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">{{ control.label }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">{{ control.description }}</p>
                </div>
                <v-avatar
                  color="primary"
                  variant="tonal"
                >
                  <Icon :name="control.icon" />
                </v-avatar>
              </div>
              <v-switch
                v-model="control.model.value"
                inset
                :color="control.model.value ? control.activeColor : 'primary'"
                :class="['mt-2', 'text-body-2']"
                :label="control.model.value ? control.enabledLabel : control.disabledLabel"
                hide-details
              />
              <p class="text-caption text-medium-emphasis mt-3 mb-0">{{ control.helper }}</p>
            </SidebarCard>
          </v-col>
        </v-row>
      </section>

      <section
        aria-labelledby="admin-actions"
        class="mb-5"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="admin-actions"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ t("admin.sections.quickActions.title") }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{
            t("admin.sections.quickActions.subtitle")
          }}</span>
        </div>
        <v-row dense>
          <v-col
            v-for="action in quickActions"
            :key="action.id"
            cols="12"
            md="4"
          >
            <AdminQuickActionCard
              :title="action.title"
              :description="action.description"
              :icon="action.icon"
              :color="action.color"
              :cta-label="action.ctaLabel"
            />
          </v-col>
        </v-row>
      </section>

      <section
        aria-labelledby="admin-modules"
        class="mb-5"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="admin-modules"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ t("admin.sections.modules.title") }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{
            t("admin.sections.modules.subtitle")
          }}</span>
        </div>
        <v-row dense>
          <v-col
            v-for="module in adminModules"
            :key="module.id"
            cols="12"
            md="6"
          >
            <SidebarCard
              class="text-card-foreground pa-4 h-100"
              glow
            >
              <div class="d-flex flex-column gap-4">
                <div class="d-flex align-start gap-3">
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="44"
                  >
                    <Icon
                      :name="module.icon"
                      size="24"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ module.title }}</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ module.description }}</p>
                  </div>
                </div>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="text-none"
                    prepend-icon="mdi:open-in-new"
                  >
                    {{ t("admin.sections.modules.openButton") }}
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    class="text-none"
                    prepend-icon="mdi:clipboard-text"
                  >
                    {{ t("admin.sections.modules.policiesButton") }}
                  </v-btn>
                </div>
                <p class="text-caption text-medium-emphasis mb-0">{{ module.status }}</p>
              </div>
            </SidebarCard>
          </v-col>
        </v-row>
      </section>

      <v-row
        dense
        align="stretch"
        class="mb-5"
      >
        <v-col
          cols="12"
          md="6"
        >
          <section
            aria-labelledby="admin-activity"
            class="h-100"
          >
            <SidebarCard
              class="text-card-foreground pa-6 h-100 bg-primary/10"
              glow
            >
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <h2
                    id="admin-activity"
                    class="text-h5 font-weight-semibold mb-1"
                  >
                    {{ t("admin.sections.activity.title") }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t("admin.sections.activity.subtitle") }}
                  </p>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  class="text-none"
                  prepend-icon="mdi:history"
                >
                  {{ t("admin.sections.activity.cta") }}
                </v-btn>
              </div>
              <v-divider class="mb-4" />
              <div
                class="d-flex flex-column gap-4"
                role="list"
              >
                <div
                  v-for="item in activityFeed"
                  :key="item.id"
                  role="listitem"
                  class="d-flex gap-3"
                >
                  <v-avatar
                    :color="item.color"
                    variant="tonal"
                    size="40"
                  >
                    <Icon
                      :name="item.icon"
                      size="22"
                    />
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between gap-2">
                      <h3 class="text-subtitle-2 font-weight-semibold mb-0">{{ item.title }}</h3>
                      <span class="text-caption text-medium-emphasis">{{ item.time }}</span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0 mt-1">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </SidebarCard>
          </section>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <section
            aria-labelledby="admin-health"
            class="h-100"
          >
            <SidebarCard
              class="text-card-foreground pa-6 h-100 bg-primary/10"
              glow
            >
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <h2
                    id="admin-health"
                    class="text-h5 font-weight-semibold mb-1"
                  >
                    {{ t("admin.sections.health.title") }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t("admin.sections.health.subtitle") }}
                  </p>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  class="text-none"
                  prepend-icon="mdi:connection"
                >
                  {{ t("admin.sections.health.cta") }}
                </v-btn>
              </div>
              <v-divider class="mb-4" />
              <div
                class="d-flex flex-column gap-4"
                role="list"
              >
                <div
                  v-for="service in systemStatus"
                  :key="service.id"
                  role="listitem"
                  class="d-flex flex-column gap-2"
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center gap-3">
                      <v-avatar
                        :color="service.color"
                        variant="tonal"
                        size="36"
                      >
                        <Icon
                          :name="service.icon"
                          size="20"
                        />
                      </v-avatar>
                      <div>
                        <p class="text-subtitle-2 font-weight-semibold mb-0">{{ service.name }}</p>
                        <span class="text-caption text-medium-emphasis">{{
                          service.description
                        }}</span>
                      </div>
                    </div>
                    <v-chip
                      :color="service.color"
                      variant="flat"
                      size="small"
                      class="font-weight-medium text-none"
                    >
                      {{ service.status }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="service.uptime"
                    :color="service.color"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                    <span>{{ t("admin.sections.health.uptimeLabel") }}</span>
                    <span>{{ formatNumber(service.uptime) }}%</span>
                  </div>
                </div>
              </div>
            </SidebarCard>
          </section>
        </v-col>
      </v-row>

      <section
        aria-labelledby="admin-resources"
        class="mb-6"
      >
        <SidebarCard
          class="text-card-foreground pa-6"
          glow
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">
            <div>
              <h2
                id="admin-resources"
                class="text-h5 font-weight-semibold mb-1"
              >
                {{ t("admin.sections.resources.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("admin.sections.resources.subtitle") }}
              </p>
            </div>
            <div class="d-flex flex-wrap gap-3">
              <v-btn
                color="primary"
                variant="flat"
                class="text-none"
                prepend-icon="mdi:book-open-page-variant"
              >
                {{ t("admin.sections.resources.knowledgeBase") }}
              </v-btn>
              <v-btn
                color="primary"
                variant="tonal"
                class="text-none"
                prepend-icon="mdi:shield-check"
              >
                {{ t("admin.sections.resources.complianceAudit") }}
              </v-btn>
            </div>
          </div>
          <v-divider class="my-6" />
          <div
            class="d-flex flex-column flex-md-row gap-6"
            role="list"
          >
            <div
              v-for="resource in resourceItems"
              :key="resource.id"
              role="listitem"
              class="flex-grow-1"
            >
              <p class="text-subtitle-2 font-weight-semibold mb-2">{{ resource.title }}</p>
              <p class="text-body-2 text-medium-emphasis mb-3">{{ resource.description }}</p>
              <v-btn
                color="primary"
                variant="text"
                class="text-none"
                prepend-icon="mdi:download"
              >
                {{ t("admin.sections.resources.download") }}
              </v-btn>
            </div>
          </div>
        </SidebarCard>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  documentDriven: false,
});

const { t, tm, locale } = useI18n();
await useLocaleNamespaces(["admin"]);

useHead({
  title: computed(() => t("admin.metaTitle")),
});

const localeMap: Record<string, string> = {};

const resolvedLocale = computed(() => {
  const current = locale.value;
  const normalized = current.toLowerCase();
  return localeMap[normalized] ?? current;
});

const numberFormatter = computed(() => new Intl.NumberFormat(resolvedLocale.value));
const decimalFormatter = computed(
  () =>
    new Intl.NumberFormat(resolvedLocale.value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
);

function formatNumber(value: number) {
  return numberFormatter.value.format(value);
}

function formatDecimal(value: number) {
  return decimalFormatter.value.format(value);
}

const metrics = computed(() => [
  {
    id: "users",
    label: t("admin.sections.stats.metrics.users.label"),
    value: formatNumber(12486),
    trend: t("admin.sections.stats.metrics.users.trend"),
    trendIsPositive: true,
    caption: t("admin.sections.stats.metrics.users.caption"),
    icon: "mdi:account-group",
    description: t("admin.sections.stats.metrics.users.description"),
    avatarColor: "primary",
  },
  {
    id: "content",
    label: t("admin.sections.stats.metrics.content.label"),
    value: formatNumber(872),
    trend: t("admin.sections.stats.metrics.content.trend"),
    trendIsPositive: true,
    caption: t("admin.sections.stats.metrics.content.caption"),
    icon: "mdi:text-box-multiple",
    description: t("admin.sections.stats.metrics.content.description"),
    avatarColor: "secondary",
  },
  {
    id: "reports",
    label: t("admin.sections.stats.metrics.reports.label"),
    value: formatNumber(94),
    trend: t("admin.sections.stats.metrics.reports.trend"),
    trendIsPositive: true,
    caption: t("admin.sections.stats.metrics.reports.caption"),
    icon: "mdi:shield-check",
    description: t("admin.sections.stats.metrics.reports.description"),
    avatarColor: "success",
  },
  {
    id: "availability",
    label: t("admin.sections.stats.metrics.availability.label"),
    value: t("admin.sections.stats.metrics.availability.value", { value: formatDecimal(99.98) }),
    trend: t("admin.sections.stats.metrics.availability.trend"),
    trendIsPositive: true,
    caption: t("admin.sections.stats.metrics.availability.caption"),
    icon: "mdi:chart-areaspline",
    description: t("admin.sections.stats.metrics.availability.description"),
    avatarColor: "info",
  },
]);

const maintenanceMode = ref(false);
const openRegistrations = ref(true);
const autoModeration = ref(true);
const globalAnnouncements = ref(false);

const controlToggles = computed(() => [
  {
    id: "maintenance",
    label: t("admin.sections.controls.toggles.maintenance.label"),
    description: t("admin.sections.controls.toggles.maintenance.description"),
    helper: t("admin.sections.controls.toggles.maintenance.helper"),
    icon: "mdi:tools",
    enabledLabel: t("admin.sections.controls.toggles.maintenance.enabled"),
    disabledLabel: t("admin.sections.controls.toggles.maintenance.disabled"),
    activeColor: "warning",
    model: maintenanceMode,
  },
  {
    id: "registrations",
    label: t("admin.sections.controls.toggles.registrations.label"),
    description: t("admin.sections.controls.toggles.registrations.description"),
    helper: t("admin.sections.controls.toggles.registrations.helper"),
    icon: "mdi:account-plus",
    enabledLabel: t("admin.sections.controls.toggles.registrations.enabled"),
    disabledLabel: t("admin.sections.controls.toggles.registrations.disabled"),
    activeColor: "success",
    model: openRegistrations,
  },
  {
    id: "moderation",
    label: t("admin.sections.controls.toggles.moderation.label"),
    description: t("admin.sections.controls.toggles.moderation.description"),
    helper: t("admin.sections.controls.toggles.moderation.helper"),
    icon: "mdi:robot-outline",
    enabledLabel: t("admin.sections.controls.toggles.moderation.enabled"),
    disabledLabel: t("admin.sections.controls.toggles.moderation.disabled"),
    activeColor: "info",
    model: autoModeration,
  },
  {
    id: "broadcast",
    label: t("admin.sections.controls.toggles.broadcast.label"),
    description: t("admin.sections.controls.toggles.broadcast.description"),
    helper: t("admin.sections.controls.toggles.broadcast.helper"),
    icon: "mdi:bullhorn",
    enabledLabel: t("admin.sections.controls.toggles.broadcast.enabled"),
    disabledLabel: t("admin.sections.controls.toggles.broadcast.disabled"),
    activeColor: "primary",
    model: globalAnnouncements,
  },
]);

const quickActions = computed(() => [
  {
    id: "content-review",
    title: t("admin.sections.quickActions.items.contentReview.title"),
    description: t("admin.sections.quickActions.items.contentReview.description"),
    icon: "mdi:check-decagram",
    color: "primary",
    ctaLabel: t("admin.sections.quickActions.button"),
  },
  {
    id: "security-scan",
    title: t("admin.sections.quickActions.items.securityScan.title"),
    description: t("admin.sections.quickActions.items.securityScan.description"),
    icon: "mdi:shield-lock",
    color: "secondary",
    ctaLabel: t("admin.sections.quickActions.button"),
  },
  {
    id: "community-update",
    title: t("admin.sections.quickActions.items.communityUpdate.title"),
    description: t("admin.sections.quickActions.items.communityUpdate.description"),
    icon: "mdi:email-outline",
    color: "purple",
    ctaLabel: t("admin.sections.quickActions.button"),
  },
]);

function getModuleTags(module: string) {
  return tm(`admin.sections.modules.items.${module}.tags`) as string[] | undefined;
}

const adminModules = computed(() => [
  {
    id: "content",
    title: t("admin.sections.modules.items.content.title"),
    description: t("admin.sections.modules.items.content.description"),
    icon: "mdi:file-document-edit",
    tags: getModuleTags("content") ?? [],
    status: t("admin.sections.modules.items.content.status"),
  },
  {
    id: "community",
    title: t("admin.sections.modules.items.community.title"),
    description: t("admin.sections.modules.items.community.description"),
    icon: "mdi:account-group-outline",
    tags: getModuleTags("community") ?? [],
    status: t("admin.sections.modules.items.community.status"),
  },
  {
    id: "commerce",
    title: t("admin.sections.modules.items.commerce.title"),
    description: t("admin.sections.modules.items.commerce.description"),
    icon: "mdi:cash-sync",
    tags: getModuleTags("commerce") ?? [],
    status: t("admin.sections.modules.items.commerce.status"),
  },
  {
    id: "governance",
    title: t("admin.sections.modules.items.governance.title"),
    description: t("admin.sections.modules.items.governance.description"),
    icon: "mdi:gavel",
    tags: getModuleTags("governance") ?? [],
    status: t("admin.sections.modules.items.governance.status"),
  },
]);

const activityFeed = computed(() => [
  {
    id: "1",
    title: t("admin.sections.activity.items.1.title"),
    description: t("admin.sections.activity.items.1.description"),
    time: t("admin.sections.activity.items.1.time"),
    icon: "mdi:clipboard-check",
    color: "success",
  },
  {
    id: "2",
    title: t("admin.sections.activity.items.2.title"),
    description: t("admin.sections.activity.items.2.description"),
    time: t("admin.sections.activity.items.2.time"),
    icon: "mdi:account-key",
    color: "primary",
  },
  {
    id: "3",
    title: t("admin.sections.activity.items.3.title"),
    description: t("admin.sections.activity.items.3.description"),
    time: t("admin.sections.activity.items.3.time"),
    icon: "mdi:alert-decagram",
    color: "error",
  },
]);

const systemStatus = computed(() => [
  {
    id: "api",
    name: t("admin.sections.health.items.api.name"),
    description: t("admin.sections.health.items.api.description"),
    status: t("admin.sections.health.items.api.status"),
    uptime: 99,
    icon: "mdi:api",
    color: "success",
  },
  {
    id: "payments",
    name: t("admin.sections.health.items.payments.name"),
    description: t("admin.sections.health.items.payments.description"),
    status: t("admin.sections.health.items.payments.status"),
    uptime: 96,
    icon: "mdi:credit-card-sync",
    color: "warning",
  },
  {
    id: "notifications",
    name: t("admin.sections.health.items.notifications.name"),
    description: t("admin.sections.health.items.notifications.description"),
    status: t("admin.sections.health.items.notifications.status"),
    uptime: 98,
    icon: "mdi:bell-ring",
    color: "info",
  },
]);

const resourceItems = computed(() => [
  {
    id: "charter",
    title: t("admin.sections.resources.items.charter.title"),
    description: t("admin.sections.resources.items.charter.description"),
  },
  {
    id: "security",
    title: t("admin.sections.resources.items.security.title"),
    description: t("admin.sections.resources.items.security.description"),
  },
  {
    id: "compliance",
    title: t("admin.sections.resources.items.compliance.title"),
    description: t("admin.sections.resources.items.compliance.description"),
  },
]);
</script>

<style scoped src="~/assets/styles/pages/admin/index.scss" lang="scss"></style>
