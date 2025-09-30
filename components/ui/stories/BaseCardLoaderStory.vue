<template>
  <div class="story-grid">
    <BaseCardLoader />
    <BaseCardLoader variant="profile" />
    <BaseCardLoader variant="media" />
    <BaseCardLoader variant="stat" />
  </div>
</template>

<script setup lang="ts">
import { BaseCardLoader } from "../index";
</script>

<style scoped>
.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
</style>
