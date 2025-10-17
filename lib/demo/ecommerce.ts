import type { Ref } from "vue";

export interface DemoEcommerceCategory {
  slug: string;
  nameKey: string;
  descriptionKey: string;
  heroImage?: string;
  featuredProductSlugs?: string[];
}

export interface DemoEcommerceProduct {
  slug: string;
  sku: string;
  categorySlug: string;
  nameKey: string;
  summaryKey: string;
  descriptionKey: string;
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  specifications: Array<{ labelKey: string; valueKey: string }>;
  rating: number;
  reviews: number;
  badges?: string[];
}

export interface DemoEcommerceInventory {
  productSlug: string;
  available: number;
  incoming?: number;
  lowStockThreshold?: number;
}

export interface DemoEcommerceOrderItem {
  productSlug: string;
  quantity: number;
  unitPrice: number;
}

export interface DemoEcommerceOrder {
  id: string;
  number: string;
  status: "processing" | "fulfilled" | "cancelled" | "draft";
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  customerKey: string;
  notesKey: string;
  items: DemoEcommerceOrderItem[];
}

export const demoEcommerceCategories: DemoEcommerceCategory[] = [
  {
    slug: "workspace",
    nameKey: "demo.ecommerce.categories.workspace.name",
    descriptionKey: "demo.ecommerce.categories.workspace.description",
    heroImage: "/images/ecommerce/workspace.jpg",
    featuredProductSlugs: ["aurora-desk-lamp", "focus-hub-pro"],
  },
  {
    slug: "wellbeing",
    nameKey: "demo.ecommerce.categories.wellbeing.name",
    descriptionKey: "demo.ecommerce.categories.wellbeing.description",
    heroImage: "/images/ecommerce/wellbeing.jpg",
    featuredProductSlugs: ["pulse-smart-bottle"],
  },
  {
    slug: "travel",
    nameKey: "demo.ecommerce.categories.travel.name",
    descriptionKey: "demo.ecommerce.categories.travel.description",
    heroImage: "/images/ecommerce/travel.jpg",
    featuredProductSlugs: ["atlas-weekender"],
  },
];

export const demoEcommerceProducts: DemoEcommerceProduct[] = [
  {
    slug: "aurora-desk-lamp",
    sku: "BWS-LIGHT-001",
    categorySlug: "workspace",
    nameKey: "demo.ecommerce.products.auroraDeskLamp.name",
    summaryKey: "demo.ecommerce.products.auroraDeskLamp.summary",
    descriptionKey: "demo.ecommerce.products.auroraDeskLamp.description",
    price: 189,
    currency: "EUR",
    images: [
      "/images/ecommerce/products/aurora-desk-lamp-1.jpg",
      "/images/ecommerce/products/aurora-desk-lamp-2.jpg",
    ],
    tags: ["smart", "led", "workspace"],
    specifications: [
      {
        labelKey: "demo.ecommerce.specifications.power",
        valueKey: "demo.ecommerce.products.auroraDeskLamp.specs.power",
      },
      {
        labelKey: "demo.ecommerce.specifications.material",
        valueKey: "demo.ecommerce.products.auroraDeskLamp.specs.material",
      },
      {
        labelKey: "demo.ecommerce.specifications.dimensions",
        valueKey: "demo.ecommerce.products.auroraDeskLamp.specs.dimensions",
      },
    ],
    rating: 4.8,
    reviews: 128,
    badges: ["demo.ecommerce.badges.bestseller"],
  },
  {
    slug: "focus-hub-pro",
    sku: "BWS-HUB-002",
    categorySlug: "workspace",
    nameKey: "demo.ecommerce.products.focusHubPro.name",
    summaryKey: "demo.ecommerce.products.focusHubPro.summary",
    descriptionKey: "demo.ecommerce.products.focusHubPro.description",
    price: 299,
    currency: "EUR",
    images: [
      "/images/ecommerce/products/focus-hub-pro-1.jpg",
      "/images/ecommerce/products/focus-hub-pro-2.jpg",
    ],
    tags: ["productivity", "modular"],
    specifications: [
      {
        labelKey: "demo.ecommerce.specifications.connectivity",
        valueKey: "demo.ecommerce.products.focusHubPro.specs.connectivity",
      },
      {
        labelKey: "demo.ecommerce.specifications.dimensions",
        valueKey: "demo.ecommerce.products.focusHubPro.specs.dimensions",
      },
      {
        labelKey: "demo.ecommerce.specifications.material",
        valueKey: "demo.ecommerce.products.focusHubPro.specs.material",
      },
    ],
    rating: 4.6,
    reviews: 92,
    badges: ["demo.ecommerce.badges.new"],
  },
  {
    slug: "pulse-smart-bottle",
    sku: "BWS-WELL-003",
    categorySlug: "wellbeing",
    nameKey: "demo.ecommerce.products.pulseSmartBottle.name",
    summaryKey: "demo.ecommerce.products.pulseSmartBottle.summary",
    descriptionKey: "demo.ecommerce.products.pulseSmartBottle.description",
    price: 89,
    currency: "EUR",
    images: [
      "/images/ecommerce/products/pulse-smart-bottle-1.jpg",
      "/images/ecommerce/products/pulse-smart-bottle-2.jpg",
    ],
    tags: ["hydration", "health"],
    specifications: [
      {
        labelKey: "demo.ecommerce.specifications.capacity",
        valueKey: "demo.ecommerce.products.pulseSmartBottle.specs.capacity",
      },
      {
        labelKey: "demo.ecommerce.specifications.material",
        valueKey: "demo.ecommerce.products.pulseSmartBottle.specs.material",
      },
      {
        labelKey: "demo.ecommerce.specifications.compatibility",
        valueKey: "demo.ecommerce.products.pulseSmartBottle.specs.compatibility",
      },
    ],
    rating: 4.7,
    reviews: 210,
    badges: ["demo.ecommerce.badges.staffPick"],
  },
  {
    slug: "atlas-weekender",
    sku: "BWS-TRAVEL-004",
    categorySlug: "travel",
    nameKey: "demo.ecommerce.products.atlasWeekender.name",
    summaryKey: "demo.ecommerce.products.atlasWeekender.summary",
    descriptionKey: "demo.ecommerce.products.atlasWeekender.description",
    price: 249,
    currency: "EUR",
    images: [
      "/images/ecommerce/products/atlas-weekender-1.jpg",
      "/images/ecommerce/products/atlas-weekender-2.jpg",
    ],
    tags: ["carry-on", "recycled"],
    specifications: [
      {
        labelKey: "demo.ecommerce.specifications.capacity",
        valueKey: "demo.ecommerce.products.atlasWeekender.specs.capacity",
      },
      {
        labelKey: "demo.ecommerce.specifications.material",
        valueKey: "demo.ecommerce.products.atlasWeekender.specs.material",
      },
      {
        labelKey: "demo.ecommerce.specifications.dimensions",
        valueKey: "demo.ecommerce.products.atlasWeekender.specs.dimensions",
      },
    ],
    rating: 4.9,
    reviews: 304,
    badges: ["demo.ecommerce.badges.limited"],
  },
];

export const demoEcommerceInventory: DemoEcommerceInventory[] = [
  { productSlug: "aurora-desk-lamp", available: 37, incoming: 120, lowStockThreshold: 10 },
  { productSlug: "focus-hub-pro", available: 12, incoming: 40, lowStockThreshold: 8 },
  { productSlug: "pulse-smart-bottle", available: 85, incoming: 0, lowStockThreshold: 25 },
  { productSlug: "atlas-weekender", available: 6, incoming: 20, lowStockThreshold: 5 },
];

export const demoEcommerceOrders: DemoEcommerceOrder[] = [
  {
    id: "ord_demo_001",
    number: "BW-DEMO-001",
    status: "fulfilled",
    currency: "EUR",
    subtotal: 826,
    tax: 74.34,
    shipping: 0,
    total: 900.34,
    createdAt: "2024-01-08T09:24:00.000Z",
    customerKey: "demo.ecommerce.orders.primary.customer",
    notesKey: "demo.ecommerce.orders.primary.notes",
    items: [
      { productSlug: "focus-hub-pro", quantity: 2, unitPrice: 299 },
      { productSlug: "pulse-smart-bottle", quantity: 2, unitPrice: 89 },
      { productSlug: "aurora-desk-lamp", quantity: 1, unitPrice: 189 },
    ],
  },
  {
    id: "ord_demo_002",
    number: "BW-DEMO-002",
    status: "processing",
    currency: "EUR",
    subtotal: 538,
    tax: 48.42,
    shipping: 12,
    total: 598.42,
    createdAt: "2024-02-19T14:17:00.000Z",
    customerKey: "demo.ecommerce.orders.restock.customer",
    notesKey: "demo.ecommerce.orders.restock.notes",
    items: [
      { productSlug: "atlas-weekender", quantity: 2, unitPrice: 249 },
      { productSlug: "pulse-smart-bottle", quantity: 1, unitPrice: 89 },
    ],
  },
];

export function getCategoryBySlug(slug: string) {
  return demoEcommerceCategories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return demoEcommerceProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return demoEcommerceProducts.filter((product) => product.categorySlug === slug);
}

export function getInventoryForProduct(slug: string) {
  return demoEcommerceInventory.find((stock) => stock.productSlug === slug);
}

export function getOrderByNumber(number: string) {
  return demoEcommerceOrders.find((order) => order.number === number);
}

export function getProductsMatchingQuery(query: Ref<string> | string) {
  const value = typeof query === "string" ? query : query.value;
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return demoEcommerceProducts;
  }

  return demoEcommerceProducts.filter((product) => {
    const slugMatch = product.slug.includes(normalized);
    const tagMatch = product.tags.some((tag) => tag.toLowerCase().includes(normalized));

    return slugMatch || tagMatch;
  });
}

export function formatCurrency(value: number, locale = "en", currency = "EUR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
