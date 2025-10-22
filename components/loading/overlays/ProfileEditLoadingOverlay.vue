<template>
  <div
    class="profile-edit-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      v-for="index in 3"
      :key="`form-section-${index}`"
      class="profile-edit-overlay__card"
      glow
    >
      <div class="profile-edit-overlay__header">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="text" />
      </div>
      <div class="profile-edit-overlay__form-grid">
        <div
          v-for="field in 4"
          :key="`section-${index}-field-${field}`"
          class="profile-edit-overlay__field"
        >
          <v-skeleton-loader type="text" />
          <div class="profile-edit-overlay__control" />
        </div>
      </div>
      <div class="profile-edit-overlay__actions">
        <v-skeleton-loader type="button" />
        <v-skeleton-loader type="button" />
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-edit-overlay {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  width: min(960px, 100%);
}

.profile-edit-overlay__card {
  padding: clamp(1.75rem, 4vw, 2.5rem);
  display: grid;
  gap: 1.5rem;
}

.profile-edit-overlay__header {
  display: grid;
  gap: 0.5rem;
}

.profile-edit-overlay__form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.profile-edit-overlay__field {
  display: grid;
  gap: 0.5rem;
}

.profile-edit-overlay__control {
  height: 2.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.18), transparent);
}

.profile-edit-overlay__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
