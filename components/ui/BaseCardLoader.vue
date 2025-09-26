<template>
  <component
    :is="props.as"
    :class="containerClasses"
    role="status"
    :aria-label="props.ariaLabel"
    aria-live="polite"
    aria-busy="true"
    data-component="base-card-loader"
    :data-variant="props.variant"
  >
    <span class="sr-only">{{ props.ariaLabel }}</span>

    <template v-if="props.variant === 'basic'">
      <div class="flex flex-col gap-6" data-test="loader-basic">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 shrink-0 rounded-2xl bg-white/10" />
          <div class="flex flex-1 flex-col gap-2">
            <div class="h-3 w-1/3 rounded-full bg-white/10" />
            <div class="h-4 w-2/3 rounded-full bg-white/10" />
          </div>
          <div class="h-9 w-20 shrink-0 rounded-full bg-white/10" />
        </div>
        <div class="space-y-3">
          <div class="h-4 w-full rounded-full bg-white/10" />
          <div class="h-4 w-5/6 rounded-full bg-white/10" />
          <div class="h-4 w-2/3 rounded-full bg-white/10" />
        </div>
        <div class="flex items-center justify-between gap-4 pt-2">
          <div class="h-4 w-28 rounded-full bg-white/10" />
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full bg-white/10" />
            <div class="h-8 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="props.variant === 'profile'">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-center" data-test="loader-profile">
        <div class="flex items-center justify-center sm:items-start sm:justify-start">
          <div class="h-20 w-20 rounded-[1.75rem] bg-white/10" data-test="profile-avatar" />
        </div>
        <div class="flex flex-1 flex-col gap-4">
          <div class="h-5 w-1/2 rounded-full bg-white/10" />
          <div class="space-y-2">
            <div class="h-4 w-5/6 rounded-full bg-white/10" />
            <div class="h-4 w-2/3 rounded-full bg-white/10" />
            <div class="h-4 w-1/2 rounded-full bg-white/10" />
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex gap-2">
              <div class="h-9 w-24 rounded-full bg-white/10" />
              <div class="h-9 w-24 rounded-full bg-white/10" />
            </div>
            <div class="h-3 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="props.variant === 'media'">
      <div class="flex flex-col gap-5" data-test="loader-media">
        <div class="relative overflow-hidden rounded-[1.5rem] bg-white/10 pb-[56%]" data-test="media-cover">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
        </div>
        <div class="space-y-3">
          <div class="h-5 w-1/2 rounded-full bg-white/10" />
          <div class="space-y-2">
            <div class="h-4 w-full rounded-full bg-white/10" />
            <div class="h-4 w-5/6 rounded-full bg-white/10" />
            <div class="h-4 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <div class="h-9 w-24 rounded-full bg-white/10" />
          <div class="h-9 w-16 rounded-full bg-white/10" />
          <div class="h-9 w-9 rounded-full bg-white/10" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col gap-6" data-test="loader-stat">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-3">
            <div class="h-4 w-24 rounded-full bg-white/10" />
            <div class="h-12 w-32 rounded-full bg-white/10" />
          </div>
          <div class="h-16 w-16 rounded-2xl bg-white/10" />
        </div>
        <div class="grid grid-cols-2 gap-3" data-test="stat-grid">
          <div class="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div class="h-3 w-1/3 rounded-full bg-white/10" />
            <div class="mt-3 h-5 w-1/2 rounded-full bg-white/10" />
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div class="h-3 w-1/4 rounded-full bg-white/10" />
            <div class="mt-3 h-5 w-2/3 rounded-full bg-white/10" />
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div class="h-3 w-1/3 rounded-full bg-white/10" />
            <div class="mt-3 h-5 w-1/2 rounded-full bg-white/10" />
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div class="h-3 w-1/4 rounded-full bg-white/10" />
            <div class="mt-3 h-5 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

type LoaderVariant = 'basic' | 'profile' | 'media' | 'stat'
type LoaderPadding = 'sm' | 'md' | 'lg'
type LoaderRounded = 'md' | 'lg' | 'xl'

type LoaderVariantStyle = Record<LoaderVariant, string>

type LoaderPaddingMap = Record<LoaderPadding, string>

type LoaderRoundedMap = Record<LoaderRounded, string>

const variantBackgrounds: LoaderVariantStyle = {
  basic: 'bg-slate-950/60 border-white/10 shadow-[0_25px_55px_-30px_rgba(15,23,42,0.95)]',
  profile: 'bg-slate-950/55 border-white/10 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.9)]',
  media: 'bg-slate-950/55 border-white/10 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.95)]',
  stat: 'bg-slate-950/65 border-white/10 shadow-[0_28px_65px_-32px_rgba(15,23,42,0.95)]',
}

const paddingMap: LoaderPaddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const roundedMap: LoaderRoundedMap = {
  md: 'rounded-2xl',
  lg: 'rounded-[1.75rem]',
  xl: 'rounded-3xl',
}

const props = withDefaults(
  defineProps<{
    variant?: LoaderVariant
    ariaLabel?: string
    as?: string
    padding?: LoaderPadding
    rounded?: LoaderRounded
  }>(),
  {
    variant: 'basic',
    ariaLabel: 'Loading card content',
    as: 'div',
    padding: 'md',
    rounded: 'xl',
  },
)

const containerClasses = computed(() =>
  cn(
    'relative isolate flex flex-col gap-4 overflow-hidden border bg-slate-950/50 text-slate-100 transition-colors duration-300',
    'pointer-events-none select-none animate-pulse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    variantBackgrounds[props.variant],
    paddingMap[props.padding],
    roundedMap[props.rounded],
  ),
)
</script>
