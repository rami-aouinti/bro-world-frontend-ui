<template>
  <v-row
    class="mb-4"
    justify="center"
  >
    <v-col
      cols="12"
      md="6"
      class="text-center"
    >
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-plus"
        rounded
        variant="outlined"
        @click="emit('create-job')"
      >
        {{ t("job.job") }}
      </v-btn>
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="text-center"
    >
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-account-plus"
        rounded
        variant="outlined"
        @click="emit('create-applicant')"
      >
        {{ t("applicant.applicant") }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

type Emits = {
  (e: "create-job"): void;
  (e: "create-applicant"): void;
};

const emit = defineEmits<Emits>();
const { t } = useI18n();
</script>
