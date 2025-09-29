import { createError } from 'h3'
import type { FetchError } from 'ofetch'
import { joinURL } from 'ufo'
import type { MercureTokenEnvelope } from '../../../types/mercure'
import { withAuthHeaders } from '../../utils/auth/session'

function sanitizeBaseEndpoint(raw: string): string {
  return raw.replace(/\/$/, '')
}

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

function resolveErrorMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object') {
    const maybeMessage = (payload as { message?: unknown }).message

    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  return undefined
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const baseEndpoint = sanitizeBaseEndpoint(runtimeConfig.auth?.apiBase ?? 'https://bro-world.org/api')
  const endpoint = joinURL(baseEndpoint, '/v1/mercure/token')

  try {
    const response = await $fetch<MercureTokenEnvelope>(endpoint, {
      method: 'GET',
      headers: withAuthHeaders(event),
    })

    if (!response?.token) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid Mercure token response.',
      })
    }

    return response
  } catch (error) {
    if (isFetchError(error)) {
      const status = error.response?.status ?? 502
      const message = resolveErrorMessage(error.data) ?? 'Unable to mint Mercure token.'

      if (status === 401 || status === 403) {
        throw createError({
          statusCode: status,
          statusMessage: 'Unauthorized Mercure token request',
          data: { message },
        })
      }

      throw createError({
        statusCode: 502,
        statusMessage: 'Mercure token service unavailable',
        data: { message },
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unexpected Mercure token error',
      data: {
        message: error instanceof Error ? error.message : 'Unable to mint Mercure token.',
      },
    })
  }
})
