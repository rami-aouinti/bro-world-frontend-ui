<template>
  <v-btn
    :class="classes"
    :variant="variant"
    :block="block"
    :loading="loading"
    :disabled="isDisabled"
    :type="type"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <template
      v-if="hasIcon"
      #prepend
    >
      <slot name="icon">
        <v-icon
          :icon="icon"
          size="18"
        />
      </slot>
    </template>

    <template
      v-if="loading"
      #loader
    >
      <v-progress-circular
        indeterminate
        size="18"
        width="2"
      />
    </template>

    <slot />

    <template
      v-if="hasTrailing"
      #append
    >
      <slot name="trailing">
        <v-icon
          :icon="trailingIcon"
          size="18"
        />
      </slot>
    </template>
  </v-btn>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

type ButtonVariant = "filled" | "tonal" | "outline" | "text" | "plain";
type ButtonSize = "sm" | "md" | "lg";

const props = defineProps({
  variant: {
    type: String as () => ButtonVariant,
    default: "filled",
  },
  size: {
    type: String as () => ButtonSize,
    default: "md",
  },
  block: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as () => "button" | "submit" | "reset",
    default: "button",
  },
  icon: {
    type: String,
    default: undefined,
  },
  trailingIcon: {
    type: String,
    default: undefined,
  },
  ariaLabel: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits<{
  click: [MouseEvent];
}>();

const slots = useSlots();

const hasIcon = computed(() => Boolean(props.icon || slots.icon));
const hasTrailing = computed(() => Boolean(props.trailingIcon || slots.trailing));

const isDisabled = computed(() => props.disabled || props.loading);
const classes = computed(() => [
  "ui-button",
  `ui-button--${props.size}`,
  {
    "ui-button--loading": props.loading,
    "ui-button--block": props.block,
  },
]);

function onClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit("click", event);
}
</script>

<style scoped>
.ui-button {
  text-transform: none;
  font-weight: 600;
  border-radius: var(--ui-radius);
}

.ui-button--sm {
  --v-btn-height: var(--ui-spacing-6);
  font-size: 0.8125rem;
  padding-inline: var(--ui-spacing-3);
}

.ui-button--md {
  --v-btn-height: var(--ui-spacing-7);
  font-size: 0.875rem;
  padding-inline: var(--ui-spacing-4);
}

.ui-button--lg {
  --v-btn-height: var(--ui-spacing-8);
  font-size: 1rem;
  padding-inline: var(--ui-spacing-5);
}

.ui-button--block {
  width: 100%;
}

.ui-button:focus-visible {
  box-shadow: var(--ui-focus);
}
</style>
