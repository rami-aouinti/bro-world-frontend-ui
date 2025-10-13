<template>
  <div class="settings-sidebar">
    <SidebarCard
        class="text-card-foreground px-3 py-2"
        glow
    >
      <v-list
        nav
        class="py-2 rounded-xl"
        density="comfortable"
        style="background-color: transparent"
      >
        <v-list-subheader class="text-subtitle-2">
          {{ title }}
        </v-list-subheader>
        <v-list-item
            class="group mx-2 my-0.5 rounded-xl my-4 transition-colors hover:bg-gray-50 focus-within:bg-gray-50 dark:hover:bg-white/5 dark:focus-within:bg-white/5"
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
    </SidebarCard>
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
