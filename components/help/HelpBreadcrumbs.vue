<template>
  <nav class="help-breadcrumbs" aria-label="breadcrumbs">
    <v-breadcrumbs :items="breadcrumbs" density="compact">
      <template #prepend>
        <v-icon icon="mdi-home-outline" class="me-2" />
      </template>
      <template #item="{ item }">
        <NuxtLink v-if="item.to" :to="item.to" class="help-breadcrumbs__link">
          {{ item.title }}
        </NuxtLink>
        <span v-else class="help-breadcrumbs__current">{{ item.title }}</span>
      </template>
    </v-breadcrumbs>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface BreadcrumbItem {
  title: string;
  to?: string;
}

const props = defineProps<{ items: BreadcrumbItem[] }>();

const breadcrumbs = computed(() => props.items);

const breadcrumbJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.value.map((item, index) => {
    const jsonItem: Record<string, unknown> = {
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
    };

    if (item.to) {
      jsonItem.item = item.to;
    }

    return jsonItem;
  }),
}));

useHead(() => ({
  script: [
    {
      key: `help-breadcrumbs-${JSON.stringify(breadcrumbJsonLd.value.itemListElement)}`,
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbJsonLd.value),
    },
  ],
}));
</script>

<style scoped>
.help-breadcrumbs {
  margin-block: 1rem 1.5rem;
}

.help-breadcrumbs__link {
  text-decoration: none;
  color: inherit;
}

.help-breadcrumbs__link:hover,
.help-breadcrumbs__link:focus-visible {
  text-decoration: underline;
}

.help-breadcrumbs__current {
  color: rgba(15, 23, 42, 0.7);
}
</style>
