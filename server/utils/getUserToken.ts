import type { H3Event } from "h3"
import { getSessionToken, requireSessionToken, waitForSessionToken } from "~/server/utils/auth/session"

export async function getUserToken(event: H3Event) {
  const immediateToken = getSessionToken(event)

  if (immediateToken) {
    return immediateToken
  }

  const deferredToken = await waitForSessionToken(event)

  if (deferredToken) {
    return deferredToken
  }

  return requireSessionToken(event)
}
