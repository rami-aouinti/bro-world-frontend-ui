<template>
  <div class="px-16">
    <v-tooltip
      v-for="icon in props.appIcons"
      :key="icon.label"
      :text="t(icon.label)"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          :aria-label="t(icon.label)"
          :class="props.iconTriggerClasses"
          :theme="props.isDark ? 'dark' : 'light'"
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
import { useI18n } from "vue-i18n";

const props = defineProps<{
  appIcons: { name: string; label: string }[];
  iconTriggerClasses: string;
  isDark: boolean;
}>();

const { t } = useI18n();
</script>
