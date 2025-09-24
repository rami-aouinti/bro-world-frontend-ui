<template>
  <header class="flex flex-wrap items-center gap-6">
    <div class="flex items-center gap-4">
      <div
        class="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10"
      >
        <img
          :src="user.photo ?? defaultAvatar"
          :alt="`${user.firstName} ${user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-sm font-medium text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="text-xs text-slate-400">
          {{ publishedLabel }}
        </p>
      </div>
    </div>
    <div class="ms-auto flex flex-wrap gap-3 text-sm text-slate-200">
      <span
        :aria-label="reactionBadge.ariaLabel ?? undefined"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
      >
        <span
          aria-hidden="true"
          class="text-base"
          >{{ reactionBadge.icon }}</span
        >
        <span :aria-hidden="reactionBadge.ariaLabel ? 'true' : undefined">
          {{ reactionBadge.display }}
        </span>
      </span>
      <span
        :aria-label="commentBadge.ariaLabel ?? undefined"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
      >
        <span
          aria-hidden="true"
          class="text-base"
          >{{ commentBadge.icon }}</span
        >
        <span :aria-hidden="commentBadge.ariaLabel ? 'true' : undefined">
          {{ commentBadge.display }}
        </span>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { BlogUser } from "~/lib/mock/blog";

interface BadgeContent {
  icon: string;
  display: string;
  ariaLabel?: string;
}

defineProps<{
  user: BlogUser;
  defaultAvatar: string;
  publishedLabel: string;
  reactionBadge: BadgeContent;
  commentBadge: BadgeContent;
}>();
</script>
