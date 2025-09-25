import { createPinia } from "~/lib/pinia-shim";

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();

  nuxtApp.vueApp.use(pinia);
  nuxtApp.provide("pinia", pinia);
});
