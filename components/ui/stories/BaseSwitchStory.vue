<template>
  <div class="story-stack">
    <FormField label="Notifications">
      <BaseSwitch
        v-model="marketing"
        label="Marketing emails"
      />
    </FormField>
    <FormField label="Dark mode">
      <BaseSwitch
        v-model="darkMode"
        label="Enable dark theme"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BaseSwitch, FormField } from "../index";

const marketing = ref(true);
const darkMode = ref(false);
</script>

<style scoped>
.story-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
}
</style>
