<template>
  <section
    aria-labelledby="crm-projects-title"
    class="crm-section"
  >
    <div class="crm-header">
      <h3
        id="crm-projects-title"
        class="crm-title"
      >
        My projects
      </h3>
      <NuxtLink
        v-slot="{ href, navigate }"
        :to="{ name: 'create_project' }"
        custom
      >
        <v-btn
          :href="href"
          color="primary"
          class="text-none"
          @click="navigate"
        >
          Create project
        </v-btn>
      </NuxtLink>
    </div>
    <div class="crm-content">
      <CrmSuspenseWrapper />
    </div>
  </section>
</template>

<script setup lang="ts">
import CrmSuspenseWrapper from "~/components/crm/CrmSuspenseWrapper.vue";
</script>

<style scoped>
.crm-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.crm-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.crm-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.crm-content {
  background-color: rgba(var(--v-theme-surface-variant));
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: inset 0 0 0 1px rgba(var(--v-border-color), 0.08);
}

@media (min-width: 768px) {
  .crm-section {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
