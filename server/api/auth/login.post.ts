import { createError, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import { joinURL } from 'ufo'
import type { AuthLoginResponse, AuthUser } from '~/types/auth'
import { clearAuthSession, setSession } from '~/server/utils/auth/session'

interface LoginRequestBody {
  identifier?: string
  username?: string
  password?: string
}

function sanitizeBaseEndpoint(raw: string): string {
  return raw.replace(/\/$/, '')
}

function resolveIdentifier(body: LoginRequestBody): string {
  return (body.identifier ?? body.username ?? '').trim()
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequestBody>(event)
  const identifier = resolveIdentifier(body)
  const password = (body.password ?? '').trim()

  if (!identifier || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials',
      data: {
        message: 'Please provide both your email or username and password.',
      },
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const baseEndpoint = sanitizeBaseEndpoint(runtimeConfig.auth?.apiBase ?? 'https://bro-world.org/api')
  const endpoint = joinURL(baseEndpoint, '/v1/auth/login')

  try {
    const response = await $fetch<AuthLoginResponse>(endpoint, {
      method: 'POST',
      body: {
        identifier,
        username: identifier,
        password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response?.token || !response?.profile) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid authentication response.',
      })
    }

    const profile = response.profile as AuthUser

    setSession(event, response.token, profile)

    return {
      user: profile,
    }
  } catch (error) {
    if (isFetchError(error)) {
      const status = error.response?.status ?? 500
      const message = resolveLoginErrorMessage(status, error.data)

      if (status === 401 || status === 400 || status === 429) {
        throw createError({
          statusCode: status,
          statusMessage: 'Unable to sign in',
          data: { message },
        })
      }

      clearAuthSession(event)

      throw createError({
        statusCode: 502,
        statusMessage: 'Authentication service unavailable',
        data: {
          message,
        },
      })
    }

    clearAuthSession(event)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unexpected authentication error',
      data: {
        message: error instanceof Error ? error.message : 'Unexpected error while signing in.',
      },
    })
  }
})

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

function resolveLoginErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
    return payload.message
  }

  if (status === 429) {
    return 'Too many login attempts. Please try again later.'
  }

  if (status === 400 || status === 401) {
    return 'We could not verify those credentials. Please try again.'
  }

  return 'Unable to sign in at this time. Please try again later.'
}
