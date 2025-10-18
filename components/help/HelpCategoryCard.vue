<template>
  <v-card
    class="h-100 d-flex flex-column justify-space-between"
    elevation="1"
    rounded="xl"
    :to="categoryLink"
  >
    <v-card-item>
      <div class="d-flex align-start justify-space-between gap-4">
        <div>
          <v-card-title class="text-h6 mb-1">{{ category.title }}</v-card-title>
          <v-card-subtitle class="text-body-2 text-medium-emphasis">
            {{ category.description }}
          </v-card-subtitle>
        </div>
        <v-avatar v-if="category.icon" color="primary" variant="tonal" size="40">
          <v-icon :icon="category.icon" />
        </v-avatar>
      </div>
    </v-card-item>
    <v-card-text class="pt-0">
      <div class="d-flex align-center justify-space-between text-medium-emphasis">
        <span class="text-body-2">{{ articleCountLabel }}</span>
        <v-icon icon="mdi-arrow-right" class="ms-2" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";

import type { HelpCategory } from "~/types/help";

const props = defineProps<{ category: HelpCategory; countLabel: string }>();

const { category } = toRefs(props);
const localePath = useLocalePath();

const categoryLink = computed(() =>
  localePath({ name: "help-category-slug", params: { slug: category.value.slug } }),
);

const articleCountLabel = computed(() => props.countLabel);
</script>
