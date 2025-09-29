import type { CookieOptions } from 'nuxt/app'
import type { H3Event } from 'h3'
import { useRequestEvent } from '#app'

type MaybeEvent = H3Event | null | undefined

type MaybeEncryptedSocket = { encrypted?: boolean }

function isEventSecure(event: H3Event): boolean {
  const forwardedProto = event.node.req.headers['x-forwarded-proto']

  if (typeof forwardedProto === 'string' && forwardedProto.trim()) {
    const [first] = forwardedProto.split(',')

    if (first) {
      return first.trim().toLowerCase() === 'https'
    }
  }

  const schemeHeader = event.node.req.headers[':scheme']

  if (typeof schemeHeader === 'string' && schemeHeader.trim()) {
    return schemeHeader.trim().toLowerCase() === 'https'
  }

  const socket = event.node.req.socket as MaybeEncryptedSocket | undefined
  const connection = event.node.req.connection as MaybeEncryptedSocket | undefined

  if (socket && typeof socket.encrypted === 'boolean') {
    return socket.encrypted
  }

  if (connection && typeof connection.encrypted === 'boolean') {
    return connection.encrypted
  }

  return process.env.NODE_ENV === 'production'
}

export function shouldUseSecureCookies(event?: MaybeEvent): boolean {
  let targetEvent = event ?? null

  if (!targetEvent && import.meta.server) {
    try {
      targetEvent = useRequestEvent()
    } catch (error) {
      targetEvent = null
    }
  }

  if (targetEvent) {
    return isEventSecure(targetEvent)
  }

  if (import.meta.client && typeof window !== 'undefined' && window.location) {
    return window.location.protocol === 'https:'
  }

  return process.env.NODE_ENV === 'production'
}

export function withSecureCookieOptions<T>(
  options?: CookieOptions<T>,
  event?: MaybeEvent,
): CookieOptions<T> {
  const resolved: CookieOptions<T> = {
    ...(options ?? {}),
  }

  if (typeof resolved.secure !== 'boolean') {
    resolved.secure = shouldUseSecureCookies(event)
  }

  if (!resolved.path) {
    resolved.path = '/'
  }

  return resolved
}
