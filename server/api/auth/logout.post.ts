import { clearSession } from '~/server/utils/auth/session'

export default defineEventHandler(async (event) => {
  clearSession(event)

  return {
    success: true,
  }
})
