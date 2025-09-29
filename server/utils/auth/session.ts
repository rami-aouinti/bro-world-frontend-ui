import { deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'
import type { AuthUser } from '../../../types/auth'
import { shouldUseSecureCookies, withSecureCookieOptions } from '../../../lib/cookies'

interface SessionCookiesConfig {
  tokenCookieName: string
  userCookieName: string
  tokenPresenceCookieName: string
  maxAge: number
}

function resolveCookiesConfig(event: H3Event): SessionCookiesConfig {
  const runtimeConfig = useRuntimeConfig(event)
  const authConfig = runtimeConfig.auth ?? {}

  const maxAgeEnv = Number.parseInt(authConfig.sessionMaxAge ?? '', 10)
  const fallbackMaxAge = 60 * 60 * 24 * 7 // 7 days
  const maxAge = Number.isFinite(maxAgeEnv) && maxAgeEnv > 0 ? maxAgeEnv : fallbackMaxAge

  return {
    tokenCookieName: authConfig.tokenCookieName ?? 'auth_token',
    userCookieName: authConfig.userCookieName ?? 'auth_user',
    tokenPresenceCookieName: authConfig.tokenPresenceCookieName ?? 'auth_token_present',
    maxAge,
  }
}

export function getSessionToken(event: H3Event): string | null {
  const { tokenCookieName } = resolveCookiesConfig(event)
  return getCookie(event, tokenCookieName) ?? null
}

export function getSessionUser(event: H3Event): AuthUser | null {
  const { userCookieName } = resolveCookiesConfig(event)
  const raw = getCookie(event, userCookieName)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch (error) {
    console.warn('Unable to parse auth user cookie', error)
    return null
  }
}

export function setSession(event: H3Event, token: string, user: AuthUser) {
  const { tokenCookieName, userCookieName, tokenPresenceCookieName, maxAge } = resolveCookiesConfig(event)
  const secure = shouldUseSecureCookies(event)

  setCookie(
    event,
    tokenCookieName,
    token,
    withSecureCookieOptions(
      {
        httpOnly: true,
        sameSite: 'lax',
        maxAge,
      },
      event,
    ),
  )

  setCookie(
    event,
    userCookieName,
    JSON.stringify(user),
    withSecureCookieOptions(
      {
        httpOnly: false,
        sameSite: 'lax',
        maxAge,
        secure,
      },
      event,
    ),
  )

  setCookie(
    event,
    tokenPresenceCookieName,
    '1',
    withSecureCookieOptions(
      {
        httpOnly: false,
        sameSite: 'strict',
        maxAge,
        secure,
      },
      event,
    ),
  )
}

export function clearAuthSession(event: H3Event) {
  const { tokenCookieName, userCookieName, tokenPresenceCookieName } = resolveCookiesConfig(event)

  deleteCookie(event, tokenCookieName, { path: '/' })
  deleteCookie(event, userCookieName, { path: '/' })
  deleteCookie(event, tokenPresenceCookieName, { path: '/' })
}

export function withAuthHeaders(event: H3Event, headers: Record<string, string> = {}) {
  const token = getSessionToken(event)

  if (!token) {
    return headers
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}
