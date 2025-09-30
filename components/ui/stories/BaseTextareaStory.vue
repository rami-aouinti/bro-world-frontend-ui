<template>
  <div class="story-stack">
    <FormField
      label="Bio"
      hint="Tell us a little about yourself"
    >
      <BaseTextarea
        v-model="bio"
        auto-grow
      />
    </FormField>
    <FormField
      label="Feedback"
      :error="bio.length < 10"
      :error-messages="bio.length < 10 ? ['Please write at least 10 characters'] : []"
    >
      <BaseTextarea
        v-model="bio"
        :rows="3"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BaseTextarea, FormField } from "../index";

const bio = ref("");
</script>

<style scoped>
.story-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
}
</style>
