<template>
  <div class="d-flex flex-column gap-8">
    <header class="d-flex flex-column gap-2">
      <NuxtLink
        :to="workspacePath"
        class="d-inline-flex align-center text-body-2 text-medium-emphasis gap-2"
      >
        <v-icon
          icon="mdi:arrow-left"
          size="18"
        />
        <span>Back to CRM workspace</span>
      </NuxtLink>

      <h1 class="text-h4 text-md-h3 font-weight-bold mb-0">
        Project “{{ project?.name ?? "Untitled project" }}”
      </h1>

      <p
        v-if="project?.description"
        class="text-body-2 text-medium-emphasis mb-0"
      >
        {{ project.description }}
      </p>
    </header>

    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      border="start"
      border-color="error"
      density="comfortable"
      role="alert"
    >
      {{ loadError }}
    </v-alert>

    <v-alert
      v-else-if="!project"
      type="warning"
      variant="tonal"
      border="start"
      border-color="warning"
      density="comfortable"
      role="status"
    >
      We could not find this project in the CRM workspace.
    </v-alert>

    <v-alert
      v-if="leaveSuccess"
      type="success"
      variant="tonal"
      border="start"
      border-color="success"
      density="comfortable"
      closable
      role="status"
      @click:close="leaveSuccess = null"
    >
      {{ leaveSuccess }}
    </v-alert>

    <v-row
      v-if="project"
      class="gap-y-6"
      align="stretch"
    >
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          variant="outlined"
          class="h-100"
        >
          <v-card-item>
            <v-card-title class="text-h6 font-weight-semibold"> Project navigation </v-card-title>
            <v-card-subtitle class="text-body-2 text-medium-emphasis">
              Browse CRM insights for this opportunity.
            </v-card-subtitle>
          </v-card-item>

          <v-divider />

          <v-card-text class="py-3">
            <v-list
              density="comfortable"
              nav
            >
              <v-list-item
                v-for="item in navItems"
                :key="item.name"
                :to="item.to"
                :title="item.title"
                :prepend-icon="item.icon"
                :active="isItemActive(item)"
                rounded="lg"
              />
            </v-list>
          </v-card-text>

          <v-divider />

          <v-card-text class="d-flex flex-column gap-3">
            <v-alert
              v-if="leaveError"
              type="error"
              variant="tonal"
              border="start"
              border-color="error"
              density="compact"
              role="alert"
            >
              {{ leaveError }}
            </v-alert>

            <LockableButton
              v-if="showLeaveButton"
              color="error"
              variant="tonal"
              block
              rounded="lg"
              class="font-weight-semibold text-uppercase"
              :loading="leavePending"
              :disabled="!canLeave"
              @click="leaveDialog = true"
            >
              Leave project
            </LockableButton>

            <p
              v-if="showLeaveButton"
              class="text-caption text-medium-emphasis mb-0"
            >
              You can leave the project once all your tasks are reassigned.
            </p>

            <div class="d-flex flex-column gap-1 text-body-2 text-medium-emphasis">
              <span class="font-weight-medium">Owner</span>
              <span>{{ project.ownerName || "Not assigned" }}</span>
            </div>

            <div class="d-flex flex-column gap-1 text-body-2 text-medium-emphasis">
              <span class="font-weight-medium">Stage</span>
              <span>{{ project.stage || project.status || "—" }}</span>
            </div>

            <div class="d-flex flex-column gap-1 text-body-2 text-medium-emphasis">
              <span class="font-weight-medium">Participants</span>
              <span>
                <template v-if="participantsCount > 0">
                  {{ participantsCount }} team member{{ participantsCount > 1 ? "s" : "" }}
                </template>
                <template v-else> No participants yet </template>
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="8"
      >
        <slot :project="project" />
      </v-col>
    </v-row>

    <v-dialog
      v-model="leaveDialog"
      max-width="480"
    >
      <v-card>
        <v-card-title class="text-h6 font-weight-semibold">
          Leave the project “{{ project?.name ?? "project" }}”?
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          You will lose access to the project’s participants, requests, and timeline once you leave.
          Confirm to notify the owner and free up your seat in the CRM workspace.
        </v-card-text>
        <v-card-actions class="justify-end gap-2">
          <v-btn
            variant="text"
            :disabled="leavePending"
            @click="leaveDialog = false"
          >
            Cancel
          </v-btn>
          <LockableButton
            color="error"
            variant="flat"
            rounded="lg"
            class="font-weight-semibold text-uppercase"
            :loading="leavePending"
            @click="handleLeave"
          >
            Confirm leave
          </LockableButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { callOnce, useLocalePath } from "#imports";

import LockableButton from "~/components/LockableButton.vue";
import { useAuthSession } from "~/stores/auth-session";
import { useCrmProjectsStore, type CrmProject } from "~/stores/crm-projects";
import { useCrmParticipantsStore } from "~/stores/crm-participants";

interface NavItem {
  name: string;
  title: string;
  icon: string;
  to: string | { name: string; params: { id: string } };
}

const props = defineProps<{
  projectId: string;
}>();

const projectsStore = useCrmProjectsStore();
const participantsStore = useCrmParticipantsStore();
const authSession = useAuthSession();
const route = useRoute();
const localePath = useLocalePath();

const leaveDialog = ref(false);
const leavePending = ref(false);
const leaveError = ref<string | null>(null);
const leaveSuccess = ref<string | null>(null);
const loadError = ref<string | null>(null);

await callOnce("crm:projects:list", () => projectsStore.listProjects());

try {
  await participantsStore.listParticipants(props.projectId);
} catch (error) {
  const message =
    participantsStore.error.value?.[props.projectId] ||
    (error as { message?: string } | null)?.message?.toString()?.trim() ||
    null;
  if (message) {
    loadError.value = message;
  }
}

const project = computed<CrmProject | null>(() => projectsStore.getProject(props.projectId));
const participants = computed(() => participantsStore.participants.value[props.projectId] ?? []);
const participantsCount = computed(() => participants.value.length);
const currentUser = computed(() => authSession.currentUser.value);
const currentUserId = computed(() => currentUser.value?.id?.toString() || "usr-201");
const currentParticipant = computed(() =>
  participantsStore.getParticipant(props.projectId, currentUserId.value),
);

const workspacePath = computed(() => {
  try {
    return localePath({ name: "crm" });
  } catch {
    return "/crm";
  }
});

const navItems = computed<NavItem[]>(() => [
  {
    name: "crm-projects-id",
    title: "Project info",
    icon: "mdi:clipboard-text-outline",
    to: resolveNavTarget("crm-projects-id"),
  },
  {
    name: "crm-projects-id-requests",
    title: "Project requests",
    icon: "mdi:account-question-outline",
    to: resolveNavTarget("crm-projects-id-requests"),
  },
  {
    name: "crm-projects-id-tasks",
    title: "Project tasks",
    icon: "mdi:format-list-checks",
    to: resolveNavTarget("crm-projects-id-tasks"),
  },
  {
    name: "crm-projects-id-participants",
    title: "Project participants",
    icon: "mdi:account-group-outline",
    to: resolveNavTarget("crm-projects-id-participants"),
  },
]);

const showLeaveButton = computed(() => Boolean(currentParticipant.value));
const isOwner = computed(
  () => project.value?.ownerId && project.value.ownerId === currentUserId.value,
);
const isCompleted = computed(
  () => (project.value?.status ?? "").toString().trim().toLowerCase() === "completed",
);
const canLeave = computed(() => {
  if (!currentParticipant.value || isOwner.value || isCompleted.value) {
    return false;
  }

  const assignedTasks = currentParticipant.value.tasksCount ?? 0;
  return assignedTasks === 0;
});

function resolveNavTarget(name: string) {
  try {
    return localePath({ name, params: { id: props.projectId } });
  } catch {
    return { name, params: { id: props.projectId } };
  }
}

function isItemActive(item: NavItem) {
  const currentName = route.name?.toString();
  if (!currentName) {
    return false;
  }

  if (currentName === item.name) {
    return true;
  }

  if (item.name === "crm-projects-id" && currentName === "crm-projects-id-index") {
    return true;
  }

  return false;
}

async function handleLeave() {
  if (!currentParticipant.value) {
    leaveDialog.value = false;
    return;
  }

  leaveError.value = null;
  leavePending.value = true;

  try {
    await participantsStore.leaveProject(props.projectId, currentUserId.value);
    leaveSuccess.value = `You have left “${project.value?.name ?? "this project"}”.`;
    leaveDialog.value = false;
  } catch (error) {
    leaveError.value =
      (error as { message?: string } | null)?.message?.toString()?.trim() ||
      "Unable to leave the project.";
  } finally {
    leavePending.value = false;
  }
}

onMounted(() => {
  if (!project.value) {
    loadError.value = "The selected project could not be found.";
  }
});
</script>

<style scoped>
.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.68);
}
</style>
