<template>
  <main
    class="py-10"
    :aria-labelledby="titleId"
  >
    <v-container>
      <header
        class="mb-8 d-flex flex-column flex-md-row align-md-center justify-space-between gap-4"
      >
        <div>
          <h1
            :id="titleId"
            class="text-h4 text-lg-h3 font-weight-bold mb-2"
          >
            {{ t("admin.statistics.page.title") }}
          </h1>
          <p
            :id="`${titleId}-subtitle`"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            {{ t("admin.statistics.page.subtitle") }}
          </p>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          class="text-none"
          :loading="isRefreshing"
          @click="reload"
        >
          {{ t("admin.statistics.actions.refresh") }}
        </v-btn>
      </header>

      <v-alert
        v-if="loadError"
        type="error"
        variant="tonal"
        border="start"
        border-color="error"
        class="mb-6"
      >
        {{ loadError }}
      </v-alert>

      <v-row dense>
        <v-col
          cols="12"
          md="6"
          lg="4"
        >
          <SidebarCard
            class="text-card-foreground pa-6 h-100"
            glow
          >
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="text-subtitle-2 text-medium-emphasis mb-1">
                  {{ t("admin.statistics.cards.users.title") }}
                </p>
                <p class="text-h3 text-lg-h2 font-weight-bold mb-2">
                  <span v-if="!isLoading">{{ userCount }}</span>
                  <v-progress-circular
                    v-else
                    color="primary"
                    indeterminate
                    size="32"
                    width="3"
                  />
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("admin.statistics.cards.users.description") }}
                </p>
              </div>
              <v-avatar
                color="primary"
                variant="tonal"
                size="56"
              >
                <Icon
                  name="mdi-account-group"
                  size="32"
                />
              </v-avatar>
            </div>
          </SidebarCard>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const pageDescription = computed(() => t("admin.statistics.page.subtitle"));

definePageMeta(() => ({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
  description: pageDescription.value,
}));
const titleId = "admin-statistics-title";

const { data, pending, error, refresh } = await useAsyncData(
  "admin-statistics-users-count",
  async () => {
    const response = await $fetch<{ count?: number }>("/api/v1/user/count", {
      method: "GET",
    });

    return {
      count: typeof response?.count === "number" ? response.count : 0,
    };
  },
);

const refreshing = ref(false);

const userCount = computed(() => data.value?.count ?? 0);
const isLoading = computed(() => pending.value && !data.value);
const isRefreshing = computed(() => refreshing.value || (pending.value && Boolean(data.value)));

const loadError = computed(() => {
  if (!error.value) {
    return null;
  }

  if (typeof (error.value as { data?: { message?: string } })?.data?.message === "string") {
    return (error.value as { data: { message: string } }).data.message;
  }

  return error.value instanceof Error ? error.value.message : String(error.value ?? "");
});

async function reload() {
  refreshing.value = true;

  try {
    await refresh();
  } catch (caughtError) {
    console.error("Failed to refresh statistics", caughtError);
  } finally {
    refreshing.value = false;
  }
}
</script>
