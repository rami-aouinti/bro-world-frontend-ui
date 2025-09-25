<template>
  <FormField label="Username" hint="3-16 characters" :error="username.length < 3" :error-messages="username.length < 3 ? ['Too short'] : []">
    <BaseInput v-model="username" />
  </FormField>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput, FormField } from '../index'

const username = ref('')
</script>
