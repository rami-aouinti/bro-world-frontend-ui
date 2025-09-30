<template>
  <div class="story-stack">
    <FormField label="Country">
      <BaseSelect
        v-model="country"
        :items="countries"
        placeholder="Select country"
        clearable
      />
    </FormField>
    <FormField label="Languages">
      <BaseSelect
        v-model="languages"
        :items="languageOptions"
        multiple
        clearable
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BaseSelect, FormField } from "../index";

const country = ref<string | null>(null);
const languages = ref<string[]>([]);

const countries = [
  { label: "Canada", value: "ca" },
  { label: "United States", value: "us" },
  { label: "Mexico", value: "mx" },
];

const languageOptions = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
];
</script>

<style scoped>
.story-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 420px;
}
</style>
