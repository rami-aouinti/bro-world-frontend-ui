<template>
  <HomePage />
</template>

<script setup lang="ts">
import HomePage from "~/pages/home.vue";
import { useWorldBlogPage } from "~/composables/useWorldBlogPage";

useWorldBlogPage();
</script>
