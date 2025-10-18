<template>
  <section class="certificate-wrapper">
    <div
      ref="certificateRef"
      class="certificate-sheet"
    >
      <header class="text-center mb-6">
        <h1 class="text-h4 text-uppercase mb-2">{{ t("education.certificate.title") }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ t("education.certificate.subtitle") }}
        </p>
      </header>

      <div class="certificate-body">
        <p class="text-body-1 mb-2">
          {{ t("education.certificate.presentedTo") }}
        </p>
        <p class="text-h4 font-weight-bold mb-4">
          {{ certificate.userName }}
        </p>
        <p class="text-body-1 mb-2">
          {{ t("education.certificate.completed", { course: certificate.courseTitle }) }}
        </p>
        <p class="text-body-1 mb-6">
          {{ t("education.certificate.score", { value: certificate.score }) }}
        </p>
        <p class="text-body-2 text-medium-emphasis">
          {{ t("education.certificate.date", { value: formattedDate }) }}
        </p>
        <p class="text-body-2 text-medium-emphasis">ID — {{ certificate.id }}</p>
      </div>

      <footer class="certificate-footer mt-8">
        <div class="signature">
          <span class="text-body-2 text-medium-emphasis">{{
            t("education.certificate.signature")
          }}</span>
          <div class="signature-line" />
          <span class="text-caption">{{ t("education.certificate.signatureName") }}</span>
        </div>
        <div class="stamp">
          <span class="text-body-2 text-medium-emphasis">{{
            t("education.certificate.organization")
          }}</span>
          <span class="text-caption">{{ t("education.certificate.organizationTagline") }}</span>
        </div>
      </footer>
    </div>

    <div class="mt-6 d-flex justify-end">
      <v-btn
        color="primary"
        size="large"
        @click="downloadCertificate"
      >
        <v-icon
          icon="mdi:download"
          start
        />
        {{ t("education.certificate.download") }}
      </v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Certificate } from "~/types/education";
import { useHtml2Pdf } from "~/plugins/html2pdf.client";

const props = defineProps<{ certificate: Certificate }>();

const { t, locale } = useI18n();
const { download } = useHtml2Pdf();

const certificateRef = ref<HTMLElement | null>(null);

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: "long" }).format(
    new Date(props.certificate.dateIso),
  ),
);

async function downloadCertificate() {
  await download(certificateRef.value, `certificate-${props.certificate.id}.pdf`, {
    filename: `certificate-${props.certificate.id}.pdf`,
    margin: [20, 20, 20, 20],
  });
}
</script>

<style scoped>
.certificate-wrapper {
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 45%),
    radial-gradient(circle at bottom right, rgba(129, 140, 248, 0.12), transparent 40%);
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: 24px;
}

.certificate-sheet {
  background: white;
  padding: clamp(2rem, 4vw, 3rem);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.15);
  border: 2px solid rgba(59, 130, 246, 0.2);
  max-width: 720px;
  margin-inline: auto;
  color: #0f172a;
}

.certificate-body {
  text-align: center;
}

.certificate-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
}

.signature-line {
  width: 160px;
  height: 2px;
  background: rgba(15, 23, 42, 0.3);
  margin-block: 0.75rem;
}

.signature,
.stamp {
  text-align: center;
}

@media (max-width: 600px) {
  .certificate-footer {
    flex-direction: column;
    align-items: center;
  }
}
</style>
