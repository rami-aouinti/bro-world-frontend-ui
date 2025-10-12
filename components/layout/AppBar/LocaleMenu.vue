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
    <SidebarCard
      padding="none"
      class="min-w-[220px] overflow-hidden text-card-foreground px-3 py-2 shadow-xl"
    >
      <!-- glows -->
      <span
        class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      ></span>
      <span
        class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
      ></span>
      <div class="relative z-10 flex flex-col">
        <div class="rounded-2xl px-4 py-3">
          <p class="text-sm font-semibold leading-tight">
            {{ props.title }}
          </p>
          <p
            v-if="props.subtitle"
            class="text-xs text-muted-foreground"
          >
            {{ props.subtitle }}
          </p>
        </div>
        <v-divider />
        <v-list
          class="py-0"
          density="compact"
        >
          <v-list-item
            v-for="l in props.locales"
            :key="l"
            :title="props.formatLabel(l)"
            :class="[
              'px-4',
              l === props.current ? 'bg-primary/5 text-primary dark:bg-primary/15' : '',
            ]"
            role="menuitemradio"
            :aria-checked="l === props.current"
            @click="emit('change', l)"
          >
            <template #prepend>
              <span
                v-if="getFlag(l)"
                :class="['fi', `fi-${getFlag(l)}`]"
                class="mr-3 block h-[16px] w-[22px] rounded-sm shadow-sm"
                aria-hidden="true"
              />
            </template>
            <template #append>
              <AppIcon
                v-if="l === props.current"
                name="mdi:check"
                :size="18"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>
    </SidebarCard>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

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
