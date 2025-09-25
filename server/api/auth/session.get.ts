import { clearSession, getSessionToken, getSessionUser } from '~/server/utils/auth/session'
import type { AuthSessionEnvelope } from '~/types/auth'

export default defineEventHandler(async (event) => {
  const token = getSessionToken(event)
  const user = getSessionUser(event)

  if (!token) {
    if (user) {
      clearSession(event)
    }

    const response: AuthSessionEnvelope = {
      authenticated: false,
      user: null,
    }

    return response
  }

  const response: AuthSessionEnvelope = {
    authenticated: true,
    user: user ?? null,
  }

  return response
})
