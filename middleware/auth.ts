import { buildLocalizedPath, resolveLocaleFromPath } from "~/lib/i18n/locale-path";
import { useAuthSession } from "~/stores/auth-session";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthSession();
  const authenticated = await auth.initialize();

  if (authenticated || auth.isAuthenticated.value) {
    return;
  }

  const locale = resolveLocaleFromPath(to.path ?? "/");
  const loginPath = buildLocalizedPath("/login", locale);

  if (to.path === loginPath) {
    return;
  }

  const redirectTarget = typeof to.fullPath === "string" ? to.fullPath : to.path;
  auth.setRedirect(redirectTarget);

  return navigateTo({
    path: loginPath,
    query: redirectTarget ? { redirect: redirectTarget } : undefined,
  });
});
