<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ t("media.move.title") }}</VCardTitle>
      <VCardText>
        <VSelect
          v-model="destination"
          :items="options"
          item-title="label"
          item-value="id"
          :label="t('media.move.destinationLabel')"
          :disabled="loading"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="close"
          >{{ t("common.close") }}</VBtn
        >
        <VBtn
          color="primary"
          :loading="loading"
          :disabled="destination === null"
          @click="confirm"
        >
          {{ t("media.move.confirm") }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export interface MoveOption {
  id: string | null;
  label: string;
  disabled?: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  options: MoveOption[];
  loading?: boolean;
  currentFolderId: string | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "confirm", destination: string | null): void;
}>();

const { t } = useI18n();
const destination = ref<string | null>(null);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      destination.value = props.currentFolderId;
    }
  },
);

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm", destination.value);
}
</script>
