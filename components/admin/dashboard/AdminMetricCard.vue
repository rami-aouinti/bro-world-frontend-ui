<template>
  <SidebarCard
    class="text-card-foreground pa-5 h-100"
    glow
  >
    <div class="d-flex justify-space-between align-start">
      <div>
        <p class="text-subtitle-2 text-medium-emphasis mb-1">{{ label }}</p>
        <p class="text-h5 text-lg-h4 font-weight-bold mb-0">
          <slot name="value">
            {{ value }}
          </slot>
        </p>
        <div
          v-if="hasMetadata"
          class="d-flex align-center gap-2 mt-3"
        >
          <v-chip
            v-if="hasTrend"
            :color="trendColor"
            variant="tonal"
            size="x-small"
            class="font-weight-medium"
          >
            <Icon
              :name="trendIcon"
              size="16"
              class="me-1"
            />
            {{ trend }}
          </v-chip>
          <span
            v-if="caption"
            class="text-caption text-medium-emphasis"
          >
            {{ caption }}
          </span>
        </div>
      </div>
      <v-avatar
        :color="avatarColor"
        variant="tonal"
        size="44"
      >
        <Icon
          :name="icon"
          size="26"
        />
      </v-avatar>
    </div>
    <p
      v-if="description"
      class="text-body-2 text-medium-emphasis mb-0 mt-4"
    >
      {{ description }}
    </p>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

type AvatarColor = string;

interface AdminMetricCardProps {
  label: string;
  value?: string | number;
  trend?: string;
  trendIsPositive?: boolean;
  caption?: string;
  description?: string;
  icon: string;
  avatarColor?: AvatarColor;
}

const props = withDefaults(defineProps<AdminMetricCardProps>(), {
  trendIsPositive: true,
  avatarColor: "primary",
});

const trendIcon = computed(() => (props.trendIsPositive ? "mdi:arrow-up-bold" : "mdi:arrow-down-bold"));
const trendColor = computed(() => (props.trendIsPositive ? "success" : "error"));
const avatarColor = computed(() => props.avatarColor ?? "primary");
const hasTrend = computed(() => Boolean(props.trend));
const hasMetadata = computed(() => hasTrend.value || Boolean(props.caption));
</script>
