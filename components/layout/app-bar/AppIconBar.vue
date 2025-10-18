<template>
  <div :class="iconBarClasses">
    <template v-if="isHydrated">
      <v-tooltip
        v-for="icon in props.appIcons"
        :key="`tooltip-${icon.label}`"
        :text="t(icon.label)"
        :aria-label="t(icon.label)"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            :aria-label="t(icon.label)"
            :class="props.iconTriggerClasses"
            :theme="props.isDark ? 'dark' : 'light'"
            :to="resolveIconTarget(icon)"
          >
            <AppIcon
              :name="icon.name"
              :size="resolveIconSize(icon)"
            />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <template v-else>
      <v-btn
        v-for="icon in props.appIcons"
        :key="`button-${icon.label}`"
        :aria-label="t(icon.label)"
        :title="t(icon.label)"
        :class="props.iconTriggerClasses"
        :theme="props.isDark ? 'dark' : 'light'"
        :ripple="false"
        :to="resolveIconTarget(icon)"
      >
        <AppIcon
          :name="icon.name"
          :size="resolveIconSize(icon)"
        />
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

const props = defineProps<{
  appIcons: { name: string; label: string; size?: number; to?: string }[];
  iconTriggerClasses: string;
  isDark: boolean;
}>();

const { t } = useI18n();
const resolveLocalePath = useResolvedLocalePath();

const isHydrated = ref(false);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

function resolveIconTarget(icon: { to?: string }) {
  if (!icon.to) {
    return undefined;
  }

  return resolveLocalePath(icon.to);
}

function resolveIconSize(icon: { size?: number }) {
  return icon.size ?? 26;
}

const iconBarClasses = computed(() => [
  "app-icon-bar flex items-center justify-center gap-3",
  isHydrated.value ? "px-4 sm:px-6 md:px-8" : "px-8",
]);
</script>
