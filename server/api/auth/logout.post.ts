import { clearAuthSession } from '~/server/utils/auth/session'

export default defineEventHandler(async (event) => {
  clearAuthSession(event)

  return {
    success: true,
  }
})
