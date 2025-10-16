<template>
  <div :class="iconBarClasses">
    <template v-if="isHydrated">
      <v-tooltip
        v-for="icon in props.appIcons"
        :key="icon.label"
        :text="t(icon.label)"
        :aria-label="t(icon.label)"
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
    </template>
    <template v-else>
      <v-btn
        v-for="icon in props.appIcons"
        :key="icon.label"
        :aria-label="t(icon.label)"
        :title="t(icon.label)"
        :class="props.iconTriggerClasses"
        :theme="props.isDark ? 'dark' : 'light'"
        :ripple="false"
      >
        <AppIcon
          :name="icon.name"
          :size="26"
        />
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  appIcons: { name: string; label: string }[];
  iconTriggerClasses: string;
  isDark: boolean;
}>();

const { t } = useI18n();

const isHydrated = ref(false);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

const iconBarClasses = computed(() => [
  "app-icon-bar flex flex-1 items-center justify-center gap-3",
  isHydrated.value ? "px-4 sm:px-6 md:px-8" : "px-8",
]);
</script>
