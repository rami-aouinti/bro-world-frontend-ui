import { computed, watch } from "vue";
import { useState } from "#imports";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "~/lib/pinia-shim";
import {
  demoEcommerceProducts,
  getInventoryForProduct,
  getProductBySlug,
} from "~/lib/demo/ecommerce";

type CheckoutStep = "cart" | "shipping" | "payment" | "review";

export interface DemoCartItem {
  slug: string;
  quantity: number;
}

export interface DemoCartState {
  items: DemoCartItem[];
  activeStep: CheckoutStep;
  shippingMethod: "standard" | "express" | null;
  notes: string;
}

const STORAGE_KEY = "bro-world-demo-cart";

function createInitialState(): DemoCartState {
  return {
    items: [],
    activeStep: "cart",
    shippingMethod: null,
    notes: "",
  };
}

export const useDemoCartStore = defineStore("demo-cart", () => {
  const storage = import.meta.client
    ? useLocalStorage<DemoCartState>(STORAGE_KEY, createInitialState(), {
        serializer: {
          read: (value: string) => {
            try {
              const parsed = JSON.parse(value) as DemoCartState;
              if (parsed && Array.isArray(parsed.items)) {
                return parsed;
              }
            } catch {
              // noop
            }

            return createInitialState();
          },
          write: (value: DemoCartState) => JSON.stringify(value),
        },
      })
    : null;

  const state = useState<DemoCartState>("demo-cart-state", () =>
    storage?.value ? { ...storage.value, items: [...storage.value.items] } : createInitialState(),
  );

  watch(
    state,
    (value) => {
      if (storage) {
        storage.value = { ...value, items: [...value.items] };
      }
    },
    { deep: true },
  );

  function mapItemWithDetails(item: DemoCartItem) {
    const product = getProductBySlug(item.slug);

    if (!product) {
      return null;
    }

    const inventory = getInventoryForProduct(product.slug);

    return {
      ...item,
      product,
      inventory,
      lineTotal: product.price * item.quantity,
    };
  }

  const itemsWithDetails = computed(() =>
    state.value.items
      .map(mapItemWithDetails)
      .filter((entry): entry is NonNullable<ReturnType<typeof mapItemWithDetails>> =>
        Boolean(entry),
      ),
  );

  const subtotal = computed(() =>
    itemsWithDetails.value.reduce((sum, item) => sum + item.lineTotal, 0),
  );

  const tax = computed(() => subtotal.value * 0.12);
  const shipping = computed(() => {
    if (!state.value.shippingMethod) {
      return 0;
    }

    return state.value.shippingMethod === "express" ? 14 : 0;
  });
  const total = computed(() => subtotal.value + tax.value + shipping.value);
  const totalItems = computed(() =>
    state.value.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  function setStep(step: CheckoutStep) {
    state.value.activeStep = step;
  }

  function setShippingMethod(method: "standard" | "express") {
    state.value.shippingMethod = method;
  }

  function setNotes(notes: string) {
    state.value.notes = notes;
  }

  function addItem(slug: string, quantity = 1) {
    const product = getProductBySlug(slug);

    if (!product) {
      return;
    }

    const inventory = getInventoryForProduct(slug);
    const existing = state.value.items.find((item) => item.slug === slug);
    const desiredQuantity = Math.max(1, quantity);
    const nextQuantity = existing ? existing.quantity + desiredQuantity : desiredQuantity;

    const maxQuantity = inventory?.available ?? desiredQuantity;
    const finalQuantity = Math.min(nextQuantity, maxQuantity);

    if (existing) {
      existing.quantity = finalQuantity;
    } else {
      state.value.items.push({ slug, quantity: finalQuantity });
    }
  }

  function updateItemQuantity(slug: string, quantity: number) {
    const entry = state.value.items.find((item) => item.slug === slug);

    if (!entry) {
      return;
    }

    const inventory = getInventoryForProduct(slug);
    const normalized = Math.max(1, Math.floor(quantity));
    const maxQuantity = inventory?.available ?? normalized;

    entry.quantity = Math.min(normalized, maxQuantity);
  }

  function removeItem(slug: string) {
    state.value.items = state.value.items.filter((item) => item.slug !== slug);
  }

  function reset() {
    const nextState = createInitialState();
    state.value = nextState;
    if (storage) {
      storage.value = nextState;
    }
  }

  const isEmpty = computed(() => state.value.items.length === 0);

  return {
    state,
    itemsWithDetails,
    subtotal,
    tax,
    shipping,
    total,
    totalItems,
    isEmpty,
    addItem,
    updateItemQuantity,
    removeItem,
    reset,
    setStep,
    setShippingMethod,
    setNotes,
  };
});
