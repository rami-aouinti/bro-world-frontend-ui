<template>
  <component
    :is="props.as"
    v-bind="restAttrs"
    :class="cardClasses"
    data-component="base-card"
    :data-variant="props.variant"
  >
    <div class="px-4 py-4">
      <div v-if="hasMedia" :class="mediaClasses" data-test="base-card-media">
        <slot name="media" />
      </div>

      <header v-if="hasHeader" :class="headerClasses" data-test="base-card-header">
        <slot name="header" />
      </header>

      <section v-if="hasBody" :class="bodyClasses" data-test="base-card-body">
        <slot />
      </section>

      <footer v-if="hasFooter" :class="footerClasses" data-test="base-card-footer">
        <slot name="footer" />
      </footer>
    </div>
    <BorderBeam
        :size="250"
        :duration="2"
        :delay="5"
        :border-width="2"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import { cn } from '~/lib/utils'

type CardVariant = 'solid' | 'muted' | 'outline' | 'glass' | 'gradient'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'
type CardRounded = 'md' | 'lg' | 'xl'
type BodySpacing = 'sm' | 'md' | 'lg'

const variantClasses: Record<CardVariant, string> = {
  solid:
    'bg-slate-950/70 border border-white/10 shadow-[0_25px_55px_-30px_rgba(15,23,42,0.95)] text-slate-100',
  muted:
    'bg-slate-900/60 border border-white/5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.9)] text-slate-200',
  outline:
    'bg-slate-950/40 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] text-slate-100',
  glass:
    'bg-white/8 border border-white/15 backdrop-blur-2xl shadow-[0_35px_65px_-40px_rgba(15,23,42,0.85)] text-slate-100',
  gradient:
    'bg-gradient-to-br from-primary/25 via-slate-950/70 to-slate-950/95 border border-primary/30 shadow-[0_35px_75px_-35px_rgba(59,130,246,0.65)] text-white',
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const roundedClasses: Record<CardRounded, string> = {
  md: 'rounded-2xl',
  lg: 'rounded-[1.75rem]',
  xl: 'rounded-3xl',
}

const spacingClasses: Record<BodySpacing, string> = {
  sm: 'space-y-3 text-sm',
  md: 'space-y-4 text-base',
  lg: 'space-y-6 text-base',
}

const props = withDefaults(
  defineProps<{
    as?: string
    variant?: CardVariant
    padding?: CardPadding
    rounded?: CardRounded
    hover?: boolean
    animation?: boolean
    spacing?: BodySpacing
    bodyClass?: string
    headerClass?: string
    footerClass?: string
    mediaClass?: string
    footerDivider?: boolean
  }>(),
  {
    as: 'article',
    variant: 'solid',
    padding: 'md',
    rounded: 'xl',
    hover: false,
    animation: false,
    spacing: 'md',
    bodyClass: '',
    headerClass: '',
    footerClass: '',
    mediaClass: '',
    footerDivider: true,
  },
)

const attrs = useAttrs()
const slots = useSlots()

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown> & { class?: unknown }
  return rest
})

const hoverClasses =
  'transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_35px_85px_-35px_rgba(15,23,42,0.95)]'

const cardClasses = computed(() =>
  cn(
    'relative isolate flex flex-col gap-6 overflow-hidden transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    paddingClasses[props.padding],
    roundedClasses[props.rounded],
    variantClasses[props.variant],
    props.hover && hoverClasses,
    attrs.class as unknown,
  ),
)

const mediaClasses = computed(() =>
  cn('overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/5', props.mediaClass),
)

const headerClasses = computed(() =>
  cn('flex items-start justify-between gap-4 text-left', props.headerClass),
)

const bodyClasses = computed(() => cn('text-slate-200', spacingClasses[props.spacing], props.bodyClass))

const footerClasses = computed(() =>
  cn(
    'flex items-center justify-between gap-3 text-sm text-slate-300 transition-colors',
    props.footerDivider && 'border-t border-white/10 pt-4',
    props.footerClass,
  ),
)

const hasMedia = computed(() => Boolean(slots.media))
const hasHeader = computed(() => Boolean(slots.header))
const hasBody = computed(() => Boolean(slots.default))
const hasFooter = computed(() => Boolean(slots.footer))
</script>
