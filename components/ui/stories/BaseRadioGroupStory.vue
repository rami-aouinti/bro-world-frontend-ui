<template>
  <FormField
    label="Plan"
    hint="Choose one plan"
  >
    <BaseRadioGroup
      v-model="plan"
      :options="planOptions"
      direction="horizontal"
    />
  </FormField>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BaseRadioGroup, FormField } from "../index";

const plan = ref("starter");
const planOptions = [
  { label: "Starter", value: "starter", hint: "Basic features" },
  { label: "Pro", value: "pro", hint: "Most popular" },
  { label: "Enterprise", value: "enterprise", disabled: true },
];
</script>
