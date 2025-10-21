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
          :class="['fi', `fi-${currentFlag}`]"
          class="block h-[18px] w-[24px] rounded-sm shadow-sm"
          aria-hidden="true"
        />
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
      :current="currentLocale"
      :format-label="props.formatLabel"
      :get-flag="getFlag"
      @select="emit('change', $event)"
    />
  </v-menu>
</template>

<script setup lang="ts">
import "./locale-flags.css";
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

function normalizeLocale(code?: string | null): string {
  const normalized = code?.trim();

  if (!normalized) {
    return "";
  }

  const [language = ""] = normalized.split(/[-_]/, 1);
  return language.toLowerCase();
}

const currentLocale = computed(() => normalizeLocale(props.current));
const currentFlag = computed(() => metadata.value[currentLocale.value]?.flag ?? "");

function getFlag(code: string): string {
  return metadata.value[normalizeLocale(code)]?.flag ?? "";
}
</script>
