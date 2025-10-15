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

    <UserMenuContent
      :user="props.user"
      :items="props.items"
      :logging-out="props.loggingOut"
      :heading="heading"
      :subheading="subheading"
      :initials="initials"
      @select="emit('select', $event)"
    />
  </v-menu>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { AuthUser } from "~/types/auth";

const UserMenuContent = defineAsyncComponent({
  loader: () => import("./UserMenuContent.vue"),
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
