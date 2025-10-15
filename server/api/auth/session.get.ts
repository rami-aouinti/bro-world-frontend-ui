import {
  clearAuthSession,
  getSessionToken,
  getSessionUser,
  setSession,
} from "../../utils/auth/session";
import type { AuthSessionEnvelope } from "../../../types/auth";
import { readCachedSessionUser } from "../../utils/auth/user-cache";

export default defineEventHandler(async (event) => {
  const token = getSessionToken(event);
  let user = getSessionUser(event);

  if (!token) {
    if (user) {
      clearAuthSession(event);
    }

    const response: AuthSessionEnvelope = {
      authenticated: false,
      user: null,
    };

    return response;
  }

  if (token && !user) {
    const cached = await readCachedSessionUser(event, token);

    if (cached) {
      setSession(event, token, cached);
      user = cached;
    }
  }

  const response: AuthSessionEnvelope = {
    authenticated: true,
    user: user ?? null,
  };

  return response;
});
