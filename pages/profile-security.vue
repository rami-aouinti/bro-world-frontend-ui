<template>
  <NuxtLayout name="default">
    <main
      class="py-4"
      aria-labelledby="security-title"
    >
      <v-container>
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
          <v-col
            cols="12"
            md="8"
          >
            <v-card
              class="pa-6 mb-4"
              rounded="xl"
              elevation="8"
              variant="tonal"
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
                    <v-row dense>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="form.currentPassword"
                          :label="t('pages.profileSecurity.labels.currentPassword')"
                          type="password"
                          prepend-inner-icon="mdi-lock"
                          autocomplete="current-password"
                          variant="solo"
                          density="comfortable"
                          required
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="form.newPassword"
                          :label="t('pages.profileSecurity.labels.newPassword')"
                          type="password"
                          prepend-inner-icon="mdi-shield-key"
                          autocomplete="new-password"
                          variant="solo"
                          density="comfortable"
                          required
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="form.confirmPassword"
                          :label="t('pages.profileSecurity.labels.confirmPassword')"
                          type="password"
                          prepend-inner-icon="mdi-shield-check"
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
                            <span class="text-caption text-medium-emphasis">{{
                              session.status
                            }}</span>
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
            </v-card>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-card
              class="pa-5 mb-4"
              rounded="xl"
              elevation="6"
              variant="tonal"
            >
              <div class="d-flex flex-column gap-4">
                <section aria-labelledby="mfa-section-title">
                  <div class="mb-3">
                    <h2
                      id="mfa-section-title"
                      class="text-h6 font-weight-semibold mb-1"
                    >
                      {{ t("pages.profileSecurity.sections.mfa.title") }}
                    </h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.profileSecurity.sections.mfa.description") }}
                    </p>
                  </div>
                  <v-switch
                    v-model="form.mfaEnabled"
                    :label="t('pages.profileSecurity.labels.mfaToggle')"
                    color="primary"
                    inset
                  />
                  <v-btn
                    variant="text"
                    class="mt-2"
                    @click="generateCodes"
                  >
                    {{ t("pages.profileSecurity.actions.generateCodes") }}
                  </v-btn>
                </section>

                <v-divider />

                <section aria-labelledby="password-hints-title">
                  <div class="d-flex flex-column gap-3">
                    <h2
                      id="password-hints-title"
                      class="text-h6 font-weight-semibold"
                    >
                      {{ t("pages.profileSecurity.passwordHint.title") }}
                    </h2>
                    <v-alert
                      type="info"
                      color="primary"
                      variant="tonal"
                      density="comfortable"
                    >
                      {{ t("pages.profileSecurity.passwordHint.description") }}
                    </v-alert>
                  </div>
                </section>
              </div>
            </v-card>
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
      </v-container>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";

definePageMeta({
  middleware: "auth",
  title: "profile-security",
  layout: false,
  showRightWidgets: false,
  sidebarVariant: "profile",
});

const { t, locale } = useI18n();

interface SessionEntry {
  id: string;
  device: string;
  location: string;
  activity: string;
  status: string;
}

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

const activeSessions = computed<SessionEntry[]>(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const now = new Date();

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
