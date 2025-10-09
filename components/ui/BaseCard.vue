<template>
  <component
    :is="props.as"
    v-bind="restAttrs"
    :class="cardClasses"
    :style="styleBinding"
    data-component="base-card"
    :data-variant="props.variant"
  >
    <div class="base-card__content">
      <div
        v-if="hasMedia"
        :class="mediaClasses"
        data-test="base-card-media"
      >
        <slot name="media" />
      </div>

      <header
        v-if="hasHeader"
        :class="headerClasses"
        data-test="base-card-header"
      >
        <slot name="header" />
      </header>

      <section
        v-if="hasBody"
        :class="bodyClasses"
        data-test="base-card-body"
      >
        <slot />
      </section>

      <footer
        v-if="hasFooter"
        :class="footerClasses"
        data-test="base-card-footer"
      >
        <slot name="footer" />
      </footer>
    </div>
    <BorderBeam
      :size="250"
      :duration="8"
      :delay="10"
      :border-width="2"
    />
  </component>
</template>

<script setup lang="ts">
import type { MaybeRefOrGetter, StyleValue } from "vue";
import { computed, toValue, useAttrs, useSlots } from "vue";
import { cn } from "~/lib/utils";

type CardVariant = "solid" | "muted" | "outline" | "glass" | "gradient";
type CardPadding = "none" | "sm" | "md" | "lg";
type CardRounded = "md" | "lg" | "xl";
type BodySpacing = "sm" | "md" | "lg";

type VariantToken = {
  background: string;
  color: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;
  shadow?: string;
  hoverShadow?: string;
  backdropFilter?: string;
  surfaceOverlay?: string;
  bodyColor?: string;
  footerColor?: string;
};

const variantTokens: Record<CardVariant, VariantToken> = {
  solid: {
    background: "rgba(var(--v-theme-surface), 0.96)",
    color: "rgb(var(--v-theme-on-surface))",
    borderColor: "rgba(var(--v-theme-outline-variant), 0.6)",
    shadow: "0 28px 55px rgba(var(--v-theme-shadow), 0.18)",
    hoverShadow: "0 36px 70px rgba(var(--v-theme-shadow), 0.25)",
  },
  muted: {
    background: "rgba(var(--v-theme-surface-variant), 0.78)",
    color: "rgb(var(--v-theme-on-surface))",
    borderColor: "rgba(var(--v-theme-outline), 0.45)",
    shadow: "0 24px 50px rgba(var(--v-theme-shadow), 0.16)",
    hoverShadow: "0 34px 75px rgba(var(--v-theme-shadow), 0.22)",
  },
  outline: {
    background: "rgba(var(--v-theme-surface), 0.58)",
    color: "rgb(var(--v-theme-on-surface))",
    borderColor: "rgba(var(--v-theme-outline), 0.72)",
    borderStyle: "solid",
    shadow: "inset 0 1px 0 rgba(var(--v-theme-outline-variant), 0.9)",
    hoverShadow: "0 28px 55px rgba(var(--v-theme-shadow), 0.2)",
  },
  glass: {
    background: "rgba(var(--v-theme-surface), 0.18)",
    color: "rgb(var(--v-theme-on-surface))",
    borderColor: "rgba(var(--v-theme-outline), 0.35)",
    shadow: "0 35px 70px rgba(var(--v-theme-shadow), 0.24)",
    hoverShadow: "0 48px 95px rgba(var(--v-theme-shadow), 0.28)",
    backdropFilter: "blur(18px)",
    surfaceOverlay:
      "linear-gradient(135deg, rgba(var(--v-theme-surface-bright), 0.16), rgba(var(--v-theme-surface), 0.02))",
  },
  gradient: {
    background:
      "linear-gradient(135deg, rgba(var(--v-theme-primary), 0.28) 0%, rgba(var(--v-theme-surface-light), 0.85) 55%, rgba(var(--v-theme-surface), 0.98) 100%)",
    color: "rgb(var(--v-theme-on-primary))",
    borderColor: "rgba(var(--v-theme-primary), 0.35)",
    shadow: "0 38px 80px rgba(var(--v-theme-shadow), 0.32)",
    hoverShadow: "0 46px 105px rgba(var(--v-theme-shadow), 0.36)",
    bodyColor: "rgba(var(--v-theme-on-primary), 0.92)",
    footerColor: "rgba(var(--v-theme-on-primary), 0.85)",
  },
};

const paddingTokens: Record<CardPadding, string> = {
  none: "0",
  sm: "var(--ui-spacing-4)",
  md: "var(--ui-spacing-5)",
  lg: "var(--ui-spacing-6)",
};

const roundedTokens: Record<CardRounded, string> = {
  md: "var(--ui-radius-lg)",
  lg: "calc(var(--ui-radius-xl) + 0.25rem)",
  xl: "calc(var(--ui-radius-xl) + 0.75rem)",
};

const spacingTokens: Record<BodySpacing, { gap: string; fontSize: string; lineHeight: string }> = {
  sm: {
    gap: "var(--ui-spacing-3)",
    fontSize: "var(--v-text-body-2-size)",
    lineHeight: "var(--v-text-body-2-line-height, 1.6)",
  },
  md: {
    gap: "var(--ui-spacing-4)",
    fontSize: "var(--v-text-body-1-size)",
    lineHeight: "var(--v-text-body-1-line-height, 1.6)",
  },
  lg: {
    gap: "var(--ui-spacing-6)",
    fontSize: "var(--v-text-body-1-size)",
    lineHeight: "var(--v-text-body-1-line-height, 1.6)",
  },
};

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: CardVariant;
    padding?: CardPadding;
    rounded?: CardRounded;
    hoverable?: boolean;
    animation?: boolean;
    spacing?: BodySpacing;
    bodyClass?: string;
    headerClass?: string;
    footerClass?: string;
    mediaClass?: string;
    footerDivider?: boolean;
  }>(),
  {
    as: "article",
    variant: "solid",
    padding: "md",
    rounded: "xl",
    hoverable: false,
    animation: false,
    spacing: "md",
    bodyClass: "",
    headerClass: "",
    footerClass: "",
    mediaClass: "",
    footerDivider: true,
  },
);

const attrs = useAttrs();
const slots = useSlots();

const restAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    ...rest
  } = attrs as Record<string, unknown> & {
    class?: unknown;
    style?: unknown;
  };
  return rest;
});

const inlineStyle = computed(() => {
  const style = (attrs as Record<string, unknown> & { style?: unknown }).style;
  return style == null
    ? undefined
    : toValue(style as MaybeRefOrGetter<StyleValue | null | undefined>);
});

const cardStyle = computed(() => {
  const variant = variantTokens[props.variant];
  const spacing = spacingTokens[props.spacing];

  return {
    "--card-background": variant.background,
    "--card-color": variant.color,
    "--card-border-color": variant.borderColor ?? "transparent",
    "--card-border-style": variant.borderStyle ?? "solid",
    "--card-border-width": variant.borderWidth ?? "1px",
    "--card-shadow": variant.shadow ?? "none",
    "--card-hover-shadow": variant.hoverShadow ?? variant.shadow ?? "none",
    "--card-backdrop-filter": variant.backdropFilter ?? "none",
    "--card-surface-overlay": variant.surfaceOverlay ?? "transparent",
    "--card-padding": paddingTokens[props.padding],
    "--card-radius": roundedTokens[props.rounded],
    "--card-body-gap": spacing.gap,
    "--card-body-font-size": spacing.fontSize,
    "--card-body-line-height": spacing.lineHeight,
    "--card-body-color": variant.bodyColor ?? variant.color,
    "--card-footer-color": variant.footerColor ?? "rgba(var(--v-theme-on-surface), 0.74)",
    "--card-footer-border": props.footerDivider
      ? "1px solid rgba(var(--v-theme-outline-variant), 0.6)"
      : "0",
    "--card-footer-padding": props.footerDivider ? "var(--ui-spacing-4)" : "0",
  };
});

const styleBinding = computed(() => {
  const inline = inlineStyle.value;

  if (Array.isArray(inline)) {
    return [cardStyle.value, ...inline] as StyleValue;
  }

  if (inline) {
    return [cardStyle.value, inline] as StyleValue;
  }

  return cardStyle.value as StyleValue;
});

const cardClasses = computed(() =>
  cn("base-card", props.hoverable && "base-card--hoverable", attrs.class as unknown),
);

const mediaClasses = computed(() => cn("base-card__media", props.mediaClass));

const headerClasses = computed(() => cn("base-card__header", props.headerClass));

const bodyClasses = computed(() => cn("base-card__body", props.bodyClass));

const footerClasses = computed(() => cn("base-card__footer", props.footerClass));

const hasMedia = computed(() => Boolean(slots.media));
const hasHeader = computed(() => Boolean(slots.header));
const hasBody = computed(() => Boolean(slots.default));
const hasFooter = computed(() => Boolean(slots.footer));
</script>

<style scoped>
.base-card {
  --card-background: rgba(var(--v-theme-surface), 0.96);
  --card-color: rgb(var(--v-theme-on-surface));
  --card-border-color: rgba(var(--v-theme-outline-variant), 0.6);
  --card-border-style: solid;
  --card-border-width: 1px;
  --card-shadow: 0 28px 55px rgba(var(--v-theme-shadow), 0.18);
  --card-hover-shadow: var(--card-shadow);
  --card-padding: var(--ui-spacing-5);
  --card-radius: var(--ui-radius-xl);
  --card-content-gap: var(--ui-spacing-5);
  --card-body-gap: var(--ui-spacing-4);
  --card-body-font-size: var(--v-text-body-1-size);
  --card-body-line-height: var(--v-text-body-1-line-height, 1.6);
  --card-body-color: rgb(var(--v-theme-on-surface));
  --card-footer-color: rgba(var(--v-theme-on-surface), 0.74);
  --card-footer-border: 0;
  --card-footer-padding: 0;
  --card-backdrop-filter: none;
  --card-surface-overlay: transparent;

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  border-radius: var(--card-radius);
  background: var(--card-background);
  color: var(--card-color);
  border-width: var(--card-border-width);
  border-style: var(--card-border-style);
  border-color: var(--card-border-color);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    box-shadow 250ms ease,
    color 200ms ease,
    transform 250ms ease;
  backdrop-filter: var(--card-backdrop-filter);
}

.base-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--card-surface-overlay);
  pointer-events: none;
  z-index: 0;
}

.base-card:focus-visible {
  outline: var(--ui-focus);
  outline-offset: 2px;
}

.base-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--card-content-gap);
  padding: var(--card-padding);
}

.base-card--hoverable {
  cursor: pointer;
}

.base-card--hoverable {
  will-change: transform, box-shadow;
}

.base-card--hoverable:hover,
.base-card--hoverable:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--card-hover-shadow);
}

.base-card__media {
  overflow: hidden;
  border-radius: calc(var(--card-radius) - var(--ui-spacing-2));
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.4);
  background: rgba(var(--v-theme-surface), 0.12);
}

.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ui-spacing-4);
  text-align: start;
}

.base-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--card-body-gap);
  font-size: var(--card-body-font-size);
  line-height: var(--card-body-line-height);
  color: var(--card-body-color);
}

.base-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-spacing-3);
  font-size: var(--v-text-body-2-size);
  color: var(--card-footer-color);
  border-top: var(--card-footer-border);
  padding-top: var(--card-footer-padding);
  transition: color 200ms ease;
}
</style>
