<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ t(titleKey ?? "media.rename.title") }}</VCardTitle>
      <VCardText>
        <VTextField
          v-model="name"
          :label="t('media.rename.nameLabel')"
          :placeholder="t('media.rename.namePlaceholder')"
          :disabled="loading"
          autofocus
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
          :disabled="!name.trim()"
          @click="save"
        >
          {{ t("media.rename.save") }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: boolean;
  value: string;
  loading?: boolean;
  titleKey?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "save", value: string): void;
}>();

const { t } = useI18n();
const name = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = props.value;
    }
  },
);

function close() {
  emit("update:modelValue", false);
}

function save() {
  emit("save", name.value.trim());
}
</script>
