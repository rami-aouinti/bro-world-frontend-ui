<template>
  <v-avatar
    :size="avatarSize"
    :color="color"
    class="user-avatar"
    variant="tonal"
  >
    <v-img
      v-if="resolvedSrc"
      :src="resolvedSrc"
      :alt="altText"
      cover
    />
    <span
      v-else
      class="user-avatar__initials"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
  </v-avatar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { optimizeAvatarUrl } from "~/lib/images/avatar";

const props = withDefaults(
  defineProps<{
    src?: string | null;
    name?: string | null;
    alt?: string | null;
    size?: number | string;
    color?: string;
  }>(),
  {
    src: null,
    name: null,
    alt: null,
    size: 56,
    color: "primary",
  },
);

const normalizedSize = computed(() => {
  const value = props.size;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(24, Math.round(value));
  }

  const parsed = Number.parseInt(String(value ?? 56), 10);

  if (Number.isFinite(parsed)) {
    return Math.max(24, parsed);
  }

  return 56;
});

const resolvedSrc = computed(() =>
  optimizeAvatarUrl(props.src ?? null, normalizedSize.value) ?? props.src ?? null,
);

const altText = computed(() => props.alt ?? props.name ?? "User avatar");

const initials = computed(() => {
  const source = props.name?.trim();

  if (!source) {
    return "👤";
  }

  const pieces = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!pieces.length) {
    return "👤";
  }

  return pieces
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
});

const avatarSize = computed(() => normalizedSize.value);
const color = computed(() => props.color ?? "primary");
</script>

<style scoped>
.user-avatar {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.user-avatar__initials {
  font-size: 1rem;
  line-height: 1;
}
</style>
