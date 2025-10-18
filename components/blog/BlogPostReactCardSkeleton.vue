<template>
  <div
    class="flex flex-col gap-3"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadingLabel = computed(() => t("common.loading"));
</script>
