<template>
  <main
    class="py-10"
    :aria-labelledby="headingId"
  >
    <v-container>
      <header class="mb-8">
        <h1
          :id="headingId"
          class="text-h4 text-lg-h3 font-weight-bold mb-2"
        >
          {{ title }}
        </h1>
        <p
          :id="`${headingId}-subtitle`"
          class="text-body-1 text-medium-emphasis mb-0"
        >
          {{ subtitle }}
        </p>
      </header>

      <template v-if="isDataSection">
        <SidebarCard
          class="text-card-foreground"
          padding="none"
          glow
        >
          <v-toolbar
            color="transparent"
            class="px-6 pt-4"
            density="comfortable"
            flat
          >
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-3 w-100">
              <v-text-field
                v-model="tableSearch"
                :label="t('admin.userManagement.sections.data.table.search')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                class="flex-grow-1"
              />
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-refresh"
                class="text-none"
                :loading="refreshing"
                @click="refreshUsers"
              >
                {{ t("admin.userManagement.sections.data.actions.refresh") }}
              </v-btn>
            </div>
          </v-toolbar>

          <v-divider />

          <v-alert
            v-if="tableError"
            type="error"
            variant="tonal"
            border="start"
            border-color="error"
            class="mx-6 mt-6"
          >
            {{ tableError }}
          </v-alert>

          <v-data-table
            :headers="tableHeaders"
            :items="tableItems"
            :items-per-page="10"
            :loading="tableLoading"
            :search="tableSearch"
            class="user-data-table"
          >
            <template #[`item.username`]="{ item }">
              <span class="text-body-2 font-weight-medium">@{{ item.username }}</span>
            </template>

            <template #[`item.firstName`]="{ item }">
              <span class="text-body-2">{{ formatText(item.firstName) }}</span>
            </template>

            <template #[`item.lastName`]="{ item }">
              <span class="text-body-2">{{ formatText(item.lastName) }}</span>
            </template>

            <template #[`item.email`]="{ item }">
              <span class="text-body-2">{{ formatText(item.email) }}</span>
            </template>

            <template #[`item.language`]="{ item }">
              <span class="text-body-2">{{ formatText(item.language) }}</span>
            </template>

            <template #[`item.locale`]="{ item }">
              <span class="text-body-2">{{ formatText(item.locale) }}</span>
            </template>

            <template #[`item.timezone`]="{ item }">
              <span class="text-body-2">{{ formatText(item.timezone) }}</span>
            </template>

            <template #[`item.enabled`]="{ item }">
              <v-chip
                :color="item.enabled ? 'success' : 'warning'"
                size="small"
                variant="tonal"
                class="text-capitalize font-weight-medium"
              >
                {{
                  item.enabled
                    ? t("admin.userManagement.status.active")
                    : t("admin.userManagement.status.disabled")
                }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="openDetails(item.id)"
              >
                <Icon name="mdi-eye" />
              </v-btn>
            </template>

            <template #bottom>
              <div class="px-6 pb-4 text-body-2 text-medium-emphasis">
                <span v-if="!tableItems.length && !tableLoading">
                  {{ t("admin.userManagement.sections.data.table.empty") }}
                </span>
              </div>
            </template>
          </v-data-table>
        </SidebarCard>

        <v-dialog
          v-model="detailsDialog"
          max-width="520"
        >
          <SidebarCard
            class="text-card-foreground"
            glow
          >
            <v-card-title class="text-h6 font-weight-semibold">
              {{ t("admin.userManagement.sections.data.details.title") }}
            </v-card-title>
            <v-card-text>
              <div
                v-if="detailsLoading"
                class="py-6 text-center"
              >
                <v-progress-circular
                  color="primary"
                  indeterminate
                />
              </div>
              <v-alert
                v-else-if="detailsError"
                type="error"
                variant="tonal"
                border="start"
                border-color="error"
              >
                {{ detailsError }}
              </v-alert>
              <div
                v-else-if="detailFields.length"
                class="d-flex flex-column gap-4"
              >
                <div
                  v-for="field in detailFields"
                  :key="field.key"
                  class="d-flex flex-column"
                >
                  <span class="text-caption text-medium-emphasis">{{ field.label }}</span>
                  <span class="text-body-2">{{ field.value }}</span>
                </div>
              </div>
              <div
                v-else
                class="py-6 text-center text-body-2 text-medium-emphasis"
              >
                {{ t("admin.userManagement.sections.data.details.empty") }}
              </div>
            </v-card-text>
            <v-card-actions class="px-6 pb-6">
              <v-spacer />
              <v-btn
                variant="text"
                class="text-none"
                @click="closeDetails"
              >
                {{ t("admin.userManagement.sections.data.details.close") }}
              </v-btn>
            </v-card-actions>
          </SidebarCard>
        </v-dialog>
      </template>

      <template v-else>
        <v-alert
          type="info"
          variant="tonal"
          border="start"
          class="mb-6"
        >
          {{ t("admin.common.comingSoon") }}
        </v-alert>
      </template>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { callOnce } from "#imports";
import { useAdminModulePage } from "~/composables/useAdminModulePage";
import { useUsersStore } from "~/stores/users";
import type { UsersStoreUser } from "~/stores/users";

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
});

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);

const allowedSections = ["data", "crons"] as const;

type UserManagementSection = (typeof allowedSections)[number];

const section = computed<UserManagementSection>(() => {
  const params = currentRoute.value?.params ?? {};
  const value = (params as Record<string, unknown>).section;
  if (typeof value === "string" && allowedSections.includes(value as UserManagementSection)) {
    return value as UserManagementSection;
  }

  return "data";
});

const pageKey = computed(() => `admin.userManagement.sections.${section.value}`);

const { t, title, subtitle } = useAdminModulePage(pageKey);

const headingId = computed(() => `admin-user-management-${section.value}-title`);
const isDataSection = computed(() => section.value === "data");

const store = useUsersStore();
const localTableError = ref<string | null>(null);
const tableSearch = ref("");
const refreshing = ref(false);
const detailsDialog = ref(false);
const detailsLoading = ref(false);
const detailsError = ref<string | null>(null);
const selectedUser = ref<UsersStoreUser | null>(null);

await callOnce(async () => {
  try {
    await store.fetchUsers();
  } catch (error) {
    localTableError.value = error instanceof Error ? error.message : String(error ?? "");
  }
});

const users = computed(() => store.users.value);
const isLoading = computed(() => store.pending.value);
const tableLoading = computed(() => isLoading.value || refreshing.value);
const tableError = computed(() => localTableError.value || store.error.value || null);

const tableHeaders = computed(() => [
  { title: t("admin.userManagement.sections.data.table.columns.username"), key: "username" },
  { title: t("admin.userManagement.sections.data.table.columns.firstName"), key: "firstName" },
  { title: t("admin.userManagement.sections.data.table.columns.lastName"), key: "lastName" },
  { title: t("admin.userManagement.sections.data.table.columns.email"), key: "email" },
  { title: t("admin.userManagement.sections.data.table.columns.language"), key: "language" },
  { title: t("admin.userManagement.sections.data.table.columns.locale"), key: "locale" },
  { title: t("admin.userManagement.sections.data.table.columns.timezone"), key: "timezone" },
  {
    title: t("admin.userManagement.sections.data.table.columns.enabled"),
    key: "enabled",
    sortable: false,
  },
  {
    title: t("admin.userManagement.sections.data.table.columns.actions"),
    key: "actions",
    sortable: false,
  },
]);

const tableItems = computed(() =>
  users.value.map((user) => {
    const raw = user as Record<string, unknown>;

    return {
      id: user.id,
      username: user.username ?? "",
      firstName: typeof user.firstName === "string" ? user.firstName : null,
      lastName: typeof user.lastName === "string" ? user.lastName : null,
      email: user.email ?? "",
      language: typeof raw.language === "string" ? (raw.language as string) : null,
      locale: typeof raw.locale === "string" ? (raw.locale as string) : null,
      timezone: typeof raw.timezone === "string" ? (raw.timezone as string) : null,
      enabled: user.enabled !== false,
    };
  }),
);

const detailFields = computed(() => {
  if (!selectedUser.value) {
    return [] as { key: string; label: string; value: string }[];
  }

  const raw = selectedUser.value as Record<string, unknown>;

  return [
    {
      key: "username",
      label: t("admin.userManagement.sections.data.details.fields.username"),
      value: formatText(selectedUser.value.username),
    },
    {
      key: "email",
      label: t("admin.userManagement.sections.data.details.fields.email"),
      value: formatText(selectedUser.value.email),
    },
    {
      key: "firstName",
      label: t("admin.userManagement.sections.data.details.fields.firstName"),
      value: formatText(selectedUser.value.firstName as string | null),
    },
    {
      key: "lastName",
      label: t("admin.userManagement.sections.data.details.fields.lastName"),
      value: formatText(selectedUser.value.lastName as string | null),
    },
    {
      key: "language",
      label: t("admin.userManagement.sections.data.details.fields.language"),
      value: formatText(typeof raw.language === "string" ? (raw.language as string) : null),
    },
    {
      key: "locale",
      label: t("admin.userManagement.sections.data.details.fields.locale"),
      value: formatText(typeof raw.locale === "string" ? (raw.locale as string) : null),
    },
    {
      key: "timezone",
      label: t("admin.userManagement.sections.data.details.fields.timezone"),
      value: formatText(typeof raw.timezone === "string" ? (raw.timezone as string) : null),
    },
    {
      key: "enabled",
      label: t("admin.userManagement.sections.data.details.fields.enabled"),
      value:
        selectedUser.value.enabled !== false
          ? t("admin.userManagement.status.active")
          : t("admin.userManagement.status.disabled"),
    },
  ];
});

async function refreshUsers() {
  refreshing.value = true;
  localTableError.value = null;

  try {
    await store.fetchUsers({ force: true });
  } catch (error) {
    localTableError.value = error instanceof Error ? error.message : String(error ?? "");
  } finally {
    refreshing.value = false;
  }
}

function formatText(value?: string | null) {
  if (typeof value !== "string") {
    return "—";
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : "—";
}

async function openDetails(userId: string) {
  selectedUser.value = users.value.find((user) => user.id === userId) ?? null;
  detailsDialog.value = true;
  detailsLoading.value = true;
  detailsError.value = null;

  try {
    const user = await store.fetchUser(userId, { force: true });
    selectedUser.value = user;
  } catch (error) {
    detailsError.value = error instanceof Error ? error.message : String(error ?? "");
  } finally {
    detailsLoading.value = false;
  }
}

function closeDetails() {
  detailsDialog.value = false;
  detailsLoading.value = false;
  detailsError.value = null;
  selectedUser.value = null;
}
</script>
