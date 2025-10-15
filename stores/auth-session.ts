import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { Router } from "vue-router";
import {
  useCookie,
  useNuxtApp,
  useRequestHeaders,
  useRuntimeConfig,
  useState,
} from "#imports";
import { buildLocalizedPath, resolveLocaleFromPath } from "~/lib/i18n/locale-path";
import { defineStore } from "~/lib/pinia-shim";
import type { AuthLoginEnvelope, AuthUser } from "~/types/auth";
import type { MercureTokenEnvelope, MercureTokenState } from "~/types/mercure";
import { withSecureCookieOptions } from "~/lib/cookies";
import { createApiFetcher, type ApiRequestOptions } from "~/lib/api/http-client";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import axios from "axios";

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LogoutOptions {
  redirect?: boolean;
  redirectTo?: string | null;
  notify?: boolean;
}

type Fetcher = <T>(request: string, options?: ApiRequestOptions) => Promise<T>;

function resolveFetcher(): Fetcher {
  if (import.meta.server) {
    const runtimeConfig = useRuntimeConfig();
    const baseURL =
      (runtimeConfig.auth?.apiBase as string | undefined)?.trim() ||
      (runtimeConfig.public?.apiBase as string | undefined)?.trim() ||
      "/api";
    const forwardedHeaders = useRequestHeaders(["cookie", "authorization"]);
    const client = axios.create({
      baseURL,
      withCredentials: true,
    });

    client.interceptors.request.use((config) => {
      const headers = { ...(config.headers ?? {}) };

      if (forwardedHeaders.cookie && !headers.Cookie) {
        headers.Cookie = forwardedHeaders.cookie;
      }

      if (forwardedHeaders.authorization && !headers.Authorization) {
        headers.Authorization = forwardedHeaders.authorization;
      }

      config.headers = headers;

      return config;
    });

    return createApiFetcher(client);
  }

  return resolveApiFetcher();
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybeMessage = (error as { data?: { message?: unknown } }).data?.message;

    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeStatus = (error as { response?: { status?: number } }).response?.status;

    if (maybeStatus === 429) {
      return "Too many login attempts. Please try again later.";
    }

    if (maybeStatus === 400 || maybeStatus === 401) {
      return "We could not verify those credentials. Please try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in at this time. Please try again later.";
}

export const useAuthSession = defineStore("auth-session", () => {
  const currentUserState = useState<AuthUser | null>("auth-current-user", () => null);
  const tokenAvailableState = useState<boolean>("auth-token-available", () => false);
  const readyState = useState<boolean>("auth-ready", () => import.meta.server);
  const redirectState = useState<string | null>("auth-redirect-target", () => null);
  const mercureTokenState = useState<MercureTokenState | null>("auth-mercure-token", () => null);
  const sessionTokenState = useState<string | null>("auth-session-token", () => null);

  const loginPendingState = ref(false);
  const loginErrorState = ref<string | null>(null);
  const sessionMessageState = ref<string | null>(null);
  const handlingUnauthorizedState = ref(false);

  const nuxtApp = useNuxtApp();

  function translate(key: string) {
    return nuxtApp.$i18n?.t?.(key) ?? key;
  }

  function resolveRouter(): Router | null {
    const injectedRouter = nuxtApp.$router as Router | undefined;

    if (injectedRouter) {
      return injectedRouter;
    }

    if (!import.meta.client) {
      return null;
    }

    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  const runtimeConfig = useRuntimeConfig();
  const privateAuthConfig = import.meta.server ? (runtimeConfig.auth ?? {}) : {};
  const publicAuthConfig = runtimeConfig.public?.auth ?? {};
  const sessionTokenCookieName =
    (privateAuthConfig.sessionTokenCookieName as string | undefined) ??
    publicAuthConfig.sessionTokenCookieName ??
    "auth_session_token";
  const tokenPresenceCookieName =
    (privateAuthConfig.tokenPresenceCookieName as string | undefined) ??
    publicAuthConfig.tokenPresenceCookieName ??
    "auth_token_present";
  const userCookieName =
    (privateAuthConfig.userCookieName as string | undefined) ??
    publicAuthConfig.userCookieName ??
    "auth_user";
  type AuthUserCookie = Pick<
    AuthUser,
    "id" | "username" | "email" | "firstName" | "lastName" | "photo" | "roles" | "enabled"
  >;
  const sessionTokenCookie = useCookie<string | null>(
    sessionTokenCookieName,
    withSecureCookieOptions({
      sameSite: "strict",
      watch: false,
    }),
  );
  const presenceCookie = useCookie<string | null>(
    tokenPresenceCookieName,
    withSecureCookieOptions({
      sameSite: "strict",
      watch: false,
    }),
  );
  const userCookie = useCookie<AuthUserCookie | null>(
    userCookieName,
    withSecureCookieOptions({
      sameSite: "lax",
      watch: false,
    }),
  );

  if (presenceCookie.value === "1") {
    tokenAvailableState.value = true;
  }

  function sanitizeUserForCookie(user: AuthUser | null): AuthUserCookie | null {
    if (!user) {
      return null;
    }

    const payload: Partial<AuthUserCookie> = {};
    const fields: (keyof AuthUserCookie)[] = [
      "id",
      "username",
      "email",
      "firstName",
      "lastName",
      "photo",
      "roles",
      "enabled",
    ];

    for (const key of fields) {
      const value = user[key];

      if (value !== undefined) {
        payload[key] = value;
      }
    }

    return payload as AuthUserCookie;
  }

  if (userCookie.value) {
    currentUserState.value = userCookie.value as AuthUser;
  }

  if (sessionTokenCookie.value) {
    sessionTokenState.value = sessionTokenCookie.value;
    tokenAvailableState.value = true;
  }

  if (import.meta.client && !sessionTokenState.value && sessionTokenCookie.value) {
    sessionTokenState.value = sessionTokenCookie.value;
    tokenAvailableState.value = true;
  }

  if (import.meta.client) {
    watch(
      currentUserState,
      (value) => {
        userCookie.value = sanitizeUserForCookie(value);
      },
      { deep: true },
    );

    watch(tokenAvailableState, (value) => {
      presenceCookie.value = value ? "1" : null;
    });

    watch(
      sessionTokenState,
      (value) => {
        sessionTokenCookie.value = value;
        tokenAvailableState.value = Boolean(value);
      },
      { immediate: true },
    );
  }

  const currentUser = computed(() => currentUserState.value);
  const isAuthenticated = computed(
    () => tokenAvailableState.value && Boolean(currentUserState.value),
  );
  const isReady = computed(() => readyState.value);
  const loginError = computed(() => loginErrorState.value);
  const isLoggingIn = computed(() => loginPendingState.value);
  const sessionMessage = computed(() => sessionMessageState.value);
  const mercureToken = computed(() => mercureTokenState.value?.token ?? null);
  const sessionToken = computed(() => sessionTokenState.value);

  function setCurrentUser(user: AuthUser | null) {
    currentUserState.value = user;
  }

  function setTokenPresence(present: boolean) {
    tokenAvailableState.value = present;
  }

  function setMercureToken(token: MercureTokenState | null) {
    mercureTokenState.value = token;
  }

  function setSessionToken(token: string | null) {
    sessionTokenState.value = token;
    sessionTokenCookie.value = token;
    tokenAvailableState.value = Boolean(token);
  }

  function setSessionMessage(message: string | null) {
    sessionMessageState.value = message;
  }

  function clearLoginError() {
    loginErrorState.value = null;
  }

  function clearSession() {
    setCurrentUser(null);
    setTokenPresence(false);
    setMercureToken(null);
    setSessionToken(null);
    loginErrorState.value = null;
    readyState.value = true;

    if (import.meta.client) {
      presenceCookie.value = null;
      userCookie.value = null;
    }
  }

  function setRedirect(path: string | null) {
    redirectState.value = path;
  }

  function consumeRedirect(): string | null {
    const target = redirectState.value;
    redirectState.value = null;
    return target;
  }

  function consumeSessionMessage(): string | null {
    const message = sessionMessageState.value;
    sessionMessageState.value = null;
    return message;
  }

  function resolveMercureExpiry(payload: MercureTokenEnvelope): number | null {
    if (payload.expiresAt) {
      const parsed = Date.parse(payload.expiresAt);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    if (typeof payload.expiresIn === "number" && Number.isFinite(payload.expiresIn)) {
      return Date.now() + Math.max(0, payload.expiresIn) * 1000;
    }

    return null;
  }

  function persistMercureToken(payload: MercureTokenEnvelope | null) {
    if (!payload || !payload.token) {
      setMercureToken(null);
      return null;
    }

    const expiresAt = resolveMercureExpiry(payload);
    const state: MercureTokenState = {
      token: payload.token,
      expiresAt,
    };

    setMercureToken(state);

    return state;
  }

  async function fetchMercureToken(): Promise<MercureTokenState | null> {
    if (!tokenAvailableState.value) {
      setMercureToken(null);
      return null;
    }

    try {
      const responseFetcher = resolveFetcher();
      const response = await responseFetcher<MercureTokenEnvelope>("/api/mercure/token", {
        method: "GET",
        context: {
          suppressErrorNotification: true,
          isPrivate: true,
        },
      });

      if (!response?.token) {
        setMercureToken(null);
        return null;
      }

      return persistMercureToken(response);
    } catch (error) {
      console.error("Failed to fetch Mercure token", error);
      setMercureToken(null);
      return null;
    }
  }

  async function refreshSession() {
    if (!tokenAvailableState.value && presenceCookie.value === "1") {
      tokenAvailableState.value = true;
    }

    const hasSessionToken = Boolean(sessionTokenState.value);
    const hasCurrentUser = Boolean(currentUserState.value);

    if (!hasCurrentUser && userCookie.value) {
      setCurrentUser(userCookie.value as AuthUser);
    }

    if (hasSessionToken || sessionTokenCookie.value) {
      const resolvedToken = sessionTokenState.value ?? sessionTokenCookie.value;

      if (resolvedToken && !hasSessionToken) {
        sessionTokenState.value = resolvedToken;
      }

      setTokenPresence(Boolean(resolvedToken));

      readyState.value = true;
      await fetchMercureToken();

      return Boolean(currentUserState.value);
    }

    clearSession();
    readyState.value = true;
    return false;
  }

  async function initialize() {
    // During client hydration we may have an authenticated session cookie without a
    // hydrated user state (for example if the session cookies were set by the
    // server). In that case we should refresh the session even if the store was
    // previously marked as ready so we can recover the current user information.
    if (import.meta.client && readyState.value && isAuthenticated.value) {
      return true;
    }

    return refreshSession();
  }

  async function login(credentials: LoginCredentials) {
    const trimmedIdentifier = credentials.identifier.trim();
    const password = credentials.password;
    const hasPassword = password.length > 0;

    if (!trimmedIdentifier || !hasPassword) {
      loginErrorState.value = "Please provide both your email or username and password.";
      return false;
    }

    loginPendingState.value = true;
    loginErrorState.value = null;

    const fetcher = resolveFetcher();

    try {
      const payload = new URLSearchParams();
      payload.set("identifier", trimmedIdentifier);
      payload.set("password", password);

      if (trimmedIdentifier.includes("@")) {
        payload.set("email", trimmedIdentifier);
      } else {
        payload.set("username", trimmedIdentifier);
      }

      const response = await fetcher<AuthLoginEnvelope>("/auth/login", {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        context: {
          suppressErrorNotification: true,
        },
      });

      const user = response?.user ?? response?.profile;

      if (!user || !response?.token) {
        loginErrorState.value = "Unable to sign in at this time. Please try again later.";
        return false;
      }

      setCurrentUser(user);
      setTokenPresence(true);
      setSessionToken(response.token);
      readyState.value = true;
      sessionMessageState.value = null;

      await fetchMercureToken();

      return true;
    } catch (error) {
      const message = extractErrorMessage(error);
      loginErrorState.value = message;
      return false;
    } finally {
      loginPendingState.value = false;
    }
  }

  async function logout(options: LogoutOptions = {}) {
    const { redirect = true, redirectTo = null, notify = true } = options;
    const fetcher = resolveFetcher();
    const { $notify } = useNuxtApp();

    try {
      await fetcher("/auth/logout", {
        method: "POST",
        context: {
          suppressErrorNotification: true,
        },
      });
    } catch (error) {
      console.warn("Failed to call logout endpoint", error);
    } finally {
      clearSession();
    }

    if (notify) {
      $notify({
        type: "success",
        title: translate("auth.successTitle"),
        message: translate("auth.logoutMessage"),
      });
    }

    if (redirect && import.meta.client) {
      const router = useRouter();
      const currentRoute = router.currentRoute.value;
      const currentPath =
        typeof currentRoute?.path === "string"
          ? currentRoute.path
          : (currentRoute?.fullPath ?? "/");
      const locale = resolveLocaleFromPath(currentPath);
      const target = redirectTo ?? buildLocalizedPath("/login", locale);

      if (currentRoute?.fullPath !== target) {
        await router.push(target);
      }
    }
  }

  async function handleUnauthorized(message?: string) {
    if (handlingUnauthorizedState.value) {
      return;
    }

    handlingUnauthorizedState.value = true;

    try {
      const fallbackMessage = "Your session has expired. Please sign in again.";
      sessionMessageState.value = message ?? fallbackMessage;

      const router = resolveRouter();
      const currentRoute = router?.currentRoute?.value;

      if (currentRoute?.fullPath) {
        setRedirect(currentRoute.fullPath);
      }

      const existingRedirect = redirectState.value;

      await logout({ redirect: false, notify: false });

      const redirectTarget = currentRoute?.fullPath ?? existingRedirect ?? null;
      const resolvedPath =
        typeof currentRoute?.path === "string" ? currentRoute.path : redirectTarget;
      const locale = resolveLocaleFromPath(resolvedPath ?? "/");
      const loginRoute = buildLocalizedPath("/login", locale);
      const query = redirectTarget ? { redirect: redirectTarget } : undefined;

      if (!router) {
        if (redirectTarget) {
          setRedirect(redirectTarget);
        }

        return;
      }

      await router.push({ path: loginRoute, query });
    } finally {
      handlingUnauthorizedState.value = false;
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isReady,
    isLoggingIn,
    loginError,
    sessionMessage,
    redirectAfterLogin: computed(() => redirectState.value),
    mercureToken,
    sessionToken,
    setCurrentUser,
    setRedirect,
    consumeRedirect,
    consumeSessionMessage,
    clearSession,
    initialize,
    refreshSession,
    refreshMercureToken: fetchMercureToken,
    login,
    logout,
    handleUnauthorized,
    setSessionMessage,
    clearLoginError,
  };
});
