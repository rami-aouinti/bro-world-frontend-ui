<template>
  <div class="flex flex-col gap-6">
    <SidebarCard
      class="text-card-foreground pa-6 mb-6"
      glow
    >
      <div class="d-flex flex-column gap-5">
        <div>
          <h2
            :id="timelineHeadingId"
            class="text-h6 font-weight-semibold mb-2"
          >
            {{ t("pages.profilePhotos.timeline.title") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("pages.profilePhotos.timeline.description") }}
          </p>
        </div>

        <div class="d-flex flex-column gap-4">
          <div
            v-for="milestone in storyMilestones"
            :key="milestone.id"
            class="pa-4 rounded-xl d-flex flex-column gap-3"
            style="
              background: rgba(var(--v-theme-surface-container-high), 0.68);
              border: 1px solid rgba(var(--v-theme-primary), 0.14);
            "
          >
            <div class="d-flex flex-column gap-3">
              <div class="d-flex align-start justify-space-between gap-4">
                <div class="d-flex align-start gap-3">
                  <v-avatar
                    size="44"
                    :color="milestone.color"
                    variant="tonal"
                  >
                    <v-icon
                      :icon="milestone.icon"
                      size="22"
                    />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-semibold">
                      {{ milestone.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ milestone.date }}
                    </div>
                  </div>
                </div>
                <v-chip
                  :color="milestone.color"
                  size="small"
                  variant="flat"
                  class="text-caption font-weight-medium"
                >
                  {{ milestone.status }}
                </v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ milestone.description }}
              </p>
            </div>

            <v-progress-linear
              :model-value="milestone.progress"
              height="6"
              rounded
              :color="milestone.color"
              class="mt-1"
            />

            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="tag in milestone.tags"
                :key="tag"
                size="x-small"
                variant="tonal"
                class="text-caption"
                color="primary"
              >
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </SidebarCard>

    <SidebarCard
      class="text-card-foreground pa-6 bg-primary/10"
      glow
    >
      <div class="d-flex flex-column gap-4">
        <div>
          <h2
            :id="notesHeadingId"
            class="text-h6 font-weight-semibold mb-1"
          >
            {{ t("pages.profilePhotos.sections.timeline") }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("pages.profilePhotos.sections.notesDescription") }}
          </p>
        </div>
        <div class="d-flex flex-column gap-3">
          <div
            v-for="note in creativeNotes"
            :key="note.id"
            class="d-flex flex-column gap-3 pa-4 rounded-xl"
            style="background: rgba(var(--v-theme-surface-container-high), 0.82)"
          >
            <div class="d-flex flex-column gap-3">
              <div class="d-flex align-start justify-space-between gap-3">
                <div class="d-flex align-start gap-3">
                  <v-avatar
                    size="44"
                    :color="note.color"
                    variant="tonal"
                  >
                    <span class="text-body-2 font-weight-semibold">{{ note.initials }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-semibold">{{ note.title }}</div>
                    <div class="text-caption text-medium-emphasis">{{ note.byline }}</div>
                  </div>
                </div>
                <v-chip
                  :color="note.color"
                  size="x-small"
                  variant="flat"
                  class="text-caption font-weight-medium"
                >
                  {{ note.category }}
                </v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ note.preview }}
              </p>
            </div>
            <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
              <span>{{ note.updated }}</span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi:arrow-top-right"
              >
                {{ note.cta }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import type {
  ProfileCreativeNote,
  ProfileStoryMilestone,
} from "~/types/pages/profile";

withDefaults(
  defineProps<{
    storyMilestones?: ProfileStoryMilestone[];
    creativeNotes?: ProfileCreativeNote[];
    timelineHeadingId?: string;
    notesHeadingId?: string;
  }>(),
  {
    storyMilestones: () => [],
    creativeNotes: () => [],
    timelineHeadingId: undefined,
    notesHeadingId: undefined,
  },
);

const { t } = useI18n();
</script>
