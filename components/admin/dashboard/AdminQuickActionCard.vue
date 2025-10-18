<template>
  <SidebarCard
    class="text-card-foreground pa-6 h-100"
    glow
  >
    <div class="d-flex align-start gap-4">
      <v-avatar
        :color="color"
        variant="tonal"
        size="48"
      >
        <Icon
          :name="icon"
          size="26"
        />
      </v-avatar>
      <div class="flex-grow-1">
        <h3 class="text-subtitle-1 font-weight-semibold mb-2">{{ title }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>
        <v-btn
          :color="color"
          variant="flat"
          class="text-none"
          block
          :prepend-icon="resolvedCtaIcon"
        >
          {{ ctaLabel }}
        </v-btn>
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface AdminQuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  ctaLabel: string;
  ctaIcon?: string;
}

const props = withDefaults(defineProps<AdminQuickActionCardProps>(), {
  ctaIcon: "mdi:play-circle",
});

const resolvedCtaIcon = computed(() => props.ctaIcon ?? "mdi:play-circle");
</script>
