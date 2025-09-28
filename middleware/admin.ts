import { useAuthSession } from "~/stores/auth-session";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthSession();
  await auth.initialize();

  const roles = auth.currentUser.value?.roles ?? [];
  const isAdmin = Array.isArray(roles) && roles.includes("admin");

  if (isAdmin) {
    return;
  }

  const localePath = useLocalePath();
  const redirectTarget = localePath("/");

  auth.setSessionMessage("You need administrator rights to access that page.");

  return navigateTo(redirectTarget);
});
