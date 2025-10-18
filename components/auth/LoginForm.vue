<template>
  <v-form
    :class="formClasses"
    class="login-form"
    data-lpignore="true"
    data-lastpass-ignore="true"
    data-lastpass-icon="false"
    @submit.prevent="handleSubmit"
  >
    <div class="d-flex flex-column gap-4">
      <v-alert
        v-if="sessionMessage"
        type="warning"
        variant="tonal"
        border="start"
        density="comfortable"
        closable
        role="status"
        @click:close="dismissSessionMessage"
      >
        {{ sessionMessage }}
      </v-alert>

      <v-text-field
        v-model="username"
        :label="t('auth.usernameOrEmail')"
        :disabled="isDisabled"
        :error="Boolean(formError)"
        variant="outlined"
        density="comfortable"
        color="primary"
        autocapitalize="none"
        autocomplete="username"
        spellcheck="false"
        :style="inputDirectionStyle"
        prepend-inner-icon="mdi:account"
        @update:model-value="handleFieldInput"
      />

      <v-text-field
        v-model="password"
        :label="t('auth.password')"
        :type="passwordInputType"
        :disabled="isDisabled"
        :error="Boolean(formError)"
        variant="outlined"
        density="comfortable"
        color="primary"
        autocomplete="current-password"
        :style="inputDirectionStyle"
        @update:model-value="handleFieldInput"
      >
        <template #append-inner>
          <v-btn
            :aria-label="passwordToggleAriaLabel"
            :disabled="isDisabled"
            :icon="passwordToggleIcon"
            variant="text"
            density="comfortable"
            @click.prevent="togglePassword"
          />
        </template>
      </v-text-field>

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        density="comfortable"
        border="start"
        role="alert"
      >
        {{ formError }}
      </v-alert>

      <div
        class="d-flex"
        :class="isRtl ? 'justify-start' : 'justify-end'"
      >
        <NuxtLink
          :to="localePath('/forgot-password')"
          class="text-primary text-decoration-none font-weight-medium"
        >
          {{ t("auth.forgotPassword") }}
        </NuxtLink>
      </div>

      <LockableButton
        block
        color="primary"
        variant="flat"
        rounded="xl"
        size="large"
        type="submit"
        class="text-uppercase font-weight-semibold"
        :loading="isSubmitting"
        :disabled="isDisabled"
      >
        {{ t("auth.signIn") }}
      </LockableButton>

      <p
        class="text-body-2 text-medium-emphasis text-center mb-0"
        :class="fieldAlignment"
      >
        {{ t("auth.signUpPrompt") }}
        <NuxtLink
          :to="localePath('/register')"
          class="text-primary text-decoration-none font-weight-semibold ms-1"
        >
          {{ t("auth.signUp") }}
        </NuxtLink>
      </p>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useAuthSession } from "~/stores/auth-session";
import LockableButton from "~/components/LockableButton.vue";

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
const formClasses = computed(() => ({ "login-form--compact": isCompact.value }));

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const formError = ref("");

const showPasswordLabel = computed(() => t("auth.showPassword"));
const hidePasswordLabel = computed(() => t("auth.hidePassword"));
const passwordInputType = computed(() => (showPassword.value ? "text" : "password"));
const passwordToggleIcon = computed(() => (showPassword.value ? "mdi:eye-off" : "mdi:eye"));
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

const inputDirectionStyle = computed(() => ({ direction: isRtl.value ? "rtl" : "ltr" }));

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
.login-form {
  width: 100%;
}

.login-form :deep(.v-field) {
  border-radius: var(--radius, var(--ui-radius));
}

.login-form--compact :deep(.v-field) {
  min-height: 48px;
}
</style>
