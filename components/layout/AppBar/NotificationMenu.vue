<template>
  <v-menu
    v-model="open"
    location="bottom end"
    :offset="8"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.buttonLabel"
        v-bind="menuProps"
      >
        <v-badge
          v-if="props.unreadCount > 0"
          :content="props.unreadCount"
          location="top right"
          color="primary"
          max="99"
          size="small"
        >
          <AppIcon
            name="mdi:bell-outline"
            :size="26"
          />
        </v-badge>
        <template v-else>
          <AppIcon
            name="mdi:bell-outline"
            :size="26"
          />
        </template>
      </button>
    </template>
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
        <div class="flex items-center justify-between rounded-2xl px-4 py-3">
          <div>
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
          <v-btn
            :disabled="!props.items.length"
            variant="text"
            size="small"
            class="text-primary"
            @click="handleMarkAll"
          >
            {{ props.markAllText }}
          </v-btn>
        </div>
        <v-divider />
        <v-list
          class="py-1 rounded-xl"
          density="comfortable"
          lines="two"
          style="background-color: transparent"
        >
          <template v-if="props.items.length">
            <v-list-item
              v-for="item in props.items"
              :key="item.id"
              :class="[
                'px-4 py-3 transition-colors',
                !item.read ? 'bg-primary/5 dark:bg-primary/15' : '',
              ]"
            >
              <template #prepend>
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full"
                  :class="resolveColorClass(item.color)"
                >
                  <AppIcon
                    :name="item.icon"
                    :size="20"
                  />
                </div>
              </template>
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium leading-tight">
                  {{ item.title }}
                </p>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  {{ item.description }}
                </p>
              </div>
              <template #append>
                <span class="text-xs text-muted-foreground">
                  {{ item.time }}
                </span>
              </template>
            </v-list-item>
          </template>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <AppIcon
                name="mdi:bell-plus-outline"
                :size="28"
              />
            </div>
            <p class="text-sm font-medium">
              {{ props.emptyText }}
            </p>
          </div>
        </v-list>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import type { AppNotification } from "~/types/layout";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const colorClasses: Record<NonNullable<AppNotification["color"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  info: "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  error: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
};

const props = defineProps<{
  items: AppNotification[];
  iconTriggerClasses: string;
  title: string;
  subtitle?: string;
  emptyText: string;
  markAllText: string;
  buttonLabel: string;
  unreadCount: number;
}>();

const emit = defineEmits<{
  (e: "mark-all"): void;
}>();

const open = ref(false);

function resolveColorClass(color?: AppNotification["color"]) {
  if (!color) return colorClasses.primary;
  return colorClasses[color] ?? colorClasses.primary;
}

function handleMarkAll() {
  emit("mark-all");
}
</script>
