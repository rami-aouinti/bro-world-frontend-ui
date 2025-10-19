<template>
  <main
    class="crm-page py-12"
    aria-labelledby="crm-heading"
  >
    <v-container class="crm-page__container">
      <header
        class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-5 mb-8"
      >
        <div>
          <h1
            id="crm-heading"
            class="text-h4 text-lg-h3 font-weight-bold mb-2"
          >
            {{ pageTitle }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ pageSubtitle }}
          </p>
        </div>
        <div class="d-flex flex-wrap gap-3">
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi:plus"
            class="text-none"
          >
            {{ newProjectLabel }}
          </v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi:view-dashboard-outline"
            class="text-none"
          >
            {{ viewPipelineLabel }}
          </v-btn>
        </div>
      </header>

      <section
        aria-labelledby="crm-overview"
        class="mb-8"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="crm-overview"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ overviewTitle }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{ overviewSubtitle }}</span>
        </div>
        <v-row dense>
          <v-col
            v-for="metric in metricCards"
            :key="metric.id"
            cols="12"
            sm="6"
            lg="3"
          >
            <AdminMetricCard
              :label="metric.label"
              :value="metric.value"
              :caption="metric.caption"
              :icon="metric.icon"
              :avatar-color="metric.color"
            />
          </v-col>
        </v-row>
      </section>

      <section
        aria-labelledby="crm-pipeline"
        class="mb-8"
      >
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4"
        >
          <h2
            id="crm-pipeline"
            class="text-h5 font-weight-semibold mb-0"
          >
            {{ tableTitle }}
          </h2>
          <span class="text-body-2 text-medium-emphasis">{{ tableSubtitle }}</span>
        </div>
        <v-row dense>
          <v-col
            cols="12"
            lg="8"
          >
            <CrmProjectsTable
              :title="tableTitle"
              :subtitle="tableSubtitle"
              :projects="projects"
              :headers="tableHeaders"
              :loading="pending"
              :error="error"
              :empty-message="emptyStateMessage"
            />
          </v-col>
          <v-col
            cols="12"
            lg="4"
          >
            <SidebarCard
              class="text-card-foreground pa-6 mb-4"
              glow
            >
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ upcomingTitle }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ upcomingSubtitle }}</p>
              <ul
                v-if="upcomingDeadlines.length"
                class="list-unstyled d-flex flex-column gap-4 mb-0"
              >
                <li
                  v-for="deadline in upcomingDeadlines"
                  :key="deadline.id"
                  class="d-flex flex-column gap-1"
                >
                  <div class="d-flex justify-space-between align-center">
                    <span class="font-weight-semibold">{{ deadline.name }}</span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="font-weight-medium"
                    >
                      {{ deadline.stage }}
                    </v-chip>
                  </div>
                  <span class="text-body-2 text-medium-emphasis">{{ deadline.clientName }}</span>
                  <span class="text-caption text-medium-emphasis">
                    {{ deadline.dueDateFormatted }}
                  </span>
                </li>
              </ul>
              <p
                v-else
                class="text-body-2 text-medium-emphasis mb-0"
              >
                {{ upcomingEmpty }}
              </p>
            </SidebarCard>

            <SidebarCard
              class="text-card-foreground pa-6"
              glow
            >
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ stagesTitle }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ stagesSubtitle }}</p>
              <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
                <li
                  v-for="stage in stageSummary"
                  :key="stage.id"
                  class="d-flex justify-space-between align-center"
                >
                  <div class="d-flex flex-column">
                    <span class="font-weight-medium">{{ stage.label }}</span>
                    <span class="text-caption text-medium-emphasis">{{ stage.caption }}</span>
                  </div>
                  <v-chip
                    variant="tonal"
                    size="small"
                    :color="stage.color"
                    class="font-weight-medium"
                  >
                    {{ stage.count }}
                  </v-chip>
                </li>
              </ul>
            </SidebarCard>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { callOnce } from "#imports";
import { useI18n } from "vue-i18n";

import SidebarCard from "~/components/layout/SidebarCard.vue";
import CrmProjectsTable from "~/components/admin/crm/CrmProjectsTable.vue";
import { useCrmProjectsStore } from "~/stores/crm-projects";
import AdminMetricCard from "~/components/admin/dashboard/AdminMetricCard.vue";
import type { DataTableHeaders } from "~/plugins/vuetify";

const { t, n } = useI18n();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

definePageMeta({
  middleware: ["auth", "admin"],
  documentDriven: false,
  showRightWidgets: false,
});

const pageTitle = computed(() => t("pages.crm.title"));
const pageSubtitle = computed(() => t("pages.crm.subtitle"));
const newProjectLabel = computed(() => t("pages.crm.actions.newProject"));
const viewPipelineLabel = computed(() => t("pages.crm.actions.viewPipeline"));
const overviewTitle = computed(() => t("pages.crm.metrics.title"));
const overviewSubtitle = computed(() => t("pages.crm.metrics.subtitle"));
const tableTitle = computed(() => t("pages.crm.table.title"));
const tableSubtitle = computed(() => t("pages.crm.table.subtitle"));
const emptyStateMessage = computed(() => t("pages.crm.table.empty"));
const upcomingTitle = computed(() => t("pages.crm.upcoming.title"));
const upcomingSubtitle = computed(() => t("pages.crm.upcoming.subtitle"));
const upcomingEmpty = computed(() => t("pages.crm.upcoming.empty"));
const stagesTitle = computed(() => t("pages.crm.stages.title"));
const stagesSubtitle = computed(() => t("pages.crm.stages.subtitle"));

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = pageTitle.value;
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const crmStore = useCrmProjectsStore();
const projects = crmStore.projects;
const pending = crmStore.pending;
const error = crmStore.error;

await callOnce("admin:crm:projects:list", () => crmStore.listProjects());

const totalProjects = computed(() => projects.value.length);

const statusCounts = computed(() => {
  const counts = new Map<string, number>();

  for (const project of projects.value) {
    const key = project.status?.toLowerCase() ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
});

const totalBudget = computed(() =>
  projects.value.reduce((total, project) => total + (project.budget ?? 0), 0),
);

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const metricCards = computed(() => [
  {
    id: "total",
    label: t("pages.crm.metrics.total"),
    value: n(totalProjects.value, "decimal"),
    caption: t("pages.crm.metrics.totalCaption"),
    icon: "mdi:folder-account",
    color: "primary",
  },
  {
    id: "in-progress",
    label: t("pages.crm.metrics.inProgress"),
    value: n(statusCounts.value.get("in-progress") ?? 0, "decimal"),
    caption: t("pages.crm.metrics.inProgressCaption"),
    icon: "mdi:progress-clock",
    color: "info",
  },
  {
    id: "at-risk",
    label: t("pages.crm.metrics.atRisk"),
    value: n(statusCounts.value.get("at-risk") ?? 0, "decimal"),
    caption: t("pages.crm.metrics.atRiskCaption"),
    icon: "mdi:alert-decagram-outline",
    color: "warning",
  },
  {
    id: "budget",
    label: t("pages.crm.metrics.pipelineValue"),
    value: currencyFormatter.format(totalBudget.value),
    caption: t("pages.crm.metrics.pipelineValueCaption"),
    icon: "mdi:currency-usd",
    color: "success",
  },
]);

const tableHeaders = computed<DataTableHeaders>(() => [
  { title: t("pages.crm.table.headers.name"), key: "name", sortable: false },
  { title: t("pages.crm.table.headers.client"), key: "clientName", sortable: false },
  { title: t("pages.crm.table.headers.owner"), key: "ownerName", sortable: false },
  { title: t("pages.crm.table.headers.status"), key: "status", sortable: false },
  { title: t("pages.crm.table.headers.stage"), key: "stage", sortable: false },
  { title: t("pages.crm.table.headers.budget"), key: "budget", sortable: false },
  { title: t("pages.crm.table.headers.probability"), key: "probability", sortable: false },
  { title: t("pages.crm.table.headers.dueDate"), key: "dueDate", sortable: false },
]);

const dueDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const stageCaptionFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const upcomingDeadlines = computed(() => {
  const items = projects.value
    .map((project) => {
      if (!project.dueDate) {
        return null;
      }

      const dueDate = new Date(project.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        return null;
      }

      return {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        stage: project.stage ?? "",
        dueDate,
        dueDateFormatted: dueDateFormatter.format(dueDate),
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        name: string;
        clientName: string | null | undefined;
        stage: string;
        dueDate: Date;
        dueDateFormatted: string;
      } => Boolean(item),
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 4);

  return items;
});

const stageSummary = computed(() => {
  const map = new Map<string, { count: number; earliest?: Date }>();

  for (const project of projects.value) {
    const key = project.stage ?? "Unknown";
    const entry = map.get(key) ?? { count: 0 };
    entry.count += 1;

    if (project.dueDate) {
      const dueDate = new Date(project.dueDate);
      if (!Number.isNaN(dueDate.getTime())) {
        if (!entry.earliest || dueDate.getTime() < entry.earliest.getTime()) {
          entry.earliest = dueDate;
        }
      }
    }

    map.set(key, entry);
  }

  const colorPalette = ["primary", "info", "success", "warning", "secondary", "error"];

  return Array.from(map.entries()).map(([stage, data], index) => ({
    id: stage.toLowerCase().replace(/\s+/g, "-"),
    label: stage,
    count: data.count,
    color: colorPalette[index % colorPalette.length],
    caption: data.earliest
      ? t("pages.crm.stages.caption", { date: stageCaptionFormatter.format(data.earliest) })
      : "",
  }));
});
</script>

<style scoped>
.crm-page__container {
  max-width: 1200px;
}
</style>
