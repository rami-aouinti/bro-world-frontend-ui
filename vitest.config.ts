import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/unit/**/*.spec.ts", "tests/e2e/**/*.spec.ts"],
    setupFiles: ["vitest.setup.ts"],
    css: true,
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "#app": fileURLToPath(new URL("./tests/mocks/nuxt-app.ts", import.meta.url)),
      "#imports": fileURLToPath(new URL("./tests/mocks/nuxt-imports.ts", import.meta.url)),
      "#i18n": fileURLToPath(new URL("./tests/mocks/nuxt-i18n.ts", import.meta.url)),
      "#components": fileURLToPath(new URL("./tests/mocks/nuxt-components.ts", import.meta.url)),
    },
  },
});
