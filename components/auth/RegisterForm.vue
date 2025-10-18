<template>
  <v-form
    class="register-form mx-auto max-w-xl"
    @submit.prevent="handleSubmit"
  >
    <div class="d-flex flex-column gap-4">
      <v-text-field
        v-model="email"
        :label="t('register.email')"
        variant="outlined"
        density="comfortable"
        color="primary"
        prepend-inner-icon="mdi:email"
        :disabled="loading"
        :style="inputDirectionStyle"
        @update:model-value="clearError"
      />
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :label="t('register.password')"
        variant="outlined"
        density="comfortable"
        color="primary"
        :disabled="loading"
        :style="inputDirectionStyle"
        @click:append-inner="togglePassword"
        @update:model-value="clearError"
      >
        <template #append-inner>
          <v-btn
            :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            :disabled="loading"
            variant="text"
            density="comfortable"
            @click.prevent="togglePassword"
          />
        </template>
      </v-text-field>
      <v-text-field
        v-model="repeatPassword"
        :type="showRepeatPassword ? 'text' : 'password'"
        :label="t('register.repeatPassword')"
        variant="outlined"
        density="comfortable"
        color="primary"
        :disabled="loading"
        :style="inputDirectionStyle"
        @click:append-inner="toggleRepeatPassword"
        @update:model-value="clearError"
      >
        <template #append-inner>
          <v-btn
            :icon="showRepeatPassword ? 'mdi:eye-off' : 'mdi:eye'"
            :aria-label="showRepeatPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            :disabled="loading"
            variant="text"
            density="comfortable"
            @click.prevent="toggleRepeatPassword"
          />
        </template>
      </v-text-field>

      <v-row
        class="align-center"
        :class="{ 'flex-row-reverse': isRtl }"
      >
        <v-col cols="auto">
          <v-checkbox
            v-model="checkbox"
            hide-details
            class="ma-0 pa-0"
            density="comfortable"
            :disabled="loading"
          />
        </v-col>
        <v-col>
          <span
            class="text-body-2 ls-0"
            :class="fieldAlignment"
          >
            {{ t("register.agree") }}
            <a
              href="javascript:void(0)"
              class="font-weight-medium text-decoration-none text-primary"
              @click.prevent="showTerms = true"
            >
              {{ t("register.terms") }}
            </a>
          </span>
        </v-col>
      </v-row>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        border="start"
        density="comfortable"
        role="alert"
      >
        {{ error }}
      </v-alert>

      <v-alert
        type="info"
        variant="tonal"
        border="start"
        density="comfortable"
        class="mb-0"
      >
        <div
          class="font-weight-semibold mb-2"
          :class="fieldAlignment"
        >
          {{ t("register.requirements") }}
        </div>
        <ul class="ps-4 mb-0">
          <li class="text-body-2">
            {{ t("register.requirement1") }}
          </li>
          <li class="text-body-2">
            {{ t("register.requirement2") }}
          </li>
        </ul>
      </v-alert>

      <LockableButton
        block
        color="primary"
        variant="flat"
        rounded="xl"
        size="large"
        type="submit"
        class="text-uppercase font-weight-semibold"
        :loading="loading"
        :disabled="loading"
      >
        {{ t("register.signUp") }}
      </LockableButton>

      <p
        class="text-body-2 text-medium-emphasis text-center mb-0"
        :class="fieldAlignment"
      >
        {{ t("register.haveAccount") }}
        <NuxtLink
          :to="localePath('/login')"
          class="text-primary text-decoration-none font-weight-semibold ms-1"
        >
          {{ t("register.signIn") }}
        </NuxtLink>
      </p>
    </div>

    <v-dialog
      v-model="showTerms"
      max-width="600"
    >
      <v-card class="mx-auto">
        <v-card-title
          class="text-h6 font-weight-bold"
          :class="fieldAlignment"
        >
          {{ t("register.termsTitle") }}
        </v-card-title>
        <v-divider />
        <v-card-text class="text-body-2">
          <Terms />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import LockableButton from "~/components/LockableButton.vue";

const Terms = defineAsyncComponent({
  loader: () => import("~/components/auth/Terms.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useResolvedLocalePath();
const { $notify } = useNuxtApp();

const isRtl = computed(() => ["ar", "he", "fa", "ur"].includes(locale.value));
const fieldAlignment = computed(() => (isRtl.value ? "text-end" : "text-start"));

const email = ref("");
const password = ref("");
const repeatPassword = ref("");
const checkbox = ref(false);
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const showRepeatPassword = ref(false);
const showTerms = ref(false);

const inputDirectionStyle = computed(() => ({ direction: isRtl.value ? "rtl" : "ltr" }));

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleRepeatPassword() {
  showRepeatPassword.value = !showRepeatPassword.value;
}

function clearError() {
  if (error.value) {
    error.value = "";
  }
}

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;
  error.value = "";

  if (!checkbox.value) {
    error.value = t("register.errorTerms");
    loading.value = false;
    return;
  }

  if (!email.value || !password.value || !repeatPassword.value) {
    error.value = t("register.errorMissing");
    loading.value = false;
    return;
  }

  if (password.value !== repeatPassword.value) {
    error.value = t("register.errorMismatch");
    loading.value = false;
    return;
  }

  try {
    const { data, error: fetchError } = await useFetch("/api/auth/register", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
        repeatPassword: repeatPassword.value,
      },
    });

    if (fetchError.value) {
      const message = fetchError.value.data?.message ?? t("register.errorGeneric");
      error.value = message;
      $notify({
        type: "error",
        title: t("register.errorTitle"),
        message,
        timeout: null,
      });
      return;
    }

    if (data.value) {
      $notify({
        type: "success",
        title: t("register.successTitle"),
        message: t("register.success"),
      });
      email.value = "";
      password.value = "";
      repeatPassword.value = "";
      checkbox.value = false;
      const loginPath = localePath("/login");
      await router.push(loginPath);
    }
  } catch (exception: unknown) {
    const message = t("register.errorGeneric");
    error.value = message;
    $notify({
      type: "error",
      title: t("register.errorTitle"),
      message,
      timeout: null,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-form {
  --v-field-border-radius: var(--radius, var(--ui-radius));
}

.register-form :deep(.v-field) {
  border-radius: var(--v-field-border-radius);
}

.register-form :deep(.v-field__outline),
.register-form :deep(.v-field__overlay) {
  border-radius: inherit;
}
</style>
