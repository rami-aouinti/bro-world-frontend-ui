<template>
  <div :class="iconBarClasses">
    <ClientOnly>
      <template #fallback>
        <v-btn
          v-for="icon in props.appIcons"
          :key="`button-${icon.label}`"
          :aria-label="t(icon.label)"
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
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

type ClassBinding = string | string[] | Record<string, boolean>;

const props = defineProps<{
  appIcons: { name: string; label: string; size?: number; to?: string }[];
  iconTriggerClasses: string;
  isDark: boolean;
  wrapperClasses?: ClassBinding;
}>();

const { t } = useI18n();
const resolveLocalePath = useResolvedLocalePath();

const isHydrated = ref(false);

onMounted(() => {
  isHydrated.value = true;
});

function resolveIconTarget(icon: { to?: string }) {
  if (!icon.to) {
    return undefined;
  }

  return resolveLocalePath(icon.to);
}

function resolveIconSize(icon: { size?: number }) {
  return icon.size ?? 26;
}

const iconBarClasses = computed(() => {
  const classes: (string | Record<string, boolean>)[] = [];

  const wrapper = props.wrapperClasses;

  if (Array.isArray(wrapper)) {
    for (const value of wrapper) {
      if (!value) continue;
      classes.push(value);
    }
  } else if (wrapper) {
    classes.push(wrapper);
  }

  classes.push("app-icon-bar flex items-center justify-center gap-3 px-4 sm:px-6 md:px-8");

  return classes;
});
</script>
