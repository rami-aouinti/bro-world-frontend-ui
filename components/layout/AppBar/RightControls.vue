<template>
  <div class="flex items-center gap-3">
    <button type="button" :class="props.iconTriggerClasses" aria-label="Notifications">
      <AppIcon name="mdi:bell-outline" :size="32" />
    </button>
    <button type="button" :class="props.iconTriggerClasses" aria-label="Cart">
      <AppIcon name="mdi:shopping-outline" :size="32" />
    </button>

    <slot name="user" />
    <slot name="locale" />

    <ThemePopover />
    <DarkModeToggle />

    <button
        v-if="!props.isMobile && props.showRightToggle"
        type="button"
        :class="props.iconTriggerClasses"
        aria-label="Open widgets"
        @click="emit('toggle-right')"
    >
      <AppIcon name="mdi-format-align-justify" :size="22" />
    </button>
    <button
        v-if="props.isMobile && props.showRightToggle"
        type="button"
        :class="props.iconTriggerClasses"
        aria-label="Open widgets"
        @click="emit('toggle-right')"
    >
      <AppIcon name="mdi:dots-vertical" :size="22" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isMobile: boolean
  showRightToggle: boolean
  iconTriggerClasses: string
}>()
const emit = defineEmits(['toggle-right'])
</script>
