<template>
  <v-container class="py-12" style="margin-top: -70px;">
    <v-card-text class="text-medium-emphasis pa-1">
      <AuthLoginForm />
    </v-card-text>
  </v-container>
</template>

<script setup lang="ts">
import AuthLoginForm from "~/components/auth/LoginForm.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "#i18n";

import { toast } from "~/components/content/common/toast";

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const isRtl = computed(() => ["ar", "he", "fa", "ur"].includes(locale.value));
const fieldAlignment = computed(() => (isRtl.value ? "text-end" : "text-start"));

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;
  error.value = "";

  if (!username.value || !password.value) {
    error.value = t("auth.requiredError");
    loading.value = false;
    return;
  }

  try {
    const { data, error: fetchError } = await useFetch("/api/auth/login", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
      },
    });

    if (fetchError.value) {
      error.value = fetchError.value.data?.message ?? t("auth.invalidError");
      return;
    }

    if (data.value) {
      toast({
        title: t("auth.successTitle"),
        description: t("auth.success"),
      });
      const homePath = localePath("/");
      await router.push(homePath);
    }
  } catch (exception) {
    console.error("Login failed", exception);
    error.value = t("auth.errorGeneric");
  } finally {
    loading.value = false;
  }
}
</script>

