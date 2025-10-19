<template>
  <div class="flex flex-col gap-4">
    <v-card
      v-for="point in points"
      :key="point.title"
      class="about-mission-card"
      elevation="0"
      rounded="lg"
    >
      <div class="d-flex align-start">
        <v-avatar
          class="about-mission-card__icon mr-4"
          size="48"
        >
          <v-icon
            :icon="point.icon"
            size="26"
            aria-hidden="true"
          />
        </v-avatar>
        <div>
          <h3 class="text-subtitle-1 font-weight-semibold mb-1">
            {{ point.title }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ point.body }}
          </p>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface MissionPoint {
  icon: string;
  title: string;
  body: string;
}

defineProps<{
  points: MissionPoint[];
}>();
</script>
