<template>
  <div class="px-16">
    <v-tooltip
      v-for="icon in props.appIcons"
      :key="icon.label"
      :text="props.t(icon.label)"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          :aria-label="props.t(icon.label)"
        >
          <AppIcon
            :name="icon.name"
            :size="26"
          />
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  appIcons: { name: string; label: string }[];
  iconTriggerClasses: string;
  t: (k: string) => string;
}>();
</script>
