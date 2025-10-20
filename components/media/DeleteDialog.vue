<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ t(titleKey ?? "media.delete.title") }}</VCardTitle>
      <VCardText>
        <p>{{ t(descriptionKey ?? "media.delete.description") }}</p>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="close"
          >{{ t("common.close") }}</VBtn
        >
        <VBtn
          color="error"
          :loading="loading"
          @click="confirm"
        >
          {{ t("media.delete.confirm") }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  titleKey?: string;
  descriptionKey?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "confirm"): void;
}>();

const { t } = useI18n();

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm");
}
</script>
