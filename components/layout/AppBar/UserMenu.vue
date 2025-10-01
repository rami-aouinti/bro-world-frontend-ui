<template>
  <v-menu location="bottom end">
    <template #activator="{ props: profileProps }">
      <button
        type="button"
        :class="iconTriggerClasses"
        aria-label="Profile"
        v-bind="profileProps"
      >
        <AppIcon
          name="mdi:person-outline"
          :size="22"
        />
      </button>
    </template>
    <v-card
      class="min-w-[260px] overflow-hidden"
      elevation="12"
    >
      <div class="flex items-center gap-3 px-4 py-4">
        <v-avatar
          size="40"
          class="bg-primary/10 text-primary"
        >
          <template v-if="props.user">
            <span class="font-semibold uppercase">
              {{ initials }}
            </span>
          </template>
          <template v-else>
            <AppIcon
              name="mdi:account-outline"
              :size="22"
            />
          </template>
        </v-avatar>
        <div class="flex flex-col">
          <p class="text-sm font-semibold leading-tight">
            {{ heading }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ subheading }}
          </p>
        </div>
      </div>
      <v-divider />
      <v-list
        class="py-0"
        density="compact"
      >
        <v-list-item
          v-for="item in props.items"
          :key="item.title"
          :title="item.title"
          :to="item.to"
          :disabled="item.action === 'logout' && props.loggingOut"
          class="px-4"
          @click="emit('select', item)"
        >
          <template #prepend>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AppIcon
                :name="item.icon"
                :size="20"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AuthUser } from "~/types/auth";

const props = defineProps<{
  items: { title: string; icon: string; to?: string; action?: "logout" }[];
  iconTriggerClasses: string;
  loggingOut: boolean;
  user: AuthUser | null;
  signedInText: string;
  guestTitle: string;
  guestSubtitle: string;
}>();
const emit = defineEmits(["select"]);

const heading = computed(() => {
  if (!props.user) return props.guestTitle;

  const first = props.user.firstName?.trim();
  const last = props.user.lastName?.trim();

  if (first || last) {
    return [first, last].filter(Boolean).join(" ");
  }

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
