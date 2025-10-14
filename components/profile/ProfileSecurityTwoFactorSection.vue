<template>
  <section :aria-labelledby="headingId">
    <div class="mb-3">
      <h2
        :id="headingId"
        class="text-h6 font-weight-semibold mb-1"
      >
        {{ t("pages.profileSecurity.sections.mfa.title") }}
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ t("pages.profileSecurity.sections.mfa.description") }}
      </p>
    </div>

    <v-switch
      v-model="enabledModel"
      :label="t('pages.profileSecurity.labels.mfaToggle')"
      color="primary"
      inset
    />

    <v-btn
      variant="text"
      class="mt-2"
      @click="handleGenerateCodes"
    >
      {{ t("pages.profileSecurity.actions.generateCodes") }}
    </v-btn>
  </section>
  <section aria-labelledby="password-hints-title">
    <div class="d-flex flex-column gap-3">
      <h2
          id="password-hints-title"
          class="text-h6 font-weight-semibold"
      >
        {{ t("pages.profileSecurity.passwordHint.title") }}
      </h2>
      <v-alert
          type="info"
          color="primary"
          variant="tonal"
          density="comfortable"
      >
        {{ t("pages.profileSecurity.passwordHint.description") }}
      </v-alert>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (event: "generate-codes"): void;
}>();

const enabledModel = defineModel<boolean>("enabled", {
  default: true,
});

const uniqueId = useId();
const headingId = `profile-security-mfa-${uniqueId}`;
const { t } = useI18n();

function handleGenerateCodes() {
  emit("generate-codes");
}
</script>
