<template>
  <main class="py-10">
    <v-container>
      <v-breadcrumbs
        :items="breadcrumbs"
        class="mb-6"
      />
      <header class="mb-8 text-center text-md-left">
        <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
          {{ t("demo.ecommerce.checkout.title") }}
        </h1>
        <p
          class="text-body-1 text-medium-emphasis mx-auto mx-md-0"
          style="max-width: 640px"
        >
          {{ t("demo.ecommerce.checkout.subtitle") }}
        </p>
      </header>

      <v-alert
        v-if="cart.isEmpty"
        type="info"
        variant="tonal"
        class="mb-8"
      >
        {{ t("demo.ecommerce.checkout.empty") }}
        <v-btn
          :to="localePath('/ecommerce/catalog')"
          class="ml-4"
          variant="outlined"
        >
          {{ t("demo.ecommerce.checkout.shopLink") }}
        </v-btn>
      </v-alert>

      <v-stepper
        v-else
        v-model="currentStep"
        elevation="0"
        color="primary"
      >
        <v-stepper-header>
          <v-stepper-item
            v-for="step in steps"
            :key="step.value"
            :value="step.value"
            :title="t(step.title)"
            :subtitle="t(step.subtitle)"
            :complete="isComplete(step.value)"
          />
        </v-stepper-header>

        <v-stepper-window>
          <v-stepper-window-item value="shipping">
            <v-row dense>
              <v-col
                cols="12"
                md="7"
              >
                <v-card
                  variant="outlined"
                  class="pa-6 mb-6"
                >
                  <h2 class="text-h5 font-weight-semibold mb-4">
                    {{ t("demo.ecommerce.checkout.shippingTitle") }}
                  </h2>
                  <v-form @submit.prevent="goToPayment">
                    <v-row dense>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="shippingForm.firstName"
                          :label="t('demo.ecommerce.checkout.fields.firstName')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="shippingForm.lastName"
                          :label="t('demo.ecommerce.checkout.fields.lastName')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="shippingForm.email"
                          :label="t('demo.ecommerce.checkout.fields.email')"
                          type="email"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="shippingForm.address"
                          :label="t('demo.ecommerce.checkout.fields.address')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-text-field
                          v-model="shippingForm.city"
                          :label="t('demo.ecommerce.checkout.fields.city')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col
                        cols="6"
                        md="3"
                      >
                        <v-text-field
                          v-model="shippingForm.postalCode"
                          :label="t('demo.ecommerce.checkout.fields.postalCode')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col
                        cols="6"
                        md="3"
                      >
                        <v-text-field
                          v-model="shippingForm.country"
                          :label="t('demo.ecommerce.checkout.fields.country')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-radio-group
                          v-model="shippingForm.delivery"
                          :label="t('demo.ecommerce.checkout.fields.delivery')"
                        >
                          <v-radio
                            value="standard"
                            :label="t('demo.ecommerce.checkout.delivery.standard')"
                          />
                          <v-radio
                            value="express"
                            :label="t('demo.ecommerce.checkout.delivery.express')"
                          />
                        </v-radio-group>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="shippingForm.notes"
                          :label="t('demo.ecommerce.checkout.fields.notes')"
                          rows="3"
                          variant="outlined"
                        />
                      </v-col>
                    </v-row>
                    <div class="d-flex justify-end gap-3 mt-4">
                      <v-btn
                        variant="tonal"
                        @click="goToCart"
                      >
                        {{ t("demo.ecommerce.checkout.backToCart") }}
                      </v-btn>
                      <v-btn
                        color="primary"
                        type="submit"
                      >
                        {{ t("demo.ecommerce.checkout.continueToPayment") }}
                      </v-btn>
                    </div>
                  </v-form>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <OrderSummary
                  :items="cart.itemsWithDetails"
                  :subtotal="cart.subtotal"
                  :tax="cart.tax"
                  :shipping="cart.shipping"
                  :total="cart.total"
                />
              </v-col>
            </v-row>
          </v-stepper-window-item>

          <v-stepper-window-item value="payment">
            <v-row dense>
              <v-col
                cols="12"
                md="7"
              >
                <v-card
                  variant="outlined"
                  class="pa-6 mb-6"
                >
                  <h2 class="text-h5 font-weight-semibold mb-4">
                    {{ t("demo.ecommerce.checkout.paymentTitle") }}
                  </h2>
                  <v-form @submit.prevent="goToReview">
                    <v-row dense>
                      <v-col cols="12">
                        <v-text-field
                          v-model="paymentForm.cardNumber"
                          :label="t('demo.ecommerce.checkout.fields.cardNumber')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="paymentForm.expiry"
                          :label="t('demo.ecommerce.checkout.fields.expiry')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="paymentForm.cvc"
                          :label="t('demo.ecommerce.checkout.fields.cvc')"
                          required
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-checkbox
                          v-model="paymentForm.saveCard"
                          :label="t('demo.ecommerce.checkout.fields.saveCard')"
                        />
                      </v-col>
                    </v-row>
                    <div class="d-flex justify-space-between gap-3 mt-4">
                      <v-btn
                        variant="tonal"
                        @click="goToShipping"
                      >
                        {{ t("demo.ecommerce.checkout.backToShipping") }}
                      </v-btn>
                      <v-btn
                        color="primary"
                        type="submit"
                      >
                        {{ t("demo.ecommerce.checkout.reviewOrder") }}
                      </v-btn>
                    </div>
                  </v-form>
                </v-card>

                <v-card
                  variant="tonal"
                  class="pa-6"
                >
                  <h3 class="text-subtitle-1 font-weight-semibold mb-4">
                    {{ t("demo.ecommerce.checkout.exampleOrdersTitle") }}
                  </h3>
                  <v-timeline density="compact">
                    <v-timeline-item
                      v-for="order in demoOrders"
                      :key="order.id"
                      color="primary"
                    >
                      <template #opposite>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDate(order.createdAt) }}
                        </div>
                      </template>
                      <div class="text-subtitle-2 font-weight-semibold mb-1">
                        {{ order.number }} · {{ t(`demo.ecommerce.orders.status.${order.status}`) }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ t(order.customerKey) }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ t(order.notesKey) }}
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <OrderSummary
                  :items="cart.itemsWithDetails"
                  :subtotal="cart.subtotal"
                  :tax="cart.tax"
                  :shipping="cart.shipping"
                  :total="cart.total"
                >
                  <template #actions>
                    <div class="pa-4 pt-0">
                      <v-btn
                        block
                        color="primary"
                        @click="goToReview"
                      >
                        {{ t("demo.ecommerce.checkout.summaryContinue") }}
                      </v-btn>
                    </div>
                  </template>
                </OrderSummary>
              </v-col>
            </v-row>
          </v-stepper-window-item>

          <v-stepper-window-item value="review">
            <v-row dense>
              <v-col
                cols="12"
                md="7"
              >
                <v-card
                  variant="outlined"
                  class="pa-6 mb-6"
                >
                  <h2 class="text-h5 font-weight-semibold mb-4">
                    {{ t("demo.ecommerce.checkout.reviewTitle") }}
                  </h2>
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="font-weight-semibold">
                        {{ t("demo.ecommerce.checkout.reviewShipping") }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2">
                        {{ shippingSummary }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-semibold">
                        {{ t("demo.ecommerce.checkout.reviewPayment") }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2">
                        {{ paymentSummary }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-alert
                    type="success"
                    variant="tonal"
                    class="mt-4"
                  >
                    {{ t("demo.ecommerce.checkout.reviewHint") }}
                  </v-alert>
                  <div class="d-flex justify-space-between gap-3 mt-6">
                    <v-btn
                      variant="tonal"
                      @click="goToPayment"
                    >
                      {{ t("demo.ecommerce.checkout.backToPayment") }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      @click="placeOrder"
                    >
                      {{ t("demo.ecommerce.checkout.placeOrder") }}
                    </v-btn>
                  </div>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <OrderSummary
                  :items="cart.itemsWithDetails"
                  :subtotal="cart.subtotal"
                  :tax="cart.tax"
                  :shipping="cart.shipping"
                  :total="cart.total"
                >
                  <template #actions>
                    <div class="pa-4 pt-0">
                      <v-btn
                        block
                        color="primary"
                        @click="placeOrder"
                      >
                        {{ t("demo.ecommerce.checkout.placeOrder") }}
                      </v-btn>
                      <v-btn
                        block
                        variant="text"
                        color="secondary"
                        @click="goToCatalog"
                      >
                        {{ t("demo.ecommerce.checkout.browseMore") }}
                      </v-btn>
                    </div>
                  </template>
                </OrderSummary>
              </v-col>
            </v-row>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useHead, useSeoMeta, useRuntimeConfig, useRoute, useRouter } from "#imports";
import OrderSummary from "~/components/ecommerce/OrderSummary.vue";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useDemoCartStore } from "~/stores/useDemoCart";
import { demoEcommerceOrders } from "~/lib/demo/ecommerce";

const vuetifyComponentsPromise = import("vuetify/components");

const VStepper = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VStepper));

const VStepperHeader = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VStepperHeader),
);

const VStepperItem = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VStepperItem),
);

const VStepperWindow = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VStepperWindow),
);

const VStepperWindowItem = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VStepperWindowItem),
);

const VTimeline = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VTimeline));

const VTimelineItem = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VTimelineItem),
);

const cart = useDemoCartStore();
const { t, locale, localeProperties } = useI18n();
const localePath = useResolvedLocalePath();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const steps = [
  {
    value: "shipping",
    title: "demo.ecommerce.checkout.steps.shipping",
    subtitle: "demo.ecommerce.checkout.steps.shippingSubtitle",
  },
  {
    value: "payment",
    title: "demo.ecommerce.checkout.steps.payment",
    subtitle: "demo.ecommerce.checkout.steps.paymentSubtitle",
  },
  {
    value: "review",
    title: "demo.ecommerce.checkout.steps.review",
    subtitle: "demo.ecommerce.checkout.steps.reviewSubtitle",
  },
] as const;

const currentStep = ref(cart.state.value.activeStep ?? "shipping");
const router = useRouter();

watch(
  () => cart.state.value.activeStep,
  (step) => {
    if (step && step !== currentStep.value) {
      currentStep.value = step;
    }
  },
  { immediate: true },
);

const shippingForm = reactive({
  firstName: "Avery",
  lastName: "Reid",
  email: "avery.reid@example.com",
  address: "221B Innovation Avenue",
  city: "Neo London",
  postalCode: "NW1",
  country: "United Kingdom",
  delivery: cart.state.value.shippingMethod ?? "standard",
  notes: cart.state.value.notes,
});

const paymentForm = reactive({
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/27",
  cvc: "123",
  saveCard: true,
});

watch(currentStep, (step) => {
  cart.setStep(step as never);
});

watch(
  () => shippingForm.delivery,
  (method) => {
    cart.setShippingMethod(method as "standard" | "express");
  },
  { immediate: true },
);

watch(
  () => shippingForm.notes,
  (notes) => {
    cart.setNotes(notes);
  },
  { immediate: true },
);

const demoOrders = computed(() => demoEcommerceOrders);

const breadcrumbs = computed(() => [
  { title: t("layout.sidebar.items.ecommerce"), to: localePath("/ecommerce") },
  { title: t("demo.ecommerce.checkout.breadcrumb"), disabled: true },
]);

const pageDescription = computed(() => t("seo.ecommerce.checkout.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

definePageMeta({
  documentDriven: false,
  requiresPlugin: "ecommerce",
});

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.ecommerce.checkout.title");
  const canonical = new URL(route.path, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:url", name: "twitter:url", content: canonical },
      { key: "description", name: "description", content: pageDescription.value },
    ],
  };
});

function goToPayment() {
  currentStep.value = "payment";
}

function goToShipping() {
  currentStep.value = "shipping";
}

function goToReview() {
  currentStep.value = "review";
}

function goToCart() {
  cart.setStep("cart");
  router.push(localePath("/ecommerce/cart"));
}

function goToCatalog() {
  router.push(localePath("/ecommerce/catalog"));
}

function isComplete(step: string) {
  const order = steps.map((s) => s.value);
  return order.indexOf(step) < order.indexOf(currentStep.value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const shippingSummary = computed(
  () =>
    `${shippingForm.firstName} ${shippingForm.lastName} · ${shippingForm.address}, ${shippingForm.city} ${shippingForm.postalCode} (${shippingForm.country})`,
);

const paymentSummary = computed(
  () => `${t("demo.ecommerce.checkout.maskedCard", { last4: paymentForm.cardNumber.slice(-4) })}`,
);

function placeOrder() {
  cart.reset();
  currentStep.value = "shipping";
  router.push(localePath("/ecommerce"));
}

cart.setStep("shipping");
</script>
