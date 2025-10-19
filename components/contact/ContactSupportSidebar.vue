<template>
  <div class="flex flex-col gap-6">
    <v-sheet
      class="contact-panel contact-panel--secondary"
      elevation="0"
      rounded="xl"
    >
      <section aria-labelledby="contact-support">
        <h2
          id="contact-support"
          class="text-h5 font-weight-semibold mb-2"
        >
          {{ supportTitle }}
        </h2>
        <p class="text-body-2 text-medium-emphasis">
          {{ supportBody }}
        </p>

        <div class="d-flex flex-column gap-4 mt-6">
          <v-card
            v-for="channel in supportChannels"
            :key="channel.title"
            class="contact-channel"
            elevation="0"
            rounded="lg"
          >
            <div class="d-flex align-center mb-3">
              <v-avatar
                size="40"
                class="mr-3 contact-channel__icon"
              >
                <v-icon
                  :icon="channel.icon"
                  size="24"
                  aria-hidden="true"
                />
              </v-avatar>
              <h3 class="text-subtitle-1 font-weight-medium mb-0">
                {{ channel.title }}
              </h3>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ channel.description }}
            </p>
            <v-btn
              v-if="channel.href || channel.to"
              :href="channel.href"
              :to="channel.to"
              :target="channel.target"
              :rel="channel.rel"
              color="primary"
              variant="text"
              class="justify-start px-0"
              :aria-label="channel.ctaLabel"
            >
              {{ channel.cta }}
            </v-btn>
          </v-card>
        </div>
      </section>
    </v-sheet>

    <v-sheet
      class="contact-availability"
      elevation="0"
      rounded="xl"
      aria-labelledby="availability-title"
    >
      <h2
        id="availability-title"
        class="text-h6 font-weight-semibold mb-2"
      >
        {{ availabilityTitle }}
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ availabilityBody }}
      </p>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
interface SupportChannel {
  icon: string;
  title: string;
  description: string;
  cta: string;
  ctaLabel?: string;
  href?: string;
  to?: string;
  target?: string;
  rel?: string;
}

defineProps<{
  supportTitle: string;
  supportBody: string;
  supportChannels: SupportChannel[];
  availabilityTitle: string;
  availabilityBody: string;
}>();
</script>

<style scoped src="~/assets/styles/pages/contact.scss" lang="scss"></style>
