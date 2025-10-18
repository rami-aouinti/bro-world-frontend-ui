<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title class="text-h6 font-weight-semibold">Delivery team</v-card-title>
      <v-card-subtitle class="text-body-2 text-medium-emphasis">
        Participants with access to the CRM workspace for this project.
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

      <div v-if="isLoading" class="py-6">
        <v-progress-linear indeterminate color="primary" height="6" rounded="lg" />
      </div>

      <v-alert
        v-else-if="participants.length === 0"
        type="info"
        variant="tonal"
        border="start"
        border-color="primary"
        density="comfortable"
        role="status"
      >
        No participants are assigned to this project yet.
      </v-alert>

      <v-list v-else lines="three" class="crm-participants-list">
        <v-list-item
          v-for="participant in participants"
          :key="participant.id"
          class="align-start"
        >
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="40">
              {{ participant.name.slice(0, 1) }}
            </v-avatar>
          </template>

          <v-list-item-title class="text-body-1 font-weight-semibold">
            {{ participant.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ participant.role || 'Team member' }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
            {{ participant.email || 'Email not shared' }}
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column align-end gap-2">
              <v-chip
                color="primary"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ formatTaskCount(participant.tasksCount) }}
              </v-chip>

              <small class="text-caption text-medium-emphasis">
                Joined {{ formatJoinedAt(participant.joinedAt) }}
              </small>

              <LockableButton
                v-if="canRemove(participant)"
                color="error"
                variant="text"
                size="small"
                :loading="isRemoving(participant)"
                @click="removeParticipant(participant)"
              >
                Remove
              </LockableButton>
            </div>
          </template>

          <v-alert
            v-if="participantError(participant)"
            type="error"
            variant="tonal"
            border="start"
            border-color="error"
            density="compact"
            class="mt-3"
            role="alert"
          >
            {{ participantError(participant) }}
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
import { useAuthSession } from "~/stores/auth-session";
import { useCrmParticipantsStore, type CrmParticipant } from "~/stores/crm-participants";

const props = defineProps<{
  projectId: string;
}>();

const { locale } = useI18n();
const participantsStore = useCrmParticipantsStore();
const authSession = useAuthSession();

const participants = computed(() => participantsStore.participants.value[props.projectId] ?? []);
const isLoading = computed(() => participantsStore.pending.value[props.projectId] ?? false);
const loadError = computed(() => participantsStore.error.value?.[props.projectId] ?? null);
const removingState = computed(() => participantsStore.removing.value);
const removalErrorState = computed(() => participantsStore.removeError.value);
const currentUser = computed(() => authSession.currentUser.value);
const currentUserId = computed(() => currentUser.value?.id?.toString() || "usr-201");

function isRemoving(participant: CrmParticipant) {
  const key = `${props.projectId}:${participant.userId}`;
  return Boolean(removingState.value[key]);
}

function participantError(participant: CrmParticipant) {
  const key = `${props.projectId}:${participant.userId}`;
  return removalErrorState.value[key] ?? null;
}

function canRemove(participant: CrmParticipant) {
  return participant.userId !== currentUserId.value;
}

function formatTaskCount(count: number | null | undefined) {
  if (typeof count === "number" && Number.isFinite(count)) {
    if (count === 0) {
      return "No tasks";
    }

    if (count === 1) {
      return "1 task";
    }

    return `${count} tasks`;
  }

  return "Tasks unknown";
}

function formatJoinedAt(value: string | null | undefined) {
  if (!value) {
    return "recently";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(parsed);
  }

  return value;
}

async function removeParticipant(participant: CrmParticipant) {
  if (!canRemove(participant)) {
    return;
  }

  try {
    await participantsStore.removeParticipant(props.projectId, participant.userId);
  } catch {
    // Error messages are handled via the store error state
  }
}
</script>

<style scoped>
.crm-participants-list :deep(.v-list-item) {
  border-radius: 12px;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
