<template>
  <div class="story-stack">
    <FormField label="Email" hint="We'll never share your email">
      <BaseInput v-model="email" type="email" placeholder="name@example.com" clearable />
    </FormField>
    <FormField label="Password" :error="true" :error-messages="['Required']">
      <BaseInput v-model="password" type="password" />
    </FormField>
    <FormField label="Search" hint="Try a keyword">
      <BaseInput v-model="search" type="search">
        <template #prepend>
          <span aria-hidden="true">🔍</span>
        </template>
      </BaseInput>
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput, FormField } from '../index'

const email = ref('')
const password = ref('')
const search = ref('')
</script>

<style scoped>
.story-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 420px;
}
</style>
