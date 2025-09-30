<template>
  <v-menu location="bottom end">
    <template #activator="{ props: languageProps }">
      <button type="button" :class="iconTriggerClasses" :aria-label="`Language: ${props.formatLabel(props.current)}`" v-bind="languageProps">
        <AppIcon name="mdi:flag-outline" :size="22" />
      </button>
    </template>
    <v-list density="compact">
      <v-list-item
          v-for="l in props.locales"
          :key="l"
          :active="l === props.current"
          :title="props.formatLabel(l)"
          role="menuitemradio"
          :aria-checked="l === props.current"
          @click="emit('change', l)"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
const props = defineProps<{
  locales: string[]
  current: string
  iconTriggerClasses: string
  formatLabel: (l:string)=>string
}>()
const emit = defineEmits(['change'])
</script>
