<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title class="text-h6 font-weight-semibold">Access coordination</v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Approve new collaborators or track past decisions from the CRM history.
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pt-4">
      <v-alert
        v-if="loadError"
        type="error"
        variant="tonal"
        border="start"
        border-color="error"
        density="comfortable"
        class="mb-4"
        role="alert"
      >
        {{ loadError }}
      </v-alert>

      <div
        v-if="isLoading"
        class="py-6"
      >
        <v-progress-linear
          indeterminate
          color="primary"
          height="6"
          rounded="lg"
        />
      </div>

      <v-alert
        v-else-if="requests.length === 0"
        type="info"
        variant="tonal"
        border="start"
        border-color="primary"
        density="comfortable"
        role="status"
      >
        No access requests at the moment.
      </v-alert>

      <v-list
        v-else
        lines="three"
        class="crm-requests-list"
      >
        <v-list-item
          v-for="request in requests"
          :key="request.id"
          class="align-start"
        >
          <template #prepend>
            <v-avatar
              size="40"
              color="primary"
              variant="tonal"
            >
              {{ request.requesterName.slice(0, 1) }}
            </v-avatar>
          </template>

          <v-list-item-title class="text-body-1 font-weight-semibold">
            {{ request.requesterName }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ request.role || "Contributor" }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
            Submitted {{ formatSubmittedAt(request.submittedAt) }}
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column align-end gap-2">
              <v-chip
                :color="statusColor(request.status)"
                variant="tonal"
                size="small"
                class="text-capitalize font-weight-medium"
              >
                {{ request.status }}
              </v-chip>

              <div
                v-if="request.status === 'pending'"
                class="d-flex gap-2"
              >
                <LockableButton
                  color="success"
                  variant="text"
                  size="small"
                  :loading="isProcessing(request)"
                  @click="updateStatus(request, 'approved')"
                >
                  Approve
                </LockableButton>
                <LockableButton
                  color="error"
                  variant="text"
                  size="small"
                  :loading="isProcessing(request)"
                  @click="updateStatus(request, 'declined')"
                >
                  Decline
                </LockableButton>
              </div>
            </div>
          </template>

          <v-list-item-subtitle
            v-if="request.message"
            class="text-body-2 mt-2"
          >
            “{{ request.message }}”
          </v-list-item-subtitle>

          <v-alert
            v-if="requestError(request)"
            type="error"
            variant="tonal"
            border="start"
            border-color="error"
            density="compact"
            class="mt-3"
            role="alert"
          >
            {{ requestError(request) }}
          </v-alert>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import LockableButton from "~/components/LockableButton.vue";
import { useCrmRequestsStore, type CrmProjectRequest } from "~/stores/crm-requests";

const props = defineProps<{
  projectId: string;
}>();

const { locale } = useI18n();
const requestsStore = useCrmRequestsStore();

await requestsStore.listRequests(props.projectId);

const requests = computed(() => requestsStore.requests.value[props.projectId] ?? []);
const isLoading = computed(() => requestsStore.pending.value[props.projectId] ?? false);
const loadError = computed(() => requestsStore.error.value?.[props.projectId] ?? null);
const processingState = computed(() => requestsStore.processing.value);
const processErrorState = computed(() => requestsStore.processError.value);

function statusColor(status: CrmProjectRequest["status"]) {
  switch (status) {
    case "approved":
      return "success";
    case "declined":
      return "error";
    default:
      return "warning";
  }
}

function formatSubmittedAt(value: string | null | undefined) {
  if (!value) {
    return "recently";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(parsed);
  }

  return value;
}

function isProcessing(request: CrmProjectRequest) {
  const key = `${props.projectId}:${request.id}`;
  return Boolean(processingState.value[key]);
}

function requestError(request: CrmProjectRequest) {
  const key = `${props.projectId}:${request.id}`;
  return processErrorState.value[key] ?? null;
}

async function updateStatus(request: CrmProjectRequest, status: "approved" | "declined") {
  if (request.status !== "pending") {
    return;
  }

  try {
    if (status === "approved") {
      await requestsStore.approveRequest(props.projectId, request.id);
    } else {
      await requestsStore.declineRequest(props.projectId, request.id);
    }
  } catch {
    // handled by store error state
  }
}
</script>

<style scoped>
.crm-requests-list :deep(.v-list-item) {
  border-radius: 12px;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
