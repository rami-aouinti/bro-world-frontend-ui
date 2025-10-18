<template>
  <section class="help-hero py-16 py-md-24">
    <div
      class="mx-auto px-4"
      style="max-width: 960px"
    >
      <div class="text-center">
        <p
          v-if="badge"
          class="text-uppercase text-primary font-weight-medium mb-4"
        >
          {{ badge }}
        </p>
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-body-1 text-medium-emphasis mx-auto"
          style="max-width: 720px"
        >
          {{ subtitle }}
        </p>
      </div>
      <div class="mt-8">
        <slot />
      </div>
      <div
        v-if="popularItems?.length"
        class="mt-10 text-center"
      >
        <p class="text-body-2 text-medium-emphasis mb-3">
          {{ popularTitle }}
        </p>
        <div class="d-flex flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="item in popularItems"
            :key="item.to"
            class="text-primary text-body-2 font-weight-medium"
            :to="item.to"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  title: string;
  subtitle?: string;
  badge?: string;
  popularTitle?: string;
  popularItems?: Array<{ label: string; to: string }>;
}>();

const { title, subtitle, badge, popularItems, popularTitle } = toRefs(props);
</script>

<style scoped>
.help-hero {
  background: linear-gradient(135deg, rgba(82, 67, 255, 0.08), rgba(0, 204, 255, 0.08));
  border-bottom: 1px solid rgba(82, 67, 255, 0.08);
}

.help-hero :deep(a) {
  text-decoration: none;
}

.help-hero :deep(a:hover),
.help-hero :deep(a:focus-visible) {
  text-decoration: underline;
}
</style>
