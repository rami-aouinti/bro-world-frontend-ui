<template>
  <form
    class="text-foreground"
    :class="formClasses"
    data-lpignore="true"
    data-lastpass-ignore="true"
    @submit.prevent="handleSubmit"
  >
    <div class="login-form__inner">
      <v-alert
        v-if="sessionMessage"
        type="warning"
        variant="tonal"
        density="comfortable"
        border="start"
        class="login-form__alert"
        closable
        prominent
        role="status"
        @click:close="dismissSessionMessage"
      >
        {{ sessionMessage }}
      </v-alert>

      <div :class="fieldContainerClasses">
        <input
          v-model="username"
          class="login-field__input text-foreground"
          :class="fieldAlignment"
          type="text"
          :placeholder="t('auth.usernameOrEmail')"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          required
          :disabled="isDisabled"
          :aria-invalid="Boolean(formError)"
          :aria-describedby="formError ? formErrorId : undefined"
          data-lpignore="true"
          data-lastpass-ignore="true"
          @input="handleFieldInput"
        />
      </div>

      <div :class="fieldContainerClasses">
        <input
          v-model="password"
          class="login-field__input text-foreground"
          :class="fieldAlignment"
          :type="passwordInputType"
          :placeholder="t('auth.password')"
          autocomplete="current-password"
          required
          :disabled="isDisabled"
          :aria-invalid="Boolean(formError)"
          :aria-describedby="formError ? formErrorId : undefined"
          data-lpignore="true"
          data-lastpass-ignore="true"
          @input="handleFieldInput"
        />

        <button
          type="button"
          class="login-field__action"
          :disabled="isDisabled"
          :aria-label="passwordToggleAriaLabel"
          :aria-pressed="showPassword"
          @click="togglePassword"
        >
          <span
            aria-hidden="true"
            class="login-field__action-icon mdi"
            :class="passwordToggleIcon"
          ></span>
          <span class="sr-only">{{ passwordToggleAriaLabel }}</span>
        </button>
      </div>

      <p
        v-if="formError"
        :id="formErrorId"
        class="login-form__error"
        role="alert"
        aria-live="polite"
      >
        {{ formError }}
      </p>

      <div
        class="login-form__links"
        :class="isRtl ? 'text-start' : 'text-end'"
      >
        <NuxtLink
          :to="localePath('/forgot-password')"
          class="login-form__forgot"
        >
          {{ t("auth.forgotPassword") }}
        </NuxtLink>
      </div>

      <button
        type="submit"
        class="login-form__submit"
        :disabled="isDisabled"
      >
        <v-progress-circular
          v-if="isSubmitting"
          indeterminate
          size="20"
        />
        <span v-else>{{ t("auth.signIn") }}</span>
      </button>

      <p
        class="login-form__signup"
        :class="fieldAlignment"
      >
        {{ t("auth.signUpPrompt") }}
        <NuxtLink
          :to="localePath('/register')"
          class="login-form__signup-link"
          :class="fieldAlignment"
        >
          {{ t("auth.signUp") }}
        </NuxtLink>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useAuthSession } from "~/stores/auth-session";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "compact";
    disabled?: boolean;
  }>(),
  {
    variant: "default",
    disabled: false,
  },
);

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useResolvedLocalePath();
const { $notify } = useNuxtApp();
const auth = useAuthSession();

const isRtl = computed(() => ["ar", "he", "fa", "ur"].includes(locale.value));
const fieldAlignment = computed(() => (isRtl.value ? "text-end" : "text-start"));
const isCompact = computed(() => props.variant === "compact");
const isSubmitting = computed(() => auth.isLoggingIn.value);
const isDisabled = computed(() => props.disabled || isSubmitting.value);
const formClasses = computed(() => ["login-form", { "login-form--compact": isCompact.value }]);
const fieldContainerClasses = computed(() => [
  "login-field",
  { "login-field--compact": isCompact.value },
]);

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const formError = ref("");
const uniqueId = useId();
const formErrorId = `login-form-error-${uniqueId}`;

const showPasswordLabel = computed(() => t("auth.showPassword"));
const hidePasswordLabel = computed(() => t("auth.hidePassword"));
const passwordInputType = computed(() => (showPassword.value ? "text" : "password"));
const passwordToggleIcon = computed(() => (showPassword.value ? "mdi-eye-off" : "mdi-eye"));
const passwordToggleAriaLabel = computed(() =>
  showPassword.value ? hidePasswordLabel.value : showPasswordLabel.value,
);
const sessionMessage = computed(() => auth.sessionMessage.value ?? "");
const redirectFromQuery = computed(() => {
  const currentRoute = router.currentRoute.value;
  const redirectQuery = currentRoute?.query?.redirect;
  return typeof redirectQuery === "string" ? redirectQuery : null;
});

watch(
  () => auth.loginError.value,
  (message) => {
    if (message) formError.value = message;
  },
);

function togglePassword() {
  if (isDisabled.value) return;
  showPassword.value = !showPassword.value;
}

function handleFieldInput() {
  if (formError.value) formError.value = "";
  auth.clearLoginError();
}

function dismissSessionMessage() {
  auth.setSessionMessage(null);
}

async function handleSubmit() {
  if (isSubmitting.value) return;

  const identifier = username.value.trim();
  const secret = password.value;

  formError.value = "";
  auth.clearLoginError();

  if (!identifier || !secret) {
    formError.value = t("auth.requiredError");
    return;
  }

  try {
    const success = await auth.login({ identifier, password: secret });

    if (!success) {
      const message = auth.loginError.value ?? t("auth.invalidError");
      formError.value = message;
      $notify({ type: "error", title: t("auth.errorTitle"), message, timeout: null });
      return;
    }

    auth.setSessionMessage(null);

    const redirectTarget = redirectFromQuery.value || auth.consumeRedirect() || localePath("/");

    $notify({ type: "success", title: t("auth.successTitle"), message: t("auth.success") });

    await router.push(redirectTarget);
  } catch {
    const message = t("auth.errorGeneric");
    formError.value = message;
    $notify({ type: "error", title: t("auth.errorTitle"), message, timeout: null });
  }
}
</script>

<style scoped>
/* === Login – Inputs revamp === */
.login-form {
  width: 100%;
}
.login-form__inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login-form__alert {
  margin-bottom: 0.25rem;
}

/* Container (pill + glass) */
.login-field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 56px;
  border-radius: 9999px;
  padding: 0.85rem 1.25rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(130%) blur(12px);
  -webkit-backdrop-filter: saturate(130%) blur(12px);
  border: 1px solid rgba(236, 72, 153, 0.25);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.08s ease;
  overflow: hidden;
}

.login-field--compact {
  min-height: 48px;
  padding: 0.7rem 1rem;
  gap: 0.6rem;
}

/* Focus accessible */
.login-field:focus-within {
  border-color: rgba(236, 72, 153, 0.55);
  box-shadow: 0 8px 22px rgba(236, 72, 153, 0.2);
}

/* État erreur basé sur aria-invalid de l'input */
.login-field:has(input[aria-invalid="true"]) {
  border-color: rgba(239, 68, 68, 0.85);
  box-shadow: 0 8px 22px rgba(239, 68, 68, 0.18);
}

/* Input */
.login-field__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
  outline: none;
  color: #0f172a; /* contraste fort */
  caret-color: #0f172a;
}

.login-form--compact .login-field__input {
  font-size: 0.95rem;
}
.login-field__input::placeholder {
  color: rgba(100, 116, 139, 0.75);
}

/* Sélection du texte */
.login-field__input::selection {
  background: rgba(236, 72, 153, 0.22);
  color: #0f172a;
}

/* Bouton action (œil) */
.login-field__action {
  inline-size: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(236, 72, 153, 0.25);
  color: rgba(71, 85, 105, 0.8);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.login-field--compact .login-field__action {
  inline-size: 36px;
  block-size: 22px;
}

.login-field__action:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.25);
  border-color: rgba(236, 72, 153, 0.4);
}
.login-field__action:focus-visible {
  outline: 2px solid rgba(236, 72, 153, 0.55);
  outline-offset: 2px;
}
.login-field__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.login-field__action-icon {
  font-size: 1.1rem;
}

/* Messages & liens */
.login-form__error {
  margin: 0.25rem 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: #ef4444;
  font-weight: 600;
}
.login-form__links {
  font-size: 0.9rem;
}
.login-form__forgot {
  color: rgb(236, 72, 153);
  font-weight: 600;
  text-decoration: none;
}
.login-form__forgot:hover {
  text-decoration: underline;
}

/* Submit */
.login-form__submit {
  background-color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  border-radius: 9999px;
  padding: 0.95rem 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  gap: 0.5rem;
  box-shadow: 0 5px 5px rgba(var(--v-theme-primary));
}

.login-form__signup {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: rgba(71, 85, 105, 0.95);
}
.login-form__signup-link {
  color: rgb(236, 72, 153);
  font-weight: 800;
  text-decoration: none;
  margin-inline-start: 0.35rem;
}
.login-form__signup-link:hover {
  text-decoration: underline;
}
.login-form--compact .login-form__submit {
  padding: 0.8rem 1.1rem;
  font-size: 0.85rem;
}
.login-form--compact .login-form__signup {
  font-size: 0.85rem;
}

/* Autofill Chrome/Safari – avec :deep pour <style scoped> */
:deep(.login-field__input:-webkit-autofill),
:deep(.login-field__input:-webkit-autofill:hover),
:deep(.login-field__input:-webkit-autofill:focus) {
  -webkit-text-fill-color: #0f172a;
  transition: background-color 5000s ease-in-out 0s;
}

/* Masquer les boutons natifs Edge/IE sur les mdp */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

/* Petits écrans */
@media (max-width: 420px) {
  .login-field {
    padding-inline: 1rem;
  }
  .login-field__input {
    font-size: 0.95rem;
  }
}
</style>
