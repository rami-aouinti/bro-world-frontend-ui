import { computed, watchEffect } from "vue";
import { useColorMode } from "@vueuse/core";
import { useCookie, useHead, useRequestHeaders } from "#imports";
import { withSecureCookieOptions } from "~/lib/cookies";

type ColorModeValue = "light" | "dark" | "auto";

export function useCookieColorMode() {
  const colorModeCookie = useCookie<ColorModeValue>(
    "color-mode",
    withSecureCookieOptions({
      sameSite: "lax",
    }),
  );

  const initialValue = colorModeCookie.value ?? "auto";

  const colorMode = useColorMode<ColorModeValue>({
    storageKey: "color-mode",
    initialValue,
    storage: {
      getItem: () => colorModeCookie.value ?? "auto",
      setItem: (_, value) => {
        colorModeCookie.value = value as ColorModeValue;
      },
      removeItem: () => {
        colorModeCookie.value = null;
      },
    },
  });

  const colorSchemeHint = import.meta.server
    ? ((useRequestHeaders(["sec-ch-prefers-color-scheme"])["sec-ch-prefers-color-scheme"] ?? null) as
        | "light"
        | "dark"
        | null)
    : null;

  const resolvedMode = computed<"light" | "dark">(() => {
    if (colorMode.value === "auto") {
      if (import.meta.server) {
        if (initialValue === "dark") {
          return "dark";
        }

        if (colorSchemeHint === "dark") {
          return "dark";
        }

        return "light";
      }

      return colorMode.system.value === "dark" ? "dark" : "light";
    }

    return colorMode.value === "dark" ? "dark" : "light";
  });

  useHead({
    htmlAttrs: {
      class: computed(() => (resolvedMode.value === "dark" ? "dark theme--dark" : undefined)),
    },
  });

  if (import.meta.client) {
    watchEffect(() => {
      const isDark = resolvedMode.value === "dark";
      const classList = document.documentElement.classList;

      classList.toggle("dark", isDark);
      classList.toggle("theme--dark", isDark);
    });
  }

  return colorMode;
}
