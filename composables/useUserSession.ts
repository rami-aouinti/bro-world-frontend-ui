import { useAuthSession } from "~/stores/auth-session";

export function useUserSession() {
  return useAuthSession();
}

export default useUserSession;
