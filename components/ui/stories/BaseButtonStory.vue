<template>
  <div class="story-grid">
    <BaseButton>Default</BaseButton>
    <BaseButton variant="tonal">Tonal</BaseButton>
    <BaseButton variant="outline">Outline</BaseButton>
    <BaseButton variant="text">Text</BaseButton>
    <BaseButton variant="plain">Plain</BaseButton>
    <BaseButton size="sm">Small</BaseButton>
    <BaseButton size="lg" loading>Loading</BaseButton>
    <BaseButton block>Block</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '../index'
</script>

<style scoped>
.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}
</style>
