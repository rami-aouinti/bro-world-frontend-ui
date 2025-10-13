<template>
  <form
    class="mx-auto max-w-xl"
    @submit.prevent="handleSubmit"
  >
    <div class="card-padding">
      <v-text-field
        v-model="email"
        density="compact"
        rounded="xl"
        :label="t('register.email')"
        :class="fieldAlignment"
        required
        class="font-size-input input-style"
        append-inner-icon="mdi-email"
        :disabled="loading"
      />
      <v-text-field
        v-model="password"
        density="compact"
        rounded="xl"
        :type="showPassword ? 'text' : 'password'"
        :label="t('register.password')"
        required
        class="font-size-input input-style"
        :class="fieldAlignment"
        :disabled="loading"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="togglePassword"
      />
      <v-text-field
        v-model="repeatPassword"
        density="compact"
        rounded="xl"
        :type="showRepeatPassword ? 'text' : 'password'"
        :label="t('register.repeatPassword')"
        required
        class="font-size-input input-style"
        :class="fieldAlignment"
        :disabled="loading"
        :append-inner-icon="showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="toggleRepeatPassword"
      />

      <v-row
        class="align-center"
        :class="{ 'flex-row-reverse': isRtl }"
      >
        <v-col cols="auto">
          <v-checkbox
            v-model="checkbox"
            hide-details
            class="ma-0 pa-0"
            density="compact"
            :disabled="loading"
          />
        </v-col>
        <v-col>
          <span
            class="text-body text-sm ls-0"
            :class="fieldAlignment"
          >
            {{ t("register.agree") }}
            <a
              href="javascript:void(0)"
              class="font-weight-bolder text-decoration-none text-primary"
              @click.prevent="showTerms = true"
            >
              {{ t("register.terms") }}
            </a>
          </span>
        </v-col>
      </v-row>

      <p
        v-if="error"
        class="mt-1 text-red d-flex justify-center"
      >
        {{ error }}
      </p>

      <p
        class="mt-1 mb-2 font-weight-bold text-typo"
        :class="fieldAlignment"
      >
        {{ t("register.requirements") }}
      </p>

      <div
        class="d-sm-flex"
        :class="isRtl ? 'rtl-block' : 'ltr-block'"
      >
        <ul
          class="text-muted ps-6 mb-0"
          :class="isRtl ? 'rtl-block' : 'ltr-block'"
        >
          <li>
            <h6
              class="text-h7"
              :class="isRtl ? 'rtl-block' : 'ltr-block'"
            >
              {{ t("register.requirement1") }}
            </h6>
          </li>
          <li>
            <h6
              class="text-h7"
              :class="isRtl ? 'rtl-block' : 'ltr-block'"
            >
              {{ t("register.requirement2") }}
            </h6>
          </li>
        </ul>
      </div>

      <button
        :disabled="loading"
        type="submit"
        class="btn btn-outline-primary bg-primary rounded-xl text-decoration-none font-weight-bold text-uppercase py-2 px-6 me-2 mt-6 mb-2 w-100"
      >
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="20"
        />
        <span
          v-else
          :class="fieldAlignment"
          >{{ t("register.signUp") }}</span
        >
      </button>

      <p
        class="text-sm text-body mt-1 mb-0 d-flex justify-center"
        :class="fieldAlignment"
      >
        {{ t("register.haveAccount") }}
        <NuxtLink
          :to="localePath('/login')"
          class="text-primary text-decoration-none font-weight-bolder px-1"
          :class="fieldAlignment"
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
  </form>
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "#i18n";

const Terms = defineAsyncComponent({
  loader: () => import("~/components/auth/Terms.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
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

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleRepeatPassword() {
  showRepeatPassword.value = !showRepeatPassword.value;
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
.rtl-block {
  direction: rtl;
  text-align: right;
}
.ltr-block {
  direction: ltr;
  text-align: left;
}
</style>
