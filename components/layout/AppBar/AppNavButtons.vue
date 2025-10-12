<template>
  <div class="flex items-center gap-3">
    <button
      v-show="props.isMobile"
      type="button"
      :class="props.iconTriggerClasses"
      :aria-label="props.navigationLabel"
      @click="emit('toggle-left')"
    >
      <AppIcon
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
        <AppIcon
          name="mdi:arrow-left"
          :size="22"
        />
      </button>
      <button
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.refreshLabel"
        @click="emit('refresh')"
      >
        <AppIcon
          name="mdi:refresh"
          :size="22"
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
const props = defineProps<{
  isMobile: boolean;
  iconTriggerClasses: string;
  navigationLabel: string;
  goBackLabel: string;
  refreshLabel: string;
}>();
const emit = defineEmits(["toggle-left", "go-back", "refresh"]);
</script>
