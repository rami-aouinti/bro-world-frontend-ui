import { createError } from "#imports";
import { ADMIN_ROLE_KEYS } from "~/lib/navigation/sidebar";
import { useAuthSession } from "~/stores/auth-session";

type MiddlewareResult = ReturnType<typeof defineNuxtRouteMiddleware>;

export default defineNuxtRouteMiddleware(async (_to): MiddlewareResult => {
  const auth = useAuthSession();
  await auth.initialize();

  const roles = auth.currentUser.value?.roles ?? [];
  const hasAccess =
    auth.isAuthenticated.value && roles.some((role) => ADMIN_ROLE_KEYS.includes(role));

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

  const localePath = useLocalePath();
  return navigateTo(localePath("/"));
});
