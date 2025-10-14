<template>
  <div class="flex items-center gap-3">
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

    <div class="flex items-center gap-8 px-16">
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
</script>
