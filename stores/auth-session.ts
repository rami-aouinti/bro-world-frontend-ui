import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#i18n'
import { useRequestFetch } from '#app'
import { useCookie, useState } from '#imports'
import { defineStore } from '~/lib/pinia-shim'
import type { AuthLoginEnvelope, AuthSessionEnvelope, AuthUser } from '~/types/auth'
import type { MercureTokenEnvelope, MercureTokenState } from '~/types/mercure'
import { withSecureCookieOptions } from '~/lib/cookies'

interface LoginCredentials {
  identifier: string
  password: string
}

interface LogoutOptions {
  redirect?: boolean
  redirectTo?: string | null
  notify?: boolean
}

function resolveFetcher() {
  if (import.meta.server) {
    return useRequestFetch()
  }

  const { $api } = useNuxtApp()
  return $api
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { data?: { message?: unknown } }).data?.message

    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }

    const maybeStatus = (error as { response?: { status?: number } }).response?.status

    if (maybeStatus === 429) {
      return 'Too many login attempts. Please try again later.'
    }

    if (maybeStatus === 400 || maybeStatus === 401) {
      return 'We could not verify those credentials. Please try again.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to sign in at this time. Please try again later.'
}

export const useAuthSession = defineStore('auth-session', () => {
  const currentUserState = useState<AuthUser | null>('auth-current-user', () => null)
  const tokenAvailableState = useState<boolean>('auth-token-available', () => false)
  const readyState = useState<boolean>('auth-ready', () => import.meta.server)
  const redirectState = useState<string | null>('auth-redirect-target', () => null)
  const mercureTokenState = useState<MercureTokenState | null>('auth-mercure-token', () => null)
  const sessionTokenState = useState<string | null>('auth-session-token', () => null)

  const loginPendingState = ref(false)
  const loginErrorState = ref<string | null>(null)
  const sessionMessageState = ref<string | null>(null)
  const handlingUnauthorizedState = ref(false)

  const runtimeConfig = useRuntimeConfig()
  const sessionTokenCookie = useCookie<string | null>(
    runtimeConfig.auth?.sessionTokenCookieName ?? 'auth_session_token',
    withSecureCookieOptions({
      sameSite: 'strict',
      watch: false,
    }),
  )
  const presenceCookie = useCookie<string | null>(
    runtimeConfig.auth?.tokenPresenceCookieName ?? 'auth_token_present',
    withSecureCookieOptions({
      sameSite: 'strict',
      watch: false,
    }),
  )
  const userCookie = useCookie<AuthUser | null>(
    runtimeConfig.auth?.userCookieName ?? 'auth_user',
    withSecureCookieOptions({
      sameSite: 'lax',
      watch: false,
    }),
  )

  if (presenceCookie.value === '1') {
    tokenAvailableState.value = true
  }

  if (userCookie.value) {
    currentUserState.value = userCookie.value
  }

  if (sessionTokenCookie.value) {
    sessionTokenState.value = sessionTokenCookie.value
    tokenAvailableState.value = true
  }

  if (import.meta.client) {
    watch(
      currentUserState,
      (value) => {
        userCookie.value = value
      },
      { deep: true },
    )

    watch(tokenAvailableState, (value) => {
      presenceCookie.value = value ? '1' : null
    })

    watch(
      sessionTokenState,
      (value) => {
        sessionTokenCookie.value = value
        tokenAvailableState.value = Boolean(value)
      },
      { immediate: true },
    )
  }

  const currentUser = computed(() => currentUserState.value)
  const isAuthenticated = computed(() => tokenAvailableState.value && Boolean(currentUserState.value))
  const isReady = computed(() => readyState.value)
  const loginError = computed(() => loginErrorState.value)
  const isLoggingIn = computed(() => loginPendingState.value)
  const sessionMessage = computed(() => sessionMessageState.value)
  const mercureToken = computed(() => mercureTokenState.value?.token ?? null)
  const sessionToken = computed(() => sessionTokenState.value)

  function setCurrentUser(user: AuthUser | null) {
    currentUserState.value = user
  }

  function setTokenPresence(present: boolean) {
    tokenAvailableState.value = present
  }

  function setMercureToken(token: MercureTokenState | null) {
    mercureTokenState.value = token
  }

  function setSessionToken(token: string | null) {
    sessionTokenState.value = token
    sessionTokenCookie.value = token
    tokenAvailableState.value = Boolean(token)
  }

  function setSessionMessage(message: string | null) {
    sessionMessageState.value = message
  }

  function clearLoginError() {
    loginErrorState.value = null
  }

  function clearSession() {
    setCurrentUser(null)
    setTokenPresence(false)
    setMercureToken(null)
    setSessionToken(null)
    loginErrorState.value = null
    readyState.value = true

    if (import.meta.client) {
      presenceCookie.value = null
      userCookie.value = null
    }
  }

  function setRedirect(path: string | null) {
    redirectState.value = path
  }

  function consumeRedirect(): string | null {
    const target = redirectState.value
    redirectState.value = null
    return target
  }

  function consumeSessionMessage(): string | null {
    const message = sessionMessageState.value
    sessionMessageState.value = null
    return message
  }

  function resolveMercureExpiry(payload: MercureTokenEnvelope): number | null {
    if (payload.expiresAt) {
      const parsed = Date.parse(payload.expiresAt)

      if (Number.isFinite(parsed)) {
        return parsed
      }
    }

    if (typeof payload.expiresIn === 'number' && Number.isFinite(payload.expiresIn)) {
      return Date.now() + Math.max(0, payload.expiresIn) * 1000
    }

    return null
  }

  function persistMercureToken(payload: MercureTokenEnvelope | null) {
    if (!payload || !payload.token) {
      setMercureToken(null)
      return null
    }

    const expiresAt = resolveMercureExpiry(payload)
    const state: MercureTokenState = {
      token: payload.token,
      expiresAt,
    }

    setMercureToken(state)

    return state
  }

  async function fetchMercureToken(): Promise<MercureTokenState | null> {
    if (!tokenAvailableState.value) {
      setMercureToken(null)
      return null
    }

    const fetcher = resolveFetcher()

    try {
      const response = await fetcher<MercureTokenEnvelope>('/mercure/token', {
        method: 'GET',
        context: {
          suppressErrorNotification: true,
        },
      })

      if (!response?.token) {
        setMercureToken(null)
        return null
      }

      return persistMercureToken(response)
    } catch (error) {
      console.error('Failed to fetch Mercure token', error)
      setMercureToken(null)
      return null
    }
  }

  async function refreshSession() {
    if (import.meta.server) {
      readyState.value = true
      return isAuthenticated.value
    }

    if (!tokenAvailableState.value && presenceCookie.value === '1') {
      tokenAvailableState.value = true
    }

    const fetcher = resolveFetcher()

    try {
      const response = await fetcher<AuthSessionEnvelope>('/auth/session', {
        method: 'GET',
        context: {
          suppressErrorNotification: true,
        },
      })

      if (response?.authenticated && response.user) {
        setCurrentUser(response.user)
        setTokenPresence(true)
        readyState.value = true
        await fetchMercureToken()
        return true
      }

      clearSession()
      readyState.value = true
      return false
    } catch (error) {
      console.error('Failed to refresh auth session', error)
      clearSession()
      readyState.value = true
      return false
    }
  }

  async function initialize() {
    if (readyState.value && import.meta.client) {
      return isAuthenticated.value
    }

    return refreshSession()
  }

  async function login(credentials: LoginCredentials) {
    const trimmedIdentifier = credentials.identifier.trim()
    const trimmedPassword = credentials.password.trim()

    if (!trimmedIdentifier || !trimmedPassword) {
      loginErrorState.value = 'Please provide both your email or username and password.'
      return false
    }

    loginPendingState.value = true
    loginErrorState.value = null

    const fetcher = resolveFetcher()

    try {
      const response = await fetcher<AuthLoginEnvelope>('/auth/login', {
        method: 'POST',
        body: {
          identifier: trimmedIdentifier,
          password: trimmedPassword,
        },
        context: {
          suppressErrorNotification: true,
        },
      })

      if (!response?.user || !response?.token) {
        loginErrorState.value = 'Unable to sign in at this time. Please try again later.'
        return false
      }

      setCurrentUser(response.user)
      setTokenPresence(true)
      setSessionToken(response.token)
      readyState.value = true
      sessionMessageState.value = null

      await fetchMercureToken()

      return true
    } catch (error) {
      const message = extractErrorMessage(error)
      loginErrorState.value = message
      return false
    } finally {
      loginPendingState.value = false
    }
  }

  async function logout(options: LogoutOptions = {}) {
    const { redirect = true, redirectTo = null, notify = true } = options
    const fetcher = resolveFetcher()
    const { t } = useI18n()
    const { $notify } = useNuxtApp()

    try {
      await fetcher('/auth/logout', {
        method: 'POST',
        context: {
          suppressErrorNotification: true,
        },
      })
    } catch (error) {
      console.warn('Failed to call logout endpoint', error)
    } finally {
      clearSession()
    }

    if (notify) {
      $notify({
        type: 'success',
        title: t('auth.successTitle'),
        message: t('auth.logoutMessage'),
      })
    }

    if (redirect && import.meta.client) {
      const router = useRouter()
      const localePath = useLocalePath()
      const target = redirectTo ?? localePath('/login')

      if (router.currentRoute.value.fullPath !== target) {
        await router.push(target)
      }
    }
  }

  async function handleUnauthorized(message?: string) {
    if (handlingUnauthorizedState.value) {
      return
    }

    handlingUnauthorizedState.value = true

    try {
      const fallbackMessage = 'Your session has expired. Please sign in again.'
      sessionMessageState.value = message ?? fallbackMessage

      const router = useRouter()
      const localePath = useLocalePath()
      const currentRoute = router.currentRoute.value

      if (currentRoute?.fullPath) {
        setRedirect(currentRoute.fullPath)
      }

      await logout({ redirect: false, notify: false })

      const redirectTarget = currentRoute?.fullPath ?? consumeRedirect()
      const loginRoute = localePath('/login')
      const query = redirectTarget ? { redirect: redirectTarget } : undefined

      await router.push({ path: loginRoute, query })
    } finally {
      handlingUnauthorizedState.value = false
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
  }
})
