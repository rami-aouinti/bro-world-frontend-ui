<template>
  <v-menu
    location="bottom end"
    transition="scale-transition"
    :offset="8"
  >
    <template #activator="{ props: languageProps }">
      <button
        type="button"
        :class="iconTriggerClasses"
        :aria-label="props.buttonLabel"
        v-bind="languageProps"
      >
        <span
          v-if="currentFlag"
          class="block h-[18px] w-[24px] text-lg leading-none"
          aria-hidden="true"
        >
          {{ currentFlag }}
        </span>
        <AppIcon
          v-else
          name="mdi:flag-outline"
          :size="22"
        />
      </button>
    </template>
    <LocaleMenuContent
      :title="props.title"
      :subtitle="props.subtitle"
      :locales="props.locales"
      :current="props.current"
      :format-label="props.formatLabel"
      :get-flag="getFlag"
      @select="emit('change', $event)"
    />
  </v-menu>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const LocaleMenuContent = defineAsyncComponent({
  loader: () => import("./LocaleMenuContent.vue"),
  suspensible: false,
});

type LocaleMetadata = Record<string, { flag?: string }>;

const props = defineProps<{
  locales: string[];
  current: string;
  iconTriggerClasses: string;
  formatLabel: (l: string) => string;
  title: string;
  subtitle?: string;
  localeMetadata?: LocaleMetadata;
  buttonLabel: string;
}>();
const emit = defineEmits(["change"]);

const metadata = computed<LocaleMetadata>(() => props.localeMetadata ?? {});
const currentFlag = computed(() => metadata.value[props.current]?.flag ?? "");

function getFlag(code: string): string {
  return metadata.value[code]?.flag ?? "";
}
</script>
