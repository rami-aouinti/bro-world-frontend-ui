<template>
  <v-menu location="bottom end">
    <template #activator="{ props: profileProps }">
      <button type="button" :class="iconTriggerClasses" aria-label="Profile" v-bind="profileProps">
        <AppIcon name="mdi:person-outline" :size="22" />
      </button>
    </template>
    <v-list density="compact">
      <v-list-item
          v-for="item in props.items"
          :key="item.title"
          :title="item.title"
          :disabled="item.action === 'logout' && props.loggingOut"
          @click="emit('select', item)"
      >
        <template #prepend>
          <AppIcon :name="item.icon" :size="20" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { title: string; icon: string; to?: string; action?: 'logout' }[]
  iconTriggerClasses: string
  loggingOut: boolean
}>()
const emit = defineEmits(['select'])
</script>
