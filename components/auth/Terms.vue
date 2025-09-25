<template>
  <div class="space-y-4 text-body-2">
    <p>
      {{ t('register.termsIntro') }}
    </p>
    <ul class="ms-4 list-disc space-y-2">
      <li>{{ t('register.termsPoint1') }}</li>
      <li>{{ t('register.termsPoint2') }}</li>
      <li>{{ t('register.termsPoint3') }}</li>
    </ul>
    <p>
      {{ t('register.termsOutro') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
