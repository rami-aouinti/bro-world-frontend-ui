import piniaPersistedStatePlugin from "~/lib/pinia-persisted-state";
import { createPinia } from "~/lib/pinia-shim";

export default defineNuxtPlugin({
  name: "pinia-plugin",
  enforce: "pre",
  setup(nuxtApp) {
    const pinia = createPinia();
    pinia.use(piniaPersistedStatePlugin);

    nuxtApp.vueApp.use(pinia);
    nuxtApp.provide("pinia", pinia);
  },
});
