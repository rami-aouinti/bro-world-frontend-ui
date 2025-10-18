<template>
  <v-container v-if="certificate" class="py-10">
    <v-breadcrumbs :items="breadcrumbs" class="mb-6" />
    <CertificateSheet :certificate="certificate" />
  </v-container>
  <v-container v-else class="py-10 d-flex justify-center">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import CertificateSheet from "~/components/education/CertificateSheet.vue";
import { useEducationStore } from "~/stores/education";
import type { Certificate } from "~/types/education";

const { t } = useI18n();
const route = useRoute();
const store = useEducationStore();

const localePath = useLocalePath();

const id = computed(() => String(route.params.id));
const certificate = ref<Certificate | null>(
  store.certificates.value.find((entry) => entry.id === id.value) ?? null,
);

if (!certificate.value) {
  const data = await $fetch<Certificate>(`/api/education/certificates/${id.value}`);
  certificate.value = data;
  store.addCertificate(data);
}

const breadcrumbs = computed(() => [
  { title: t("education.breadcrumb.home"), to: localePath("/education") },
  { title: t("education.certificate.breadcrumb"), disabled: true },
]);

definePageMeta({
  alias: ["/academy/certificate/:id"],
});
</script>
