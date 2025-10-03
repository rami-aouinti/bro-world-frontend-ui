import { watchEffect } from "vue";
import { useColorMode } from "@vueuse/core";
import { useCookie } from "#imports";
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

  if (import.meta.client) {
    watchEffect(() => {
      const resolvedMode = colorMode.value === "auto" ? colorMode.system.value : colorMode.value;
      const isDark = resolvedMode === "dark";
      const classList = document.documentElement.classList;

      classList.toggle("dark", isDark);
      classList.toggle("theme--dark", isDark);
    });
  }

  return colorMode;
}
