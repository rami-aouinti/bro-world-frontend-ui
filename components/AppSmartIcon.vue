<template>
  <Icon
    v-if="iconName"
    :name="iconName"
    :size="iconSize"
    v-bind="attrs"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = withDefaults(
  defineProps<{
    name?: string
    size?: number | string
  }>(),
  {
    size: 16,
  },
)

const attrs = useAttrs()

const iconName = computed(() => props.name)
const iconSize = computed(() => props.size)
</script>
