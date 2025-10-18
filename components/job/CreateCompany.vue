<template>
  <v-form @submit.prevent="submitCompany">
    <v-text-field
      v-model="form.name"
      :label="t('company.name')"
      density="compact"
      rounded="xl"
      class="mb-3"
    />
    <v-textarea
      v-model="form.description"
      :label="t('company.description')"
      density="compact"
      rounded="xl"
      class="mb-3"
      auto-grow
    />
    <v-text-field
      v-model="form.website"
      :label="t('company.website')"
      density="compact"
      rounded="xl"
      class="mb-3"
    />
    <v-btn
      color="primary"
      type="submit"
    >
      {{ t("company.submit") }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";

type Emits = {
  (e: "company-created"): void;
};

const emit = defineEmits<Emits>();
const { t } = useI18n();
const { $notify: notify, $fetch } = useNuxtApp();

const form = ref({
  name: "",
  description: "",
  website: "",
});

async function submitCompany() {
  try {
    await $fetch("/api/job/company", {
      method: "POST",
      body: form.value,
    });
  } catch (error) {
    console.error(error);
    notify.error(t("company.createError"));
    return;
  }

  notify.success(t("company.createSuccess"));
  emit("company-created");
  form.value = {
    name: "",
    description: "",
    website: "",
  };
}
</script>
