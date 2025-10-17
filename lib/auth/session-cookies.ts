import { computed, ref } from "vue";
import { useCookie, useRuntimeConfig } from "#imports";
import type { CookieRef } from "nuxt/app";
import { withSecureCookieOptions } from "~/lib/cookies";
import { buildAuthUserCookie, type AuthUserCookie } from "~/lib/auth/user-cookie";
import type { AuthUser } from "~/types/auth";

export interface AuthCookieNames {
  session: string;
  presence: string;
  user: string;
}

interface SessionCookieRefs {
  session: CookieRef<string | null>;
  presence: CookieRef<string | null>;
  user: CookieRef<AuthUserCookie | null>;
}

interface SetTokenOptions {
  preservePresence?: boolean;
}

function resolveRuntimeAuthConfig() {
  const runtimeConfig = useRuntimeConfig();
  const privateAuthConfig = import.meta.server ? (runtimeConfig.auth ?? {}) : {};
  const publicAuthConfig = runtimeConfig.public?.auth ?? {};

  return { privateAuthConfig, publicAuthConfig };
}

export function resolveAuthCookieNames(): AuthCookieNames {
  const { privateAuthConfig, publicAuthConfig } = resolveRuntimeAuthConfig();

  return {
    session:
      (privateAuthConfig.sessionTokenCookieName as string | undefined) ??
      publicAuthConfig.sessionTokenCookieName ??
      "auth_session_token",
    presence:
      (privateAuthConfig.tokenPresenceCookieName as string | undefined) ??
      publicAuthConfig.tokenPresenceCookieName ??
      "auth_token_present",
    user:
      (privateAuthConfig.userCookieName as string | undefined) ??
      publicAuthConfig.userCookieName ??
      "auth_user",
  };
}

function createCookieRefs(names: AuthCookieNames): SessionCookieRefs {
  return {
    session: useCookie<string | null>(
      names.session,
      withSecureCookieOptions({
        sameSite: "strict",
        watch: false,
      }),
    ),
    presence: useCookie<string | null>(
      names.presence,
      withSecureCookieOptions({
        sameSite: "strict",
        watch: false,
      }),
    ),
    user: useCookie<AuthUserCookie | null>(
      names.user,
      withSecureCookieOptions({
        sameSite: "lax",
        watch: false,
      }),
    ),
  };
}

export function sanitizeAuthToken(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function escapeCookieName(name: string): string {
  return name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

function readDocumentCookie(name: string): string | null {
  if (!import.meta.client || typeof document === "undefined") {
    return null;
  }

  const pattern = new RegExp(`(?:^|;\\s*)${escapeCookieName(name)}=([^;]*)`);
  const match = document.cookie.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isAuthUserCookie(value: unknown): value is AuthUserCookie {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === "string" &&
    typeof payload.username === "string" &&
    typeof payload.email === "string"
  );
}

function normalizeUserCookie(value: unknown): AuthUserCookie | null {
  if (!value) {
    return null;
  }

  if (isAuthUserCookie(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return normalizeUserCookie(parsed);
    } catch (error) {
      console.error("Failed to parse auth user cookie", error);
      return null;
    }
  }

  return null;
}

function serializeUserCookie(user: AuthUser | AuthUserCookie | null): AuthUserCookie | null {
  if (!user) {
    return null;
  }

  if (isAuthUserCookie(user)) {
    return user;
  }

  return buildAuthUserCookie(user);
}

export function useSessionCookies() {
  const names = resolveAuthCookieNames();
  const refs = createCookieRefs(names);
  const initialized = ref(false);
  const token = ref<string | null>(null);
  const hasPresence = ref(false);
  const user = ref<AuthUserCookie | null>(null);

  function hydrateFromCookies() {
    const sanitizedToken = sanitizeAuthToken(refs.session.value);
    token.value = sanitizedToken;
    hasPresence.value = refs.presence.value === "1" || Boolean(sanitizedToken);
    user.value = normalizeUserCookie(refs.user.value);
    initialized.value = true;
  }

  hydrateFromCookies();

  function ensureInitialized() {
    if (!initialized.value) {
      hydrateFromCookies();
    }
  }

  function commit() {
    ensureInitialized();
    refs.session.value = token.value;
    refs.presence.value = hasPresence.value ? "1" : null;
    refs.user.value = user.value;
  }

  function setToken(value: string | null, options: SetTokenOptions = {}) {
    ensureInitialized();
    const sanitized = sanitizeAuthToken(value);
    token.value = sanitized;

    if (!options.preservePresence) {
      hasPresence.value = Boolean(sanitized);
    }

    commit();
  }

  function setTokenPresence(present: boolean) {
    ensureInitialized();
    hasPresence.value = present;
    commit();
  }

  function setUser(value: AuthUser | AuthUserCookie | null) {
    ensureInitialized();
    user.value = serializeUserCookie(value);
    commit();
  }

  function clear() {
    token.value = null;
    hasPresence.value = false;
    user.value = null;
    commit();
  }

  function syncFromDocument() {
    if (!import.meta.client) {
      return;
    }

    const rawToken = readDocumentCookie(names.session);
    refs.session.value = rawToken ?? null;

    const rawPresence = readDocumentCookie(names.presence);
    refs.presence.value = rawPresence ?? null;

    const rawUser = readDocumentCookie(names.user);

    if (!rawUser) {
      refs.user.value = null;
    } else {
      refs.user.value = normalizeUserCookie(rawUser);
    }

    hydrateFromCookies();
  }

  return {
    names,
    token,
    hasPresence,
    user,
    hasPresenceCookie: computed(() => refs.presence.value === "1"),
    syncFromDocument,
    hydrateFromCookies,
    setToken,
    setTokenPresence,
    setUser,
    clear,
  };
}
