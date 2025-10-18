<template>
  <section
    aria-labelledby="help-faq-title"
    class="help-faq"
  >
    <div class="mb-6 d-flex align-center justify-space-between flex-wrap gap-4">
      <div>
        <h2
          id="help-faq-title"
          class="text-h5 text-md-h4 mb-1"
        >
          {{ title }}
        </h2>
        <p
          v-if="subtitle"
          class="text-medium-emphasis"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>
    <v-expansion-panels
      variant="accordion"
      multiple
      tile
    >
      <v-expansion-panel
        v-for="item in faqItems"
        :key="item.q"
        class="rounded-lg mb-2"
      >
        <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
          {{ item.q }}
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
          {{ item.a }}
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface FaqItem {
  q: string;
  a: string;
}

const props = defineProps<{
  title: string;
  subtitle?: string;
  items: FaqItem[];
}>();

const faqItems = computed(() => props.items ?? []);

const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.value.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
}));

useHead(() => ({
  script: [
    {
      key: "help-faq-jsonld",
      type: "application/ld+json",
      children: JSON.stringify(faqJsonLd.value),
    },
  ],
}));
</script>

<style scoped>
.help-faq {
  border-radius: 24px;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.01) 100%);
}
</style>
