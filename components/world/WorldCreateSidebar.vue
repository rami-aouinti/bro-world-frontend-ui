<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <header class="flex flex-col gap-2 mb-2">
      <span class="text-caption text-uppercase font-weight-medium text-primary">
        {{ workflow.title }}
      </span>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ workflow.subtitle }}
      </p>
    </header>
    <ol
      class="world-sidebar__steps"
      :aria-label="workflow.title"
    >
      <li
        v-for="(step, index) in workflow.steps"
        :key="step.title"
        class="world-sidebar__step"
      >
        <div
          class="world-sidebar__step-index"
          :aria-label="step.orderLabel"
        >
          {{ index + 1 }}
        </div>
        <div class="world-sidebar__step-content">
          <div class="d-flex align-center gap-2 mb-1">
            <v-icon
              v-if="step.icon"
              :icon="step.icon"
              size="20"
              color="primary"
              aria-hidden="true"
            />
            <span class="text-subtitle-2 font-weight-semibold">{{ step.title }}</span>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ step.description }}
          </p>
        </div>
      </li>
    </ol>
  </SidebarCard>

  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <header class="flex flex-col gap-2 mb-2">
      <span class="text-subtitle-2 font-weight-semibold">{{ plugins.title }}</span>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ plugins.description }}
      </p>
    </header>
    <ul
      v-if="hasSelectedPlugins"
      class="world-sidebar__plugin-list"
    >
      <li
        v-for="plugin in plugins.items"
        :key="plugin.id"
        class="world-sidebar__plugin-item"
      >
        <v-icon
          icon="mdi:puzzle-outline"
          size="18"
          color="primary"
          class="mr-2"
          aria-hidden="true"
        />
        <span class="text-body-2">{{ plugin.name }}</span>
      </li>
    </ul>
    <p
      v-else
      class="text-body-2 text-medium-emphasis mb-0"
    >
      {{ plugins.emptyHint }}
    </p>
  </SidebarCard>

  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <header class="flex flex-col gap-2 mb-4">
      <span class="text-subtitle-2 font-weight-semibold">{{ cta.title }}</span>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ cta.description }}
      </p>
    </header>
    <v-btn
      :to="cta.to"
      color="primary"
      variant="flat"
      size="large"
      block
      :aria-label="cta.buttonAria"
    >
      {{ cta.button }}
    </v-btn>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

type WorkflowStep = {
  icon?: string | null;
  title: string;
  description: string;
  orderLabel: string;
};

type PluginItem = {
  id: string;
  name: string;
};

type WorkflowSection = {
  title: string;
  subtitle: string;
  steps: WorkflowStep[];
};

type PluginSummary = {
  title: string;
  description: string;
  items: PluginItem[];
  emptyHint: string;
};

type CtaContent = {
  title: string;
  description: string;
  button: string;
  buttonAria: string;
  to: string;
};

const props = defineProps<{
  workflow: WorkflowSection;
  plugins: PluginSummary;
  cta: CtaContent;
}>();

const hasSelectedPlugins = computed(() => props.plugins.items.length > 0);
</script>

<style scoped>
.world-sidebar__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.world-sidebar__step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.world-sidebar__step-index {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.world-sidebar__plugin-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.world-sidebar__plugin-item {
  display: flex;
  align-items: center;
}

.world-sidebar-card {
  backdrop-filter: blur(12px);
}
</style>
