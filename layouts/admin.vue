<template>
  <DefaultLayout>
    <template #left-sidebar="slotProps">
      <slot
        name="left-sidebar"
        v-bind="slotProps"
      />
    </template>
    <template #right-sidebar="slotProps">
      <slot
        name="right-sidebar"
        v-bind="slotProps"
      />
    </template>
    <slot />
  </DefaultLayout>
</template>

<script setup lang="ts">
import "~/assets/styles/material-dashboard.scss";
import DefaultLayout from "./default.vue";
</script>
