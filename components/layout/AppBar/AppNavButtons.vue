<template>
  <div class="flex items-center gap-6">
    <button
      v-show="props.isMobile"
      type="button"
      :class="props.iconTriggerClasses"
      :aria-label="props.navigationLabel"
      @click="emit('toggle-left')"
    >
      <Icon
        name="mdi:menu"
        :size="24"
      />
    </button>

    <div
      :class="navGroupClasses"
    >
      <button
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.goBackLabel"
        @click="emit('go-back')"
      >
        <Icon
          name="mdi:arrow-left"
          :size="22"
        />
      </button>
      <button
        type="button"
        :class="[
          props.iconTriggerClasses,
          props.refreshing ? 'pointer-events-none opacity-60' : '',
        ]"
        :aria-label="props.refreshLabel"
        :aria-busy="props.refreshing"
        :disabled="props.refreshing"
        @click="emit('refresh')"
      >
        <Icon
          :name="props.refreshing ? 'mdi:loading' : 'mdi:refresh'"
          :size="22"
          :class="{ 'animate-spin': props.refreshing }"
        />
      </button>
      <button
        v-show="!props.isMobile"
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.navigationLabel"
        @click="emit('toggle-left')"
      >
        <AppIcon
          name="mdi-format-align-justify"
          :size="22"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    isMobile: boolean;
    iconTriggerClasses: string;
    navigationLabel: string;
    goBackLabel: string;
    refreshLabel: string;
    refreshing?: boolean;
  }>(),
  {
    refreshing: false,
  },
);
const emit = defineEmits(["toggle-left", "go-back", "refresh"]);

const isHydrated = ref(false);

if (import.meta.client) {
  onMounted(() => {
    isHydrated.value = true;
  });
}

const navGroupClasses = computed(() => {
  if (!isHydrated.value) {
    return props.isMobile
      ? "flex items-center gap-3 px-4"
      : "flex items-center gap-12 px-16";
  }

  return "flex items-center gap-12 px-4 sm:gap-4 sm:px-6 md:gap-6 md:px-8";
});
</script>
