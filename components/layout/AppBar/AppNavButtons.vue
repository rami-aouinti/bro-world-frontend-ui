<template>
  <div class="flex items-center gap-3">
    <v-btn v-if="props.isMobile" type="button" :class="props.iconTriggerClasses" @click="emit('toggle-left')">
      <AppIcon name="mdi:menu" :size="24" />
    </v-btn>

    <div class="flex items-center gap-8 px-16">
      <button type="button" :class="props.iconTriggerClasses" @click="emit('go-back')">
        <AppIcon name="mdi:arrow-left" :size="22" />
      </button>
      <button type="button" :class="props.iconTriggerClasses" @click="emit('refresh')">
        <AppIcon name="mdi:refresh" :size="22" />
      </button>
      <button v-if="!props.isMobile" type="button" :class="props.iconTriggerClasses" @click="emit('toggle-left')">
        <AppIcon name="mdi-format-align-justify" :size="22" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isMobile: boolean
  iconTriggerClasses: string
}>()
const emit = defineEmits(['toggle-left','go-back','refresh'])
</script>
