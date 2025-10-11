import { computed, watch, watchEffect } from "vue";
import { useColorMode } from "@vueuse/core";
import { useCookie, useHead, useRequestHeaders } from "#imports";
import { withSecureCookieOptions } from "~/lib/cookies";

type ColorModeValue = "light" | "dark" | "auto";

export function useCookieColorMode() {
  const colorModeCookie = useCookie<ColorModeValue>(
    "color-mode",
    withSecureCookieOptions({
      sameSite: "lax",
      default: () => "auto",
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

  const initialResolvedMode: "light" | "dark" =
    initialValue === "dark"
      ? "dark"
      : initialValue === "light"
        ? "light"
        : colorSchemeHint === "dark"
          ? "dark"
          : "light";

  if (colorMode.value !== initialValue) {
    colorMode.value = initialValue;
  }

  watch(
    () => colorMode.value,
    (value) => {
      if (colorModeCookie.value !== value) {
        colorModeCookie.value = value;
      }
    },
    { immediate: true },
  );

  watch(
    () => colorModeCookie.value,
    (value) => {
      const normalized = value ?? "auto";

      if (value == null) {
        colorModeCookie.value = normalized;
        return;
      }

      if (colorMode.value !== normalized) {
        colorMode.value = normalized;
      }
    },
  );

  const resolvedMode = computed<"light" | "dark">(() => {
    if (colorMode.value === "auto") {
      if (import.meta.server) {
        return initialResolvedMode;
      }

      return colorMode.system.value === "dark" ? "dark" : "light";
    }

    return colorMode.value === "dark" ? "dark" : "light";
  });

  useHead({
    htmlAttrs: computed(() => {
      const isDark = resolvedMode.value === "dark";
      const classes = [isDark ? "dark" : null, `theme--${isDark ? "dark" : "light"}`]
        .filter(Boolean)
        .join(" ");

      return {
        class: classes || undefined,
        "data-theme": isDark ? "dark" : "light",
      };
    }),
  });

  if (import.meta.client) {
    watchEffect(() => {
      const isDark = resolvedMode.value === "dark";
      const classList = document.documentElement.classList;

      classList.toggle("dark", isDark);
      classList.toggle("theme--dark", isDark);
      classList.toggle("theme--light", !isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    });
  }

  return colorMode;
}
