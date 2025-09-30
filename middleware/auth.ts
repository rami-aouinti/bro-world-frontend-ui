import { useAuthSession } from "~/stores/auth-session";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthSession();
  await auth.initialize();

  if (auth.isAuthenticated.value) {
    return;
  }

  const localePath = useLocalePath();
  const loginPath = localePath("/login");

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
