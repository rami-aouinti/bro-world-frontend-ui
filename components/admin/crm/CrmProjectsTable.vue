<template>
  <SidebarCard
    class="text-card-foreground pa-6 h-100"
    glow
  >
    <header
      class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center gap-4 mb-6"
    >
      <div>
        <h2 class="text-h6 text-lg-h5 font-weight-semibold mb-1">{{ title }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ subtitle }}</p>
      </div>
      <div class="d-flex flex-wrap gap-3">
        <slot name="actions" />
      </div>
    </header>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      density="comfortable"
    >
      {{ error }}
    </v-alert>

    <v-skeleton-loader
      v-if="loading"
      type="table"
      class="border rounded-lg"
    />

    <template v-else>
      <ClientOnly>
        <VDataTable
          v-if="items.length"
          :items="items"
          :headers="headers"
          :items-per-page="5"
          class="elevation-0"
          density="comfortable"
          hover
        >
          <template #[`item.name`]="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-semibold">{{ item.name }}</span>
              <span
                v-if="item.description"
                class="text-caption text-medium-emphasis"
              >
                {{ item.description }}
              </span>
            </div>
          </template>

          <template #[`item.clientName`]="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.clientName }}</span>
              <span
                v-if="item.pipeline"
                class="text-caption text-medium-emphasis"
              >
                {{ item.pipeline }}
              </span>
            </div>
          </template>

          <template #[`item.ownerName`]="{ item }">
            <div class="d-flex align-center gap-2">
              <v-avatar
                color="primary"
                variant="tonal"
                size="32"
              >
                <span class="text-subtitle-2 font-weight-medium">
                  {{ resolveInitials(item.ownerName) }}
                </span>
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium">{{ item.ownerName }}</span>
                <span
                  v-if="item.ownerId"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.ownerId }}
                </span>
              </div>
            </div>
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip
              :color="resolveStatusColor(item.status)"
              variant="tonal"
              size="small"
              class="font-weight-medium text-capitalize"
            >
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #[`item.budget`]="{ item }">
            <span class="font-weight-medium">{{ formatCurrency(item.budget) }}</span>
          </template>

          <template #[`item.probability`]="{ item }">
            <v-chip
              :color="resolveProbabilityColor(item.probability)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ formatProbability(item.probability) }}
            </v-chip>
          </template>

          <template #[`item.dueDate`]="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ formatDate(item.dueDate) }}</span>
              <span
                v-if="item.finishDate"
                class="text-caption text-medium-emphasis"
              >
                {{ formatDate(item.finishDate) }}
              </span>
            </div>
          </template>
        </VDataTable>
      </ClientOnly>

      <div
        v-else
        class="text-body-2 text-medium-emphasis text-center py-10"
      >
        {{ emptyMessage }}
      </div>
    </template>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

import SidebarCard from "~/components/layout/SidebarCard.vue";
import type { CrmProject } from "~/stores/crm-projects";
import type { DataTableHeaders } from "~/plugins/vuetify";

const VDataTable = defineAsyncComponent(() =>
  import("vuetify/labs/VDataTable").then((mod) => mod.VDataTable),
);

const props = defineProps<{
  title: string;
  subtitle: string;
  projects: CrmProject[];
  headers: DataTableHeaders;
  emptyMessage: string;
  loading?: boolean;
  error?: string | null;
}>();

const loading = computed(() => Boolean(props.loading));
const error = computed(() => props.error ?? null);

const items = computed(() => props.projects ?? []);

const numberFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function resolveInitials(name: string | null | undefined): string {
  if (!name) {
    return "?";
  }

  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 2);

  if (!parts.length) {
    return name.slice(0, 2).toUpperCase();
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function resolveStatusColor(status: string | null | undefined): string {
  const normalized = status?.toLowerCase() ?? "";

  switch (normalized) {
    case "completed":
      return "success";
    case "at-risk":
      return "error";
    case "planning":
      return "info";
    case "in-progress":
      return "primary";
    default:
      return "secondary";
  }
}

function resolveProbabilityColor(probability: number | null | undefined): string {
  if (probability == null || Number.isNaN(probability)) {
    return "secondary";
  }

  if (probability >= 0.7) {
    return "success";
  }

  if (probability >= 0.5) {
    return "primary";
  }

  if (probability >= 0.3) {
    return "warning";
  }

  return "error";
}

function formatStatus(status: string | null | undefined): string {
  if (!status) {
    return "—";
  }

  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  try {
    return numberFormatter.format(value);
  } catch {
    return String(value);
  }
}

function formatProbability(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  try {
    return percentageFormatter.format(value);
  } catch {
    return `${Math.round(value * 100)}%`;
  }
}

function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    return dateFormatter.format(date);
  } catch {
    return date.toISOString().split("T")[0] ?? "—";
  }
}
</script>
