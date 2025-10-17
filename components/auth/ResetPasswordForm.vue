<template>
  <v-form
    lazy-validation
    @submit.prevent="handleSubmit"
  >
    <v-text-field
      v-model="email"
      :label="t('reset.email')"
      type="email"
      append-inner-icon="mdi:email"
      required
      :disabled="loading"
    />
    <v-text-field
      v-model="password"
      :label="t('reset.newPassword')"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
      :rules="passwordRules"
      required
      :disabled="loading"
      @click:append-inner="togglePassword"
    />

    <v-text-field
      v-model="confirmPassword"
      :label="t('reset.confirmPassword')"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
      :rules="[confirmPasswordRule]"
      required
      :disabled="loading"
      @click:append-inner="togglePassword"
    />

    <v-btn
      :loading="loading"
      type="submit"
      color="primary"
      class="mt-4 w-100 rounded-xl text-white font-weight-bold"
    >
      {{ t("reset.submit") }}
    </v-btn>

    <p
      v-if="error"
      class="mt-3 text-red text-center"
    >
      {{ error }}
    </p>
    <p
      v-if="success"
      class="mt-3 text-green text-center"
    >
      {{ success }}
    </p>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const { t } = useI18n();
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref("");

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const token = computed(() => {
  const queryToken = currentRoute.value?.query?.token;
  return typeof queryToken === "string" ? queryToken : "";
});

const passwordRules = [
  (v: string) => !!v || t("reset.rules.required"),
  (v: string) => v.length >= 8 || t("reset.rules.minLength"),
];

function confirmPasswordRule(v: string) {
  return v === password.value || t("reset.rules.mismatch");
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function handleSubmit() {
  error.value = "";
  success.value = "";
  loading.value = true;

  if (!token.value) {
    error.value = t("reset.errorToken");
    loading.value = false;
    return;
  }

  const { error: fetchError } = await useFetch("/api/auth/reset-password", {
    method: "POST",
    body: {
      email: email.value,
      token: token.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    },
  });

  if (fetchError.value) {
    error.value = fetchError.value.data?.message || t("reset.errorGeneric");
    loading.value = false;
    return;
  }

  success.value = t("reset.success");

  setTimeout(() => {
    router.push("/login");
  }, 2500);

  loading.value = false;
}
</script>
