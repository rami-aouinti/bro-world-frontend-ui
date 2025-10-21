<template>
  <header class="mb-6">
    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
      <div>
        <h1
          id="security-title"
          class="text-h4 font-weight-bold mb-2"
        >
          {{ t("pages.profileSecurity.title") }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ t("pages.profileSecurity.subtitle") }}
        </p>
      </div>
      <v-btn
        color="primary"
        size="large"
        class="flex-shrink-0"
        @click="handleSubmit"
      >
        {{ t("pages.profileSecurity.actions.save") }}
      </v-btn>
    </div>
  </header>

  <v-row
    align="stretch"
    dense
  >
    <v-col cols="12">
      <SidebarCard
        class="text-card-foreground px-3 py-2 mb-4"
        padding="none"
        glow
      >
        <div class="d-flex flex-column gap-6">
          <section aria-labelledby="password-section-title">
            <div class="mb-4">
              <h2
                id="password-section-title"
                class="text-h5 font-weight-semibold mb-1"
              >
                {{ t("pages.profileSecurity.sections.password.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileSecurity.sections.password.description") }}
              </p>
            </div>

            <v-form @submit.prevent="handleSubmit">
              <label
                :for="usernameFieldId"
                class="sr-only"
              >
                {{ t("auth.usernameOrEmail") }}
              </label>
              <input
                :id="usernameFieldId"
                type="text"
                name="username"
                class="sr-only"
                autocomplete="username"
                :value="usernameFieldValue"
                readonly
              />
              <v-row dense>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field
                    v-model="form.currentPassword"
                    :label="t('pages.profileSecurity.labels.currentPassword')"
                    type="password"
                    prepend-inner-icon="mdi:lock"
                    autocomplete="current-password"
                    variant="solo"
                    density="comfortable"
                    required
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field
                    v-model="form.newPassword"
                    :label="t('pages.profileSecurity.labels.newPassword')"
                    type="password"
                    prepend-inner-icon="mdi:shield-key"
                    autocomplete="new-password"
                    variant="solo"
                    density="comfortable"
                    required
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field
                    v-model="form.confirmPassword"
                    :label="t('pages.profileSecurity.labels.confirmPassword')"
                    type="password"
                    prepend-inner-icon="mdi:shield-check"
                    autocomplete="new-password"
                    variant="solo"
                    density="comfortable"
                    required
                  />
                </v-col>
              </v-row>
            </v-form>
          </section>

          <v-divider />

          <section aria-labelledby="sessions-section-title">
            <div class="mb-4">
              <h2
                id="sessions-section-title"
                class="text-h5 font-weight-semibold mb-1"
              >
                {{ t("pages.profileSecurity.sections.sessions.title") }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t("pages.profileSecurity.sections.sessions.description") }}
              </p>
            </div>

            <v-table
              class="rounded-lg"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th class="text-left">
                    {{ t("pages.profileSecurity.sessions.device") }}
                  </th>
                  <th class="text-left">
                    {{ t("pages.profileSecurity.sessions.location") }}
                  </th>
                  <th class="text-left">
                    {{ t("pages.profileSecurity.sessions.activity") }}
                  </th>
                  <th class="text-left">
                    {{ t("pages.profileSecurity.sessions.actions") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="session in activeSessions"
                  :key="session.id"
                >
                  <td>
                    <div class="d-flex flex-column">
                      <span class="text-body-2 font-weight-medium">{{ session.device }}</span>
                      <span class="text-caption text-medium-emphasis">{{ session.status }}</span>
                    </div>
                  </td>
                  <td class="text-body-2">
                    {{ session.location }}
                  </td>
                  <td class="text-body-2">
                    {{ session.activity }}
                  </td>
                  <td>
                    <v-btn
                      variant="text"
                      density="comfortable"
                      @click="revokeSession(session)"
                    >
                      {{ t("pages.profileSecurity.sessions.revoke") }}
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </section>
        </div>
      </SidebarCard>
    </v-col>
  </v-row>

  <v-snackbar
    v-model="snackbar.visible"
    color="primary"
    timeout="2500"
    variant="flat"
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, useId, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import type { SessionEntry } from "~/types/pages/profile";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const ProfileSecurityTwoFactorSection = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileSecurityTwoFactorSection.vue"),
  suspensible: false,
});

const vuetifyComponentsPromise = import("vuetify/components");

const VTable = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VTable));

const { t, locale } = useI18n();
const auth = useAuthSession();
const usernameFieldId = `profile-security-username-${useId()}`;
const usernameFieldValue = computed(
  () => auth.currentUser.value?.username ?? auth.currentUser.value?.email ?? "",
);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  mfaEnabled: true,
});

const snackbar = reactive({
  visible: false,
  message: "",
});

const initialNow = useState<number>("profile-security-initial-now", () => Date.now());
const timezone = useState<string>("profile-security-timezone", () => "UTC");

if (import.meta.client) {
  onMounted(() => {
    const resolvedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolvedTimeZone) {
      timezone.value = resolvedTimeZone;
    }
  });
}

const activeSessions = computed<SessionEntry[]>(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone.value,
  });
  const now = new Date(initialNow.value);

  return [
    {
      id: "macbook-pro",
      device: "MacBook Pro · Safari 17",
      location: "Paris, FR",
      activity: formatter.format(now),
      status: t("pages.profileSecurity.sessions.trusted"),
    },
    {
      id: "iphone",
      device: "iPhone 15 · BroWorld App",
      location: "Lyon, FR",
      activity: formatter.format(subtractHours(now, 2)),
      status: t("pages.profileSecurity.sessions.remembered"),
    },
    {
      id: "tablet",
      device: "iPad · Edge",
      location: "Remote",
      activity: formatter.format(subtractDays(now, 3)),
      status: t("pages.profileSecurity.sessions.untrusted"),
    },
  ];
});

function handleSubmit() {
  snackbar.message = t("pages.profileSecurity.actions.save");
  snackbar.visible = true;
}

function revokeSession(session: SessionEntry) {
  snackbar.message = `${t("pages.profileSecurity.sessions.revoke")} · ${session.device}`;
  snackbar.visible = true;
}

function generateCodes() {
  snackbar.message = t("pages.profileSecurity.recoveryCodes.title");
  snackbar.visible = true;
}

function subtractHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function subtractDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}
</script>

<style scoped>
.profile-security-form {
  --v-field-border-radius: var(--radius, var(--ui-radius));
}

.profile-security-form :deep(.v-field) {
  border-radius: var(--v-field-border-radius);
}

.profile-security-form :deep(.v-field__outline),
.profile-security-form :deep(.v-field__overlay) {
  border-radius: inherit;
}
</style>
