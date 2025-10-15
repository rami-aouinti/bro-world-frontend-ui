import { createError } from "#imports";
import { buildLocalizedPath, resolveLocaleFromPath } from "~/lib/i18n/locale-path";
import { ADMIN_ROLE_KEYS } from "~/lib/navigation/sidebar";
import { useAuthSession } from "~/stores/auth-session";

type MiddlewareResult = ReturnType<typeof defineNuxtRouteMiddleware>;

export default defineNuxtRouteMiddleware(async (to): MiddlewareResult => {
  const auth = useAuthSession();
  const authenticated = await auth.initialize();

  const roles = auth.currentUser.value?.roles ?? [];
  const hasAccess =
    (authenticated || auth.isAuthenticated.value) &&
    roles.some((role) => ADMIN_ROLE_KEYS.includes(role));

  if (hasAccess) {
    return;
  }

  if (import.meta.server) {
    return abortNavigation(
      createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      }),
    );
  }

  const locale = resolveLocaleFromPath(to.path ?? "/");
  return navigateTo(buildLocalizedPath("/", locale));
});
