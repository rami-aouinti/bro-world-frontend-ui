<template>
  <div
    class="overflow-hidden bg-background text-card-foreground px-3 py-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10"
    style="border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))"
  >
    <span
      class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
    ></span>
    <span
      class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
    ></span>
    <div class="relative z-10 flex flex-col">
      <div class="rounded-2xl px-4 py-3">
        <p class="text-sm font-semibold leading-tight">
          {{ props.title }}
        </p>
        <p
          v-if="props.subtitle"
          class="text-xs text-muted-foreground"
        >
          {{ props.subtitle }}
        </p>
      </div>
      <v-divider />
      <v-list
        class="rounded-xl py-1"
        density="comfortable"
        style="background-color: transparent"
      >
        <v-list-item
          v-for="locale in props.locales"
          :key="locale"
          :title="props.formatLabel(locale)"
          :class="[
            'px-4',
            locale === props.current ? 'bg-primary/5 text-primary dark:bg-primary/15' : '',
          ]"
          role="menuitemradio"
          :aria-checked="locale === props.current"
          @click="emit('select', locale)"
        >
          <template #prepend>
            <span
              v-if="props.getFlag(locale)"
              class="mr-3 block text-base leading-none"
              aria-hidden="true"
            >
              {{ props.getFlag(locale) }}
            </span>
          </template>
          <template #append>
            <AppIcon
              v-if="locale === props.current"
              name="mdi:check"
              :size="18"
            />
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
  locales: string[];
  current: string;
  formatLabel: (locale: string) => string;
  getFlag: (locale: string) => string;
}>();

const emit = defineEmits<{
  (e: "select", locale: string): void;
}>();
</script>
