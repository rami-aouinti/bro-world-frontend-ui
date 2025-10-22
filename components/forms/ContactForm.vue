<template>
  <section aria-labelledby="contact-form-heading">
    <v-form
      ref="formRef"
      aria-describedby="contact-status"
      role="form"
      @submit.prevent="handleSubmit"
    >
      <div>
        <v-text-field
          id="contact-name"
          v-model="form.name"
          :label="t('pages.contact.form.name')"
          :error="Boolean(errors.name)"
          :error-messages="nameErrorMessages"
          :aria-describedby="errors.name ? 'name-error' : undefined"
          :aria-invalid="errors.name ? 'true' : 'false'"
          data-test="name-field"
          variant="outlined"
          density="compact"
          name="name"
          autocomplete="name"
          required
        />
        <p
          v-if="errors.name"
          :id="'name-error'"
          class="sr-only"
          aria-live="assertive"
          data-test="name-error"
        >
          {{ validationMessage(errors.name) }}
        </p>
      </div>

      <div>
        <v-text-field
          id="contact-email"
          v-model="form.email"
          :label="t('pages.contact.form.email')"
          :error="Boolean(errors.email)"
          :error-messages="emailErrorMessages"
          :aria-describedby="errors.email ? 'email-error' : undefined"
          :aria-invalid="errors.email ? 'true' : 'false'"
          data-test="email-field"
          variant="outlined"
          density="compact"
          name="email"
          type="email"
          autocomplete="email"
          inputmode="email"
          required
        />
        <p
          v-if="errors.email"
          :id="'email-error'"
          class="sr-only"
          aria-live="assertive"
          data-test="email-error"
        >
          {{ validationMessage(errors.email) }}
        </p>
      </div>

      <div>
        <v-text-field
          id="contact-subject"
          v-model="form.subject"
          :label="t('pages.contact.form.subject')"
          :error="Boolean(errors.subject)"
          :error-messages="subjectErrorMessages"
          :aria-describedby="errors.subject ? 'subject-error' : undefined"
          :aria-invalid="errors.subject ? 'true' : 'false'"
          data-test="subject-field"
          name="subject"
          variant="outlined"
          density="compact"
          autocomplete="on"
          required
        />
        <p
          v-if="errors.subject"
          :id="'subject-error'"
          class="sr-only"
          aria-live="assertive"
          data-test="subject-error"
        >
          {{ validationMessage(errors.subject) }}
        </p>
      </div>

      <div>
        <v-textarea
          id="contact-message"
          v-model="form.message"
          :label="t('pages.contact.form.message')"
          :error="Boolean(errors.message)"
          :error-messages="messageErrorMessages"
          :aria-describedby="errors.message ? 'message-error' : undefined"
          :aria-invalid="errors.message ? 'true' : 'false'"
          auto-grow
          variant="outlined"
          density="compact"
          rows="2"
          counter="2000"
          data-test="message-field"
          name="message"
          required
        />
        <p
          v-if="errors.message"
          :id="'message-error'"
          class="sr-only"
          aria-live="assertive"
          data-test="message-error"
        >
          {{ validationMessage(errors.message) }}
        </p>
      </div>

      <label
        class="sr-only"
        for="contact-check-field"
      >
        {{ t("pages.contact.form.name") }}
      </label>
      <input
        id="contact-check-field"
        v-model="form.honeypot"
        name="website"
        type="text"
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        autocomplete="off"
      />

      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        class="contact-form__submit"
        data-test="submit-button"
      >
        {{ isSubmitting ? t("pages.contact.form.sending") : t("pages.contact.form.submit") }}
      </v-btn>
    </v-form>

    <p
      id="contact-status"
      class="sr-only"
      role="status"
      aria-live="polite"
      data-test="status-message"
    >
      {{ statusMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNuxtApp } from "#app";

import type { ContactValidationErrors, ContactValidationKey } from "~/lib/contact/validation";
import { validateContactForm } from "~/lib/contact/validation";

const props = defineProps<{ showHeading?: boolean }>();

const showHeading = computed(() => props.showHeading ?? true);

const { t, locale } = useI18n();
const { $fetch, $notify } = useNuxtApp();

const formRef = ref();
const isSubmitting = ref(false);
const statusMessage = ref("");

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
  honeypot: "",
});

const errors = reactive<ContactValidationErrors>({
  name: null,
  email: null,
  subject: null,
  message: null,
});

function validationMessage(key: ContactValidationKey) {
  return t(`pages.contact.validation.${key}`);
}

const nameErrorMessages = computed(() => (errors.name ? [validationMessage(errors.name)] : []));
const emailErrorMessages = computed(() => (errors.email ? [validationMessage(errors.email)] : []));
const subjectErrorMessages = computed(() =>
  errors.subject ? [validationMessage(errors.subject)] : [],
);
const messageErrorMessages = computed(() =>
  errors.message ? [validationMessage(errors.message)] : [],
);

watch(
  form,
  () => {
    if (Object.values(errors).some(Boolean)) {
      const { errors: freshErrors } = validateContactForm(form);
      Object.assign(errors, freshErrors);
    }
  },
  { deep: true },
);

function focusFirstInvalidField() {
  if (!import.meta.client) return;

  const fieldOrder: Array<keyof ContactValidationErrors> = ["name", "email", "subject", "message"];

  for (const field of fieldOrder) {
    if (!errors[field]) continue;

    const element = document.getElementById(`contact-${field}`);
    if (element) {
      element.focus();
      break;
    }
  }
}

async function handleSubmit() {
  if (form.honeypot.trim().length > 0) return;

  const { valid, errors: freshErrors } = validateContactForm(form);
  Object.assign(errors, freshErrors);

  if (!valid) {
    statusMessage.value = t("pages.contact.validation.required");
    focusFirstInvalidField();
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = t("pages.contact.form.sending");

  try {
    await $fetch("/v1/contact", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        locale: locale.value,
      },
    });

    $notify({
      type: "success",
      title: t("pages.contact.title"),
      message: t("pages.contact.form.success"),
    });

    statusMessage.value = t("pages.contact.form.success");

    Object.assign(form, {
      name: "",
      email: "",
      subject: "",
      message: "",
      honeypot: "",
    });
    Object.assign(errors, {
      name: null,
      email: null,
      subject: null,
      message: null,
    });
    formRef.value?.resetValidation?.();
  } catch (exception: unknown) {
    $notify({
      type: "error",
      title: t("pages.contact.title"),
      message: t("pages.contact.form.error"),
      timeout: null,
    });
    statusMessage.value = t("pages.contact.form.error");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.contact-form__header p {
  max-width: 420px;
}

.contact-form__grid {
  display: grid;
  gap: 18px;
}

.contact-form__submit {
  align-self: flex-start;
  min-width: 160px;
}

@media (max-width: 600px) {
  .contact-form__submit {
    width: 100%;
  }
}
</style>
