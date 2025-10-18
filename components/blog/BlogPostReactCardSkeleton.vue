<template>
  <div
    class="flex flex-col gap-3"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex min-w-[96px] items-center gap-3">
        <div class="relative h-[26px] w-[60px]">
          <v-skeleton-loader
            v-for="index in 3"
            :key="`bubble-${index}`"
            type="avatar"
            class="absolute top-0 h-[26px] w-[26px] rounded-full ring-1 ring-black/5"
            :style="{ left: `${(index - 1) * 16}px`, zIndex: 4 - index }"
          />
        </div>
        <v-skeleton-loader
          type="text"
          width="48"
          height="16"
          class="rounded"
        />
      </div>
      <div class="flex min-w-[80px] items-center justify-end gap-2">
        <v-skeleton-loader
          v-for="index in 2"
          :key="`metric-${index}`"
          type="chip"
          width="64"
          height="20"
        />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <v-skeleton-loader
        type="avatar"
        width="44"
        height="44"
        class="rounded-full"
      />
      <v-skeleton-loader
        v-for="index in 2"
        :key="`action-${index}`"
        type="button"
        width="128"
        height="40"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>

