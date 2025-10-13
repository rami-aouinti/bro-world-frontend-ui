<template>
  <div class="settings-sidebar">
    <v-card
      class="glass-card pa-4"
      rounded="xl"
      elevation="6"
    >
      <v-list
        nav
        density="comfortable"
      >
        <v-list-subheader class="text-subtitle-2 text-medium-emphasis">
          {{ title }}
        </v-list-subheader>
        <v-list-item
          v-for="section in sections"
          :key="section.key"
          :title="section.title"
          :subtitle="section.subtitle"
          :to="section.to"
          :prepend-icon="section.icon"
          :active="section.key === activeSection"
          rounded="lg"
          color="primary"
          variant="tonal"
        />
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface AdminSettingsSection {
  key: string;
  to: string;
  icon: string;
  title: string;
  subtitle: string;
}

defineProps<{
  title: string;
  sections: AdminSettingsSection[];
  activeSection: string;
}>();
</script>

<style scoped>
.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-sidebar :deep(.v-list-item) {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.settings-sidebar :deep(.v-list-item--active) {
  transform: translateX(4px);
  box-shadow: 0 10px 30px -12px rgba(99, 102, 241, 0.45);
}
</style>
