<template>
  <v-menu
    location="bottom end"
    transition="scale-transition"
    :offset="8"
  >
    <template #activator="{ props: profileProps }">
      <button
        type="button"
        :class="[
          'rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          iconTriggerClasses,
        ]"
        :aria-label="props.profileLabel"
        v-bind="profileProps"
      >
        <template v-if="props.user">
          <v-avatar
            size="28"
            :class="['ring-1 ring-black/5 dark:ring-white/10', avatarClasses]"
          >
            <v-img
              v-if="props.user.photo"
              :src="props.user.photo"
              :alt="heading"
              cover
            />
            <template v-else>
              <span class="text-[11px] font-semibold uppercase">
                {{ initials }}
              </span>
            </template>
          </v-avatar>
        </template>
        <template v-else>
          <Icon
            name="mdi:person-outline"
            :size="22"
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
        <!-- Header -->
        <div class="flex items-center gap-3 rounded-2xl px-4 py-4">
          <v-avatar
            size="32"
            class="bg-primary/10 text-primary"
          >
            <template v-if="props.user">
              <span class="text-[12px] font-semibold uppercase">
                {{ initials }}
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
            <p class="text-sm font-semibold leading-tight truncate">
              {{ heading }}
            </p>
            <p class="text-xs text-muted-foreground truncate">
              Bro World
            </p>
          </div>
        </div>

        <v-divider class="opacity-70" />

        <!-- Items -->
        <v-list
          class="py-1 rounded-xl"
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
  </v-menu>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { AuthUser } from "~/types/auth";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const props = defineProps<{
  items: { title: string; icon: string; to?: string; action?: "logout" }[];
  iconTriggerClasses: string;
  loggingOut: boolean;
  user: AuthUser | null;
  signedInText: string;
  guestTitle: string;
  guestSubtitle: string;
  profileLabel: string;
}>();
const emit = defineEmits(["select"]);

const heading = computed(() => {
  if (!props.user) return props.guestTitle;
  const first = props.user.firstName?.trim();
  const last = props.user.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (props.user.username) return props.user.username;
  if (props.user.email) return props.user.email;
  return props.guestTitle;
});

const subheading = computed(() => {
  if (!props.user) return props.guestSubtitle;
  if (props.user.email) return `${props.signedInText} ${props.user.email}`;
  if (props.user.username) return `${props.signedInText} ${props.user.username}`;
  return props.signedInText;
});

const avatarClasses = computed(() =>
  props.user?.photo ? "bg-transparent" : "bg-primary/10 text-primary",
);

const initials = computed(() => {
  if (!props.user) return "";
  const letters: string[] = [];
  if (props.user.firstName?.trim()) letters.push(props.user.firstName.trim()[0] ?? "");
  if (props.user.lastName?.trim()) letters.push(props.user.lastName.trim()[0] ?? "");
  if (letters.length === 0 && props.user.username) letters.push(props.user.username[0] ?? "");
  if (letters.length === 0 && props.user.email) letters.push(props.user.email[0] ?? "");
  return letters.join("").slice(0, 2).toUpperCase();
});
</script>
