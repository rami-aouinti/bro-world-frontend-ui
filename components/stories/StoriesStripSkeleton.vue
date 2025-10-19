<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
    aria-hidden="true"
  >
    <div class="d-flex flex-column ga-3">
      <div class="d-flex justify-center flex-wrap ga-4">
        <v-skeleton-loader
          v-for="index in skeletonCount"
          :key="index"
          type="avatar"
          class="mx-2"
          height="72"
          width="72"
        />
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const props = withDefaults(defineProps<{ count?: number }>(), {
  count: 5,
});

const skeletonCount = computed(() => Math.max(1, props.count ?? 0));
</script>
