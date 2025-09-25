<template>
  <div class="story-stack">
    <FormField label="Preferences" hint="Select all that apply">
      <div class="story-stack">
        <BaseCheckbox v-model="newsletter" label="Newsletter" />
        <BaseCheckbox v-model="terms" label="Agree to terms" :error="!terms" :hint="terms ? '' : 'Required'" />
      </div>
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox, FormField } from '../index'

const newsletter = ref(true)
const terms = ref(false)
</script>

<style scoped>
.story-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
