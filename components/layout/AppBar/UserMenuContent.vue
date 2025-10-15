<template>
  <div
    class="min-w-[280px] overflow-hidden bg-background text-card-foreground px-3 py-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10"
    style="border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))"
  >
    <span
      class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
    ></span>
    <span
      class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
    ></span>
    <div class="relative z-10 flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-3 rounded-2xl px-4 py-4">
        <v-avatar
          size="32"
          class="bg-primary/10 text-primary"
        >
          <template v-if="props.user">
            <span class="text-[12px] font-semibold uppercase">
              {{ props.initials }}
            </span>
          </template>
          <template v-else>
            <Icon
              name="mdi:account-outline"
              :size="20"
            />
          </template>
        </v-avatar>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold leading-tight">
            {{ props.heading }}
          </p>
          <p class="truncate text-xs text-muted-foreground">
            {{ props.subheading }}
          </p>
        </div>
      </div>

      <v-divider class="opacity-70" />

      <!-- Items -->
      <v-list
        class="rounded-xl py-1"
        density="comfortable"
        style="background-color: transparent"
      >
        <v-list-item
          v-for="item in props.items"
          :key="item.title"
          :to="item.to"
          :disabled="item.action === 'logout' && props.loggingOut"
          class="group mx-2 my-0.5 rounded-xl px-2 transition-colors hover:bg-gray-50 focus-within:bg-gray-50 dark:hover:bg-white/5 dark:focus-within:bg-white/5"
          @click="emit('select', item)"
        >
          <template #prepend>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15"
            >
              <Icon
                :name="item.icon"
                :size="20"
              />
            </div>
          </template>

          <template #title>
            <span class="mx-3 text-[15px] font-medium">{{ item.title }}</span>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthUser } from "~/types/auth";

type UserMenuItem = { title: string; icon: string; to?: string; action?: "logout" };

const props = defineProps<{
  user: AuthUser | null;
  items: UserMenuItem[];
  loggingOut: boolean;
  heading: string;
  subheading: string;
  initials: string;
}>();

const emit = defineEmits<{
  (e: "select", item: UserMenuItem): void;
}>();
</script>
