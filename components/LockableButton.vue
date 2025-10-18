<template>
  <v-btn
    v-bind="forwardedAttrs"
    :loading="computedLoading"
    :disabled="computedDisabled"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

const props = withDefaults(
  defineProps<{
    locked?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    locked: false,
    loading: false,
    disabled: false,
  },
);

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { loading, disabled, ...rest } = attrs as Record<string, unknown>;
  return rest;
});

const computedLoading = computed(() => props.locked || props.loading);
const computedDisabled = computed(() => props.locked || props.disabled);
</script>
