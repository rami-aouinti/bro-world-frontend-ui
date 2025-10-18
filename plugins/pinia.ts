import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia } from "~/lib/pinia-shim";

export default defineNuxtPlugin({
  name: "pinia-plugin",
  enforce: "pre",
  setup(nuxtApp) {
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);

    nuxtApp.vueApp.use(pinia);
    nuxtApp.provide("pinia", pinia);
  },
});
